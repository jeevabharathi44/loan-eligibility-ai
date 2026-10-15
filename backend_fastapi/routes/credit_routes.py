"""
Credit Assessment routes for TransUnion CIBIL or authorized bureau queries.
"""
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, LoanApplication, CreditCheck, ApplicantConsent, AuditLog
from ..schemas import CreditCheckRequest, CreditProfileResponse
from ..adapters.credit import get_credit_provider
from ..auth import get_current_user

router = APIRouter(prefix="/api/credit", tags=["Credit Bureau"])


@router.post("/verify", response_model=CreditProfileResponse)
async def verify_credit(
    req: CreditCheckRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(LoanApplication).filter(LoanApplication.id == req.applicationId).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user.role not in ["REVIEWER", "ADMIN"] and app.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    if not req.consentGiven:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Informed applicant consent is legally required before querying credit bureau records."
        )

    # Record consent
    consent = ApplicantConsent(
        application_id=app.id,
        user_id=current_user.id,
        purpose="CIBIL_PULL",
        consent_text="Applicant authorized automated retrieval of credit history and CIBIL score."
    )
    db.add(consent)
    db.commit()

    provider = get_credit_provider()
    result = await provider.fetch_credit_score(
        application_id=app.id,
        pan_number=req.panNumber,
        declared_score=req.cibilScore,
        consent_given=req.consentGiven
    )

    # Persist in credit_checks table
    report_json = json.dumps(result.get("reportSummary", {}))
    credit_record = CreditCheck(
        application_id=app.id,
        provider_mode=getattr(provider, "mode", "demo").upper(),
        provider_name=result.get("provider", "CIBIL"),
        cibil_score=result["cibilScore"],
        payment_history=result["paymentHistory"],
        credit_utilization=result["creditUtilization"],
        credit_history_years=result["creditHistoryYears"],
        recent_enquiries=result["recentEnquiries"],
        verification_status=result["verificationStatus"],
        consent_timestamp=result["consentTimestamp"],
        report_data=report_json
    )
    db.add(credit_record)

    # Advance stage to BANK_VERIFICATION_PENDING if currently in earlier stages
    if result["verificationStatus"] in ["VERIFIED", "DEMO_UNVERIFIED"]:
        if app.stage in ["DRAFT", "SUBMITTED", "DOCUMENTS_PENDING", "IDENTITY_CHECK_PENDING", "CREDIT_CHECK_PENDING"]:
            app.stage = "BANK_VERIFICATION_PENDING"

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        application_id=app.id,
        action="CREDIT_SCORE_RETRIEVED",
        details=f"Retrieved CIBIL score {result['cibilScore']} (status: {result['verificationStatus']})."
    )
    db.add(audit)
    db.commit()

    return CreditProfileResponse(
        id=credit_record.id,
        applicationId=credit_record.application_id,
        cibilScore=credit_record.cibil_score,
        paymentHistory=credit_record.payment_history,
        creditUtilization=credit_record.credit_utilization,
        creditHistoryYears=credit_record.credit_history_years,
        recentEnquiries=credit_record.recent_enquiries,
        verificationStatus=credit_record.verification_status,
        provider=credit_record.provider_name,
        consentTimestamp=credit_record.consent_timestamp,
        reportSummary=result.get("reportSummary")
    )


@router.get("/report/{application_id}", response_model=CreditProfileResponse)
def get_credit_report(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user.role not in ["REVIEWER", "ADMIN"] and app.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    credit_rec = (
        db.query(CreditCheck)
        .filter(CreditCheck.application_id == application_id)
        .order_by(CreditCheck.created_at.desc())
        .first()
    )

    if not credit_rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No credit check record found for this application."
        )

    summary = {}
    if credit_rec.report_data:
        try:
            summary = json.loads(credit_rec.report_data)
        except Exception:
            pass

    return CreditProfileResponse(
        id=credit_rec.id,
        applicationId=credit_rec.application_id,
        cibilScore=credit_rec.cibil_score,
        paymentHistory=credit_rec.payment_history,
        creditUtilization=credit_rec.credit_utilization,
        creditHistoryYears=credit_rec.credit_history_years,
        recentEnquiries=credit_rec.recent_enquiries,
        verificationStatus=credit_rec.verification_status,
        provider=credit_rec.provider_name,
        consentTimestamp=credit_rec.consent_timestamp,
        reportSummary=summary
    )
