"""
Bank Account Verification routes (Penny Drop / Account Status).
Enforces account holder name similarity checks and number masking.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, LoanApplication, BankAccount, ApplicantConsent, AuditLog
from ..schemas import BankVerificationRequest, BankAccountResponse
from ..adapters.bank_verification import get_bank_provider
from ..auth import get_current_user

router = APIRouter(prefix="/api/bank-verification", tags=["Bank Verification"])


@router.post("/verify")
async def verify_bank_account():
    """
    DECOMMISSIONED: Bank Account Penny-Drop Verification has been removed from the
    digital loan processing workflow per specification.
    """
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Bank Account Penny-Drop Verification has been permanently removed from the digital loan processing workflow per specification."
    )

    provider = get_bank_provider()
    applicant_name = app.user.name if app.user else "Applicant"
    result = await provider.verify_account(
        application_id=app.id,
        bank_name=req.bankName,
        account_number=req.accountNumber,
        ifsc_code=req.ifscCode,
        account_holder_name=req.accountHolderName,
        applicant_name=applicant_name,
        consent_given=req.consentGiven
    )

    # Persist in bank_accounts table
    bank_account = BankAccount(
        application_id=app.id,
        provider_mode=getattr(provider, "mode", "demo").upper(),
        bank_name=result["bankName"],
        account_number_masked=result["accountNumberMasked"],
        ifsc_code=result["ifscCode"],
        account_holder_name=result["accountHolderName"],
        name_similarity_score=result["nameSimilarityScore"],
        verification_status=result["verificationStatus"],
        verification_reference=result.get("verificationReference")
    )
    db.add(bank_account)

    # Advance stage to AI_ASSESSMENT_COMPLETE if verification succeeded
    if result["verificationStatus"] == "VERIFIED":
        if app.stage in ["DRAFT", "SUBMITTED", "DOCUMENTS_PENDING", "IDENTITY_CHECK_PENDING", "CREDIT_CHECK_PENDING", "BANK_VERIFICATION_PENDING"]:
            app.stage = "AI_ASSESSMENT_COMPLETE"

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        application_id=app.id,
        action="BANK_ACCOUNT_VERIFIED",
        details=f"Bank {req.bankName} verified with status: {result['verificationStatus']}, name match: {result['nameSimilarityScore']}."
    )
    db.add(audit)
    db.commit()

    return BankAccountResponse(
        id=bank_account.id,
        applicationId=bank_account.application_id,
        bankName=bank_account.bank_name,
        accountNumberMasked=bank_account.account_number_masked,
        ifscCode=bank_account.ifsc_code,
        accountHolderName=bank_account.account_holder_name,
        nameSimilarityScore=bank_account.name_similarity_score,
        verificationStatus=bank_account.verification_status,
        verificationReference=bank_account.verification_reference,
        isDemo=result.get("isDemo", True),
        regulatoryBanner=result.get("regulatoryBanner", "DEMO BANK VERIFICATION — NO REAL BANK ACCOUNT CHECK PERFORMED")
    )


@router.get("/account/{application_id}", response_model=BankAccountResponse)
def get_verified_bank_account(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user.role not in ["REVIEWER", "ADMIN"] and app.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    bank_rec = (
        db.query(BankAccount)
        .filter(BankAccount.application_id == application_id)
        .order_by(BankAccount.created_at.desc())
        .first()
    )

    if not bank_rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No verified bank account found for this application."
        )

    return BankAccountResponse(
        id=bank_rec.id,
        applicationId=bank_rec.application_id,
        bankName=bank_rec.bank_name,
        accountNumberMasked=bank_rec.account_number_masked,
        ifscCode=bank_rec.ifsc_code,
        accountHolderName=bank_rec.account_holder_name,
        nameSimilarityScore=bank_rec.name_similarity_score,
        verificationStatus=bank_rec.verification_status,
        verificationReference=bank_rec.verification_reference,
        isDemo=(bank_rec.provider_mode == "DEMO"),
        regulatoryBanner="DEMO BANK VERIFICATION — NO REAL BANK ACCOUNT CHECK PERFORMED" if bank_rec.provider_mode == "DEMO" else None
    )
