"""
Loan Disbursement Processing Routes.
Implements strict idempotency keys to prevent duplicate payments,
prerequisite approval enforcement, and mandatory simulation banners in Demo mode.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, LoanApplication, DisbursementRecord, BankAccount, AuditLog
from ..schemas import DisbursementRequest, DisbursementResponse
from ..adapters.disbursement import get_disbursement_provider
from ..services.ml_engine import calculate_reducing_balance_emi
from ..auth import get_current_user

router = APIRouter(prefix="/api/disbursement", tags=["Disbursement"])


@router.post("/request", response_model=DisbursementResponse)
async def request_disbursement(
    req: DisbursementRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(LoanApplication).filter(LoanApplication.id == req.applicationId).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user.role not in ["REVIEWER", "ADMIN"] and app.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    # Idempotency Protection: Check if this idempotency key was already processed
    existing_disb = (
        db.query(DisbursementRecord)
        .filter(DisbursementRecord.idempotency_key == req.idempotencyKey)
        .first()
    )
    if existing_disb:
        # Return existing record to guarantee idempotent operation without duplicate payment
        return DisbursementResponse(
            success=True,
            mode=existing_disb.provider_mode,
            status=existing_disb.status,
            transactionReference=existing_disb.transaction_reference,
            amount=existing_disb.amount,
            tenureMonths=existing_disb.tenure_months,
            interestRate=existing_disb.interest_rate,
            emiAmount=existing_disb.emi_amount,
            simulatedBanner="SIMULATED DISBURSEMENT — NO REAL MONEY TRANSFERRED",
            timestamp=existing_disb.timestamp,
            message="Idempotent replay: Transaction already processed. No duplicate transfer initiated."
        )

    # Prerequisite verification: Application must be APPROVED
    if app.status != "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Disbursement cannot be triggered. Application status is '{app.status}'. Mandatory status is 'APPROVED'."
        )

    provider = get_disbursement_provider()
    emi_data = calculate_reducing_balance_emi(app.loan_amount, app.loan_tenure)

    result = await provider.process_disbursement(
        application_id=app.id,
        idempotency_key=req.idempotencyKey,
        amount=app.loan_amount,
        tenure_months=app.loan_tenure,
        interest_rate=10.5,
        emi_amount=emi_data["monthly_emi"]
    )

    # Persist disbursement record
    disb_record = DisbursementRecord(
        application_id=app.id,
        provider_mode=result["mode"],
        idempotency_key=req.idempotencyKey,
        amount=app.loan_amount,
        tenure_months=app.loan_tenure,
        interest_rate=10.5,
        emi_amount=emi_data["monthly_emi"],
        status=result["status"],
        transaction_reference=result["transactionReference"],
        simulated_banner_displayed=True,
        timestamp=result["timestamp"]
    )
    db.add(disb_record)

    # Update application stage to DISBURSED
    app.status = "DISBURSED"
    app.stage = "DISBURSED"

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        application_id=app.id,
        action="LOAN_DISBURSEMENT_SIMULATED",
        details=f"Disbursed ₹{app.loan_amount:,.0f} (ref: {result['transactionReference']}). Mode: {result['mode']}."
    )
    db.add(audit)
    db.commit()

    return DisbursementResponse(**result)


@router.get("/status/{application_id}", response_model=DisbursementResponse)
def get_disbursement_status(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user.role not in ["REVIEWER", "ADMIN"] and app.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    disb = (
        db.query(DisbursementRecord)
        .filter(DisbursementRecord.application_id == application_id)
        .order_by(DisbursementRecord.timestamp.desc())
        .first()
    )

    if not disb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No disbursement found for this application.")

    return DisbursementResponse(
        success=True,
        mode=disb.provider_mode,
        status=disb.status,
        transactionReference=disb.transaction_reference,
        amount=disb.amount,
        tenureMonths=disb.tenure_months,
        interestRate=disb.interest_rate,
        emiAmount=disb.emi_amount,
        simulatedBanner="SIMULATED DISBURSEMENT — NO REAL MONEY TRANSFERRED",
        timestamp=disb.timestamp,
        message=f"Disbursement status: {disb.status}"
    )
