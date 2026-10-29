from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.application import LoanApplication
from app.models.audit import DisbursementRecord
from app.schemas.audit import DisburseRequest, DisbursementOut
from app.services.disbursement_service import execute_simulated_disbursement, generate_key_fact_statement

router = APIRouter(prefix="/disbursement", tags=["NPCI / NACH e-Mandate & IMPS Disbursement"])

@router.post("/execute", response_model=DisbursementOut)
def trigger_disbursement(payload: DisburseRequest, db: Session = Depends(get_db)):
    """
    Executes instant simulated disbursement via NPCI/NACH e-mandate and IMPS.
    Only approved applications can be disbursed.
    """
    app = db.query(LoanApplication).filter(LoanApplication.id == payload.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Loan Application not found")
        
    if app.final_decision not in ["APPROVED", "DISBURSED"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot disburse loan with status '{app.final_decision}'. Must be APPROVED."
        )
        
    record = execute_simulated_disbursement(
        db=db,
        application=app,
        bank_name=payload.bank_name,
        bank_account_number=payload.bank_account_number,
        ifsc_code=payload.ifsc_code
    )
    
    return DisbursementOut(
        application_id=record.application_id,
        nach_umrn=record.nach_umrn,
        bank_name=record.bank_name,
        bank_account_masked=record.bank_account_masked,
        ifsc_code=record.ifsc_code,
        mandate_amount_limit=record.mandate_amount_limit,
        mandate_status=record.mandate_status,
        imps_rrn=record.imps_rrn,
        imps_utr=record.imps_utr,
        disbursement_amount=record.disbursement_amount,
        disbursement_status=record.disbursement_status,
        disbursed_at=record.disbursed_at,
        kfs_data=record.kfs_data or {}
    )

@router.get("/kfs/{application_id}")
def get_kfs(application_id: str, db: Session = Depends(get_db)):
    """
    Retrieves or generates Key Fact Statement (KFS) compliant with RBI Digital Lending Directions.
    """
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Loan Application not found")
        
    disb = db.query(DisbursementRecord).filter(DisbursementRecord.application_id == application_id).first()
    if disb and disb.kfs_data:
        return disb.kfs_data
        
    kfs = generate_key_fact_statement(
        loan_amount=app.requested_amount,
        tenure_months=app.tenure_months,
        emi=app.calculated_emi,
        applicant_name=app.applicant_name
    )
    return kfs
