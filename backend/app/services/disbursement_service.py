import uuid
import random
from datetime import datetime, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.audit import DisbursementRecord
from app.models.application import LoanApplication
from app.services.audit_service import create_immutable_audit_log

def generate_key_fact_statement(
    loan_amount: float,
    tenure_months: int,
    emi: float,
    applicant_name: str,
    annual_rate: float = 0.105
) -> Dict[str, Any]:
    """
    Generates standard Key Fact Statement (KFS) strictly compliant with
    RBI Digital Lending Directions 2022/2023.
    """
    total_repayable = emi * tenure_months
    total_interest = total_repayable - loan_amount
    apr = round(annual_rate * 100.0, 2)
    cooling_off_days = 3
    
    return {
        "regulatory_heading": "KEY FACT STATEMENT (KFS) - RBI DIGITAL LENDING GUIDELINES",
        "lender_entity": "Apex Digital Finance RE (RBI Regulated Entity)",
        "applicant_legal_name": applicant_name,
        "loan_principal_inr": loan_amount,
        "tenure_months": tenure_months,
        "annualized_percentage_rate_apr": f"{apr}%",
        "reducing_interest_rate_pa": f"{apr}%",
        "monthly_equated_installment_emi": emi,
        "total_interest_payable_inr": round(total_interest, 2),
        "total_amount_payable_inr": round(total_repayable, 2),
        "processing_fee_inr": 0.0,
        "penal_charges_policy": "Zero penalty for early prepayment / foreclosure",
        "cooling_off_look_up_period": f"{cooling_off_days} Business Days (Full exit without penalty)",
        "cooling_off_expiry": (datetime.utcnow() + timedelta(days=cooling_off_days)).strftime("%Y-%m-%d %H:%M UTC"),
        "nodal_grievance_officer": {
            "name": "Dr. Arulmozhi Varman",
            "designation": "Chief Underwriting Officer & Principal Grievance Redressal Officer",
            "email": "grievance.nodal@rbi-lending.gov.in",
            "helpline": "+91 1800 200 9042"
        }
    }

def execute_simulated_disbursement(
    db: Session,
    application: LoanApplication,
    bank_name: str = "State Bank of India",
    bank_account_number: str = "392019485721",
    ifsc_code: str = "SBIN0001234"
) -> DisbursementRecord:
    """
    Executes instant simulated disbursement via NPCI/NACH e-mandate and IMPS.
    """
    # Check if already disbursed
    existing = db.query(DisbursementRecord).filter(DisbursementRecord.application_id == application.id).first()
    if existing:
        return existing
        
    umrn_suffix = "".join([random.choice("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ") for _ in range(12)])
    nach_umrn = f"UMRN-2026-NACH-{umrn_suffix}"
    
    imps_rrn = f"2026{random.randint(10000000, 99999999)}"
    imps_utr = f"RBILEND{datetime.utcnow().strftime('%y%m%d%H%M%S')}{random.randint(100, 999)}"
    
    masked_acc = f"XXXXXXXX{bank_account_number[-4:]}" if len(bank_account_number) >= 4 else "XXXXXXXX7890"
    
    kfs = generate_key_fact_statement(
        loan_amount=application.requested_amount,
        tenure_months=application.tenure_months,
        emi=application.calculated_emi,
        applicant_name=application.applicant_name
    )
    
    record = DisbursementRecord(
        application_id=application.id,
        nach_umrn=nach_umrn,
        bank_name=bank_name,
        bank_account_masked=masked_acc,
        ifsc_code=ifsc_code.upper(),
        mandate_amount_limit=round(application.calculated_emi * 1.5, 2),
        mandate_status="ACTIVE_REGISTERED",
        imps_rrn=imps_rrn,
        imps_utr=imps_utr,
        disbursement_amount=application.requested_amount,
        disbursement_status="COMPLETED_SUCCESS",
        disbursed_at=datetime.utcnow(),
        kfs_data=kfs
    )
    
    application.final_decision = "DISBURSED"
    db.add(record)
    
    # Immutable audit trail entry
    create_immutable_audit_log(
        db=db,
        application_id=application.id,
        action="DISBURSEMENT_AUTHORIZED",
        previous_status=application.system_decision,
        new_status="DISBURSED",
        justification=f"Instant IMPS funds transfer authorized. RRN: {imps_rrn}, UMRN: {nach_umrn}, KFS issued."
    )
    
    db.commit()
    db.refresh(record)
    return record
