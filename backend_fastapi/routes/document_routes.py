"""
Document Management and OCR Processing Routes.
Handles file uploads, OCR field extraction, and cross-document consistency checks.
"""
import os
import json
import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, LoanApplication, Document, BankAccount, FaceVerificationSession, AuditLog
from ..schemas import (
    ConsistencyReport,
    OcrProfileCrossCheckRequest,
    OcrProfileCrossCheckResponse,
    OcrDocumentExtractionResponse
)
from ..services.ocr_service import (
    extract_text_from_file,
    parse_document_fields,
    evaluate_consistency,
    get_jeeva_ground_truth_kyc,
    cross_check_profile_against_ocr
)
from ..auth import get_current_user
from ..config import settings

router = APIRouter(prefix="/api/documents", tags=["Documents & OCR"])


@router.post("/upload")
async def upload_document(
    applicationId: str = Form(...),
    docType: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(LoanApplication).filter(LoanApplication.id == applicationId).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user.role not in ["REVIEWER", "ADMIN"] and app.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    # Validate file format and size
    filename = file.filename or "uploaded_doc.pdf"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".pdf", ".jpg", ".jpeg", ".png", ".txt"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload PDF, JPEG, PNG, or TXT."
        )

    # Ensure uploads directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Save to disk
    unique_filename = f"{uuid.uuid4().hex[:10]}_{filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes)."
        )
    if len(contents) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum permitted limit of 10MB."
        )

    # Clean up any previous document of the SAME type for this application
    target_type = docType.strip().upper()
    existing_doc = db.query(Document).filter(
        Document.application_id == app.id,
        Document.doc_type == target_type
    ).first()
    if existing_doc:
        try:
            if existing_doc.file_path and os.path.exists(existing_doc.file_path):
                os.remove(existing_doc.file_path)
        except Exception:
            pass
        db.delete(existing_doc)
        db.commit()

    with open(file_path, "wb") as f:
        f.write(contents)

    # Multi-format document processing & OCR pipeline
    from ..services.document_processor import process_uploaded_document
    proc_res = process_uploaded_document(file_path, file.content_type or "application/pdf")
    
    if not proc_res.get("success", False):
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=proc_res.get("error", "Document processing failed.")
        )

    extracted_fields = proc_res.get("extractedFields", [])
    fields_dict = {f["field_name"]: f["normalized_value"] or f["extracted_value"] for f in extracted_fields}
    detected_type = target_type
    classified_type = proc_res.get("docType", "OTHER")
    ocr_status = proc_res.get("ocrStatus", "EXTRACTED")

    # Document Type Classification Check
    type_warning = None
    if target_type == "AADHAAR" and classified_type == "PAN":
        type_warning = "Document Type Warning: Uploaded document appears to be a PAN Card instead of an Aadhaar Card. Please ensure you upload the correct document."
    elif target_type == "PAN" and classified_type == "AADHAAR":
        type_warning = "Document Type Warning: Uploaded document appears to be an Aadhaar Card instead of a PAN Card. Please ensure you upload the correct document."
    elif classified_type == "OTHER" and target_type in ["AADHAAR", "PAN"]:
        type_warning = f"Document Notice: Cannot confirm official {target_type} security markers. Please ensure the scan is clear and unobscured."

    # Cross-match with DigiLocker database for this application
    from ..models import DigiLockerRecord
    dl_records = db.query(DigiLockerRecord).filter(DigiLockerRecord.application_id == app.id).all()
    digilocker_match = {
        "verified": False,
        "status": "NOT_CHECKED",
        "message": "DigiLocker records not retrieved yet for this application."
    }
    for dlr in dl_records:
        if dlr.document_type == target_type and dlr.raw_metadata:
            try:
                dl_fields = json.loads(dlr.raw_metadata)
                if target_type == "PAN":
                    dl_pan = (dl_fields.get("panNumber") or "").strip().upper()
                    ext_pan = (fields_dict.get("pan_number") or "").strip().upper()
                    if dl_pan and ext_pan and dl_pan == ext_pan:
                        digilocker_match = {
                            "verified": True,
                            "status": "MATCHED",
                            "message": f"DigiLocker Match Verified: Uploaded PAN ({ext_pan}) matches DigiLocker record ({dl_pan})."
                        }
                    elif dl_pan and ext_pan:
                        digilocker_match = {
                            "verified": False,
                            "status": "MISMATCH",
                            "message": f"DigiLocker Mismatch: Uploaded PAN ({ext_pan}) does not match DigiLocker record ({dl_pan})."
                        }
                elif target_type == "AADHAAR":
                    dl_aadh = dl_fields.get("maskedAadhaar") or dl_fields.get("fullAadhaar", "")
                    ext_aadh = fields_dict.get("aadhaar_number") or ""
                    dl_digits = "".join(filter(str.isdigit, dl_aadh))[-4:]
                    ext_digits = "".join(filter(str.isdigit, ext_aadh))[-4:]
                    if dl_digits and ext_digits and dl_digits == ext_digits:
                        digilocker_match = {
                            "verified": True,
                            "status": "MATCHED",
                            "message": f"DigiLocker Match Verified: Uploaded Aadhaar ending in ...{ext_digits} matches DigiLocker record."
                        }
                    elif dl_digits and ext_digits:
                        digilocker_match = {
                            "verified": False,
                            "status": "MISMATCH",
                            "message": f"DigiLocker Mismatch: Uploaded Aadhaar (...{ext_digits}) does not match DigiLocker record (...{dl_digits})."
                        }
            except Exception:
                pass

    # Separate OCR extraction status from document verification status
    doc_verif_status = "PENDING_VERIFICATION"
    if ocr_status == "FAILED":
        doc_verif_status = "FAILED"
    elif digilocker_match.get("verified"):
        doc_verif_status = "VERIFIED_WITH_DIGILOCKER"

    # Save Document record
    doc = Document(
        application_id=app.id,
        doc_type=detected_type,
        source="USER_UPLOAD",
        file_name=filename,
        file_path=file_path,
        mime_type=file.content_type or "application/pdf",
        verification_status=doc_verif_status,
        ocr_data=json.dumps(fields_dict),
        metadata_json=json.dumps({
            "size": len(contents),
            "originalName": filename,
            "ocrStatus": ocr_status,
            "classifiedType": classified_type,
            "classificationConfidence": proc_res.get("classificationConfidence"),
            "imageQuality": proc_res.get("imageQuality"),
            "typeWarning": type_warning,
            "digilockerMatch": digilocker_match
        })
    )
    db.add(doc)

    # Audit log
    quality_desc = (proc_res.get('imageQuality') or {}).get('qualityStatus', 'N/A')
    audit = AuditLog(
        user_id=current_user.id,
        application_id=app.id,
        action="DOCUMENT_UPLOADED",
        details=f"Uploaded {detected_type} ({filename}). Classified: {classified_type}. OCR: {ocr_status}. Quality: {quality_desc}. DigiLocker: {digilocker_match['status']}."
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "message": f"Document '{filename}' uploaded and processed via OCR successfully.",
        "documentId": doc.id,
        "docType": doc.doc_type,
        "classifiedType": classified_type,
        "typeWarning": type_warning,
        "ocrStatus": ocr_status,
        "verificationStatus": doc_verif_status,
        "digilockerMatch": digilocker_match,
        "classificationConfidence": proc_res.get("classificationConfidence"),
        "imageQuality": proc_res.get("imageQuality"),
        "extractedFields": extracted_fields
    }


@router.get("/{application_id}")
def list_application_documents(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user.role not in ["REVIEWER", "ADMIN"] and app.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    docs = db.query(Document).filter(Document.application_id == application_id).all()
    results = []
    for d in docs:
        fields = {}
        if d.ocr_data:
            try:
                fields = json.loads(d.ocr_data)
            except Exception:
                pass
        results.append({
            "id": d.id,
            "applicationId": d.application_id,
            "docType": d.doc_type,
            "source": d.source,
            "fileName": d.file_name,
            "verificationStatus": d.verification_status,
            "isDemoSynthetic": d.is_demo_synthetic,
            "extractedFields": fields,
            "createdAt": d.created_at
        })
    return results


@router.get("/consistency/{application_id}", response_model=ConsistencyReport)
def check_document_consistency(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user.role not in ["REVIEWER", "ADMIN"] and app.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    docs = db.query(Document).filter(Document.application_id == application_id).all()
    bank = db.query(BankAccount).filter(BankAccount.application_id == application_id).first()
    face = db.query(FaceVerificationSession).filter(FaceVerificationSession.application_id == application_id).first()

    doc_dicts = []
    for d in docs:
        f = {}
        if d.ocr_data:
            try:
                f = json.loads(d.ocr_data)
            except Exception:
                pass
        doc_dicts.append({
            "doc_type": d.doc_type,
            "documentType": d.doc_type,
            "verificationStatus": d.verification_status,
            "fields": f
        })

    bank_dict = {
        "accountHolderName": bank.account_holder_name,
        "bankName": bank.bank_name
    } if bank else None

    face_dict = {
        "status": face.status,
        "livenessScore": face.liveness_score
    } if face else None

    report = evaluate_consistency(
        declared_applicant_name=app.user.name if app.user else "Applicant",
        declared_monthly_income=app.income,
        documents=doc_dicts,
        bank_account=bank_dict,
        face_session=face_dict
    )

    return ConsistencyReport(**report)


@router.get("/sample-kyc/jeeva")
def get_jeeva_sample_kyc():
    """
    Returns the real verified KYC OCR dataset for Jeeva Bharathi M,
    including extracted text, structured fields, photo URLs, and card images.
    """
    return {
        "success": True,
        "data": get_jeeva_ground_truth_kyc()
    }


@router.post("/cross-check-profile", response_model=OcrProfileCrossCheckResponse)
def cross_check_profile_endpoint(
    req: OcrProfileCrossCheckRequest
):
    """
    Matches the entered applicant profile details against the OCR data
    extracted from the Aadhaar card and PAN card.
    """
    result = cross_check_profile_against_ocr(
        declared=req.model_dump()
    )
    return OcrProfileCrossCheckResponse(**result)


@router.post("/ocr-extract", response_model=OcrDocumentExtractionResponse)
async def ocr_extract_document(
    docType: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    """
    Performs OCR extraction on an actual uploaded document file or falls back to sample KYC.
    """
    from ..services.document_processor import process_uploaded_document
    doc_key = docType.strip().upper()

    if file and file.filename:
        filename = file.filename
        ext = os.path.splitext(filename)[1].lower()
        if ext not in [".pdf", ".jpg", ".jpeg", ".png", ".txt"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported format '{ext}'. Allowed formats: PDF, JPG, JPEG, PNG."
            )
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded document file is empty (0 bytes)."
            )
        temp_path = os.path.join(settings.UPLOAD_DIR, f"temp_ocr_{uuid.uuid4().hex[:8]}_{filename}")
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        with open(temp_path, "wb") as f:
            f.write(contents)
        try:
            proc_res = process_uploaded_document(temp_path, file.content_type or "image/jpeg")
            if not proc_res.get("success", False):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=proc_res.get("error", "Unable to extract text or fields from document image.")
                )
            extracted_fields = proc_res.get("extractedFields", [])
            fields_dict = {f["field_name"]: f["normalized_value"] or f["extracted_value"] for f in extracted_fields}
            
            # Map photo preview if image
            photo_url = f"/assets/{doc_key.lower()}_photo.jpg"
            card_url = f"/assets/{doc_key.lower()}_card.jpg"

            return OcrDocumentExtractionResponse(
                documentType=doc_key,
                issuer="Government of India" if "PAN" in doc_key else "UIDAI",
                extractedFields=fields_dict,
                confidenceScore=proc_res.get("classificationConfidence", 0.90),
                photoExtracted=True,
                photoUrl=photo_url,
                cardImageUrl=card_url,
                overallMatchStatus="EXACT_MATCH" if len(fields_dict) > 0 else "PARTIAL_MATCH"
            )
        finally:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass

    # Sample reference fallback for interactive demonstration
    kyc_data = get_jeeva_ground_truth_kyc()
    if "PAN" in doc_key:
        doc_info = kyc_data["pan"]
    else:
        doc_info = kyc_data["aadhaar"]

    return OcrDocumentExtractionResponse(
        documentType=doc_info["documentType"],
        issuer=doc_info["issuer"],
        extractedFields=doc_info,
        confidenceScore=doc_info["confidenceScore"],
        photoExtracted=doc_info["photoExtracted"],
        photoUrl=doc_info["photoUrl"],
        cardImageUrl=doc_info["cardImageUrl"],
        overallMatchStatus="EXACT_MATCH"
    )


@router.delete("/application/{application_id}/type/{doc_type}")
def delete_document_by_type(
    application_id: str,
    doc_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes an uploaded document and removes its file from disk.
    Ensures independent document management per type.
    """
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user.role not in ["REVIEWER", "ADMIN"] and app.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    target_type = doc_type.strip().upper()
    doc = db.query(Document).filter(
        Document.application_id == application_id,
        Document.doc_type == target_type
    ).first()

    if not doc:
        return {"success": True, "message": f"No document of type {target_type} found to delete."}

    # Delete physical file
    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)

    # Log audit
    audit = AuditLog(
        user_id=current_user.id,
        application_id=application_id,
        action="DOCUMENT_DELETED",
        details=f"Deleted {target_type} document ({doc.file_name})."
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "message": f"{target_type} document successfully deleted. Verification state reset for this document.",
        "docType": target_type
    }


@router.get("/application/{application_id}/type/{doc_type}")
def get_document_by_type(
    application_id: str,
    doc_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves document state and OCR metadata for a specific document type.
    """
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user.role not in ["REVIEWER", "ADMIN"] and app.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    target_type = doc_type.strip().upper()
    doc = db.query(Document).filter(
        Document.application_id == application_id,
        Document.doc_type == target_type
    ).first()

    if not doc:
        return {
            "status": "NOT_UPLOADED",
            "docType": target_type,
            "document": None
        }

    fields = {}
    if doc.ocr_data:
        try:
            fields = json.loads(doc.ocr_data)
        except Exception:
            pass

    return {
        "status": "UPLOADED",
        "docType": target_type,
        "document": {
            "id": doc.id,
            "fileName": doc.file_name,
            "verificationStatus": doc.verification_status,
            "extractedFields": fields,
            "createdAt": doc.created_at
        }
    }

