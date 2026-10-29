import uuid
import random
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.application import LoanApplication, EBMExplanation
from app.models.kyc import KYCRecord, BiometricVerification
from app.models.audit import AuditLog, DisbursementRecord
from app.models.user import User
from app.schemas.underwriting import UnderwritingEvaluateRequest
from app.services.ebm_service import evaluate_underwriting_decision
from app.services.audit_service import create_immutable_audit_log

router = APIRouter(prefix="/applications", tags=["Application Pipeline"])

@router.post("")
def submit_loan_application(payload: UnderwritingEvaluateRequest, db: Session = Depends(get_db)):
    """
    Submits a loan application through the full underwriting pipeline.
    Calculates EBM explanation, applies decision gates, and records immutable audit log.
    """
    # 1. Run Underwriting evaluation
    eval_result = evaluate_underwriting_decision(payload.model_dump())
    
    app_id = str(uuid.uuid4())
    app_no = f"XAI-2026-{random.randint(10000, 99999)}"
    
    # Check or create user
    user = db.query(User).filter(User.full_name == payload.name).first()
    user_id = user.id if user else str(uuid.uuid4())
    
    # 2. Persist Loan Application
    loan_app = LoanApplication(
        id=app_id,
        application_no=app_no,
        user_id=user_id,
        applicant_name=payload.name,
        age=payload.age,
        monthly_income=payload.income,
        employment_type=payload.employment_type,
        dependents=payload.dependents,
        existing_loans=payload.existing_loans,
        monthly_obligations=payload.monthly_obligations,
        requested_amount=payload.loan_amount,
        tenure_months=payload.loan_tenure,
        loan_purpose=payload.loan_purpose,
        cibil_score=payload.cibil_score,
        payment_history_pct=payload.payment_history,
        credit_utilization_pct=payload.credit_utilization,
        credit_history_years=payload.credit_history_years,
        recent_enquiries=payload.recent_enquiries,
        calculated_emi=eval_result["estimated_emi"],
        debt_to_income_ratio=eval_result["debt_to_income_ratio"],
        loan_to_income_ratio=eval_result["loan_to_income_ratio"],
        approval_probability=eval_result["probability"],
        risk_tier=eval_result["risk_tier"],
        system_decision=eval_result["system_decision"],
        final_decision=eval_result["system_decision"],
        decision_summary=eval_result["decision_summary"],
        decision_reasons=eval_result["decision_reasons"]
    )
    db.add(loan_app)
    
    # 3. Persist EBM Explanation & Waterfall Data
    ebm_exp = EBMExplanation(
        application_id=app_id,
        intercept=eval_result["intercept"],
        positive_factors=eval_result["positive_factors"],
        negative_factors=eval_result["negative_factors"],
        all_factors=eval_result["all_factors"],
        waterfall_data=eval_result["waterfall_bars"]
    )
    db.add(ebm_exp)
    
    # 4. System Audit Log
    create_immutable_audit_log(
        db=db,
        application_id=app_id,
        action="SYSTEM_GATE_EVALUATED",
        previous_status="SUBMITTED",
        new_status=eval_result["system_decision"],
        justification=f"EBM Underwriting complete: {eval_result['decision_summary']}"
    )
    
    db.commit()
    db.refresh(loan_app)
    
    eval_result["application_id"] = app_id
    eval_result["application_no"] = app_no
    eval_result["applicant_name"] = payload.name
    return eval_result

@router.get("")
def list_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    """
    Lists applications for the Underwriter & Auditor Cockpit with optional status filter.
    """
    query = db.query(LoanApplication).order_by(LoanApplication.created_at.desc())
    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(LoanApplication.final_decision == status_filter.upper())
    apps = query.all()
    
    results = []
    for a in apps:
        results.append({
            "id": a.id,
            "application_no": a.application_no,
            "applicant_name": a.applicant_name,
            "monthly_income": a.monthly_income,
            "requested_amount": a.requested_amount,
            "tenure_months": a.tenure_months,
            "cibil_score": a.cibil_score,
            "calculated_emi": a.calculated_emi,
            "debt_to_income_ratio": a.debt_to_income_ratio,
            "loan_to_income_ratio": a.loan_to_income_ratio,
            "risk_tier": a.risk_tier,
            "system_decision": a.system_decision,
            "final_decision": a.final_decision,
            "probability_percentage": round(a.approval_probability * 100.0, 1),
            "is_officer_overridden": a.is_officer_overridden,
            "created_at": a.created_at.isoformat()
        })
    return results

@router.get("/{application_id}")
def get_application_detail(application_id: str, db: Session = Depends(get_db)):
    """
    Returns complete application package including financial parameters, EBM waterfall charts,
    audit trail, and disbursement status.
    """
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Loan Application not found")
        
    explanation = db.query(EBMExplanation).filter(EBMExplanation.application_id == application_id).first()
    audit_trail = db.query(AuditLog).filter(AuditLog.application_id == application_id).order_by(AuditLog.timestamp.desc()).all()
    disbursement = db.query(DisbursementRecord).filter(DisbursementRecord.application_id == application_id).first()
    
    return {
        "application": {
            "id": app.id,
            "application_no": app.application_no,
            "applicant_name": app.applicant_name,
            "age": app.age,
            "monthly_income": app.monthly_income,
            "employment_type": app.employment_type,
            "dependents": app.dependents,
            "existing_loans": app.existing_loans,
            "monthly_obligations": app.monthly_obligations,
            "requested_amount": app.requested_amount,
            "tenure_months": app.tenure_months,
            "loan_purpose": app.loan_purpose,
            "cibil_score": app.cibil_score,
            "payment_history_pct": app.payment_history_pct,
            "credit_utilization_pct": app.credit_utilization_pct,
            "credit_history_years": app.credit_history_years,
            "recent_enquiries": app.recent_enquiries,
            "calculated_emi": app.calculated_emi,
            "debt_to_income_ratio": app.debt_to_income_ratio,
            "loan_to_income_ratio": app.loan_to_income_ratio,
            "approval_probability": app.approval_probability,
            "probability_percentage": round(app.approval_probability * 100.0, 1),
            "risk_tier": app.risk_tier,
            "system_decision": app.system_decision,
            "final_decision": app.final_decision,
            "decision_summary": app.decision_summary,
            "decision_reasons": app.decision_reasons or [],
            "is_officer_overridden": app.is_officer_overridden,
            "created_at": app.created_at.isoformat()
        },
        "ebm_explanation": {
            "intercept": explanation.intercept if explanation else 0.0,
            "positive_factors": explanation.positive_factors if explanation else [],
            "negative_factors": explanation.negative_factors if explanation else [],
            "all_factors": explanation.all_factors if explanation else [],
            "waterfall_bars": explanation.waterfall_data if explanation else []
        } if explanation else None,
        "audit_trail": [
            {
                "id": log.id,
                "officer_id": log.officer_id,
                "officer_name": log.officer_name,
                "officer_title": log.officer_title,
                "action": log.action,
                "previous_status": log.previous_status,
                "new_status": log.new_status,
                "justification": log.justification,
                "digital_signature": log.digital_signature,
                "timestamp": log.timestamp.isoformat()
            }
            for log in audit_trail
        ],
        "disbursement": {
            "nach_umrn": disbursement.nach_umrn,
            "bank_name": disbursement.bank_name,
            "bank_account_masked": disbursement.bank_account_masked,
            "ifsc_code": disbursement.ifsc_code,
            "mandate_amount_limit": disbursement.mandate_amount_limit,
            "mandate_status": disbursement.mandate_status,
            "imps_rrn": disbursement.imps_rrn,
            "imps_utr": disbursement.imps_utr,
            "disbursement_amount": disbursement.disbursement_amount,
            "disbursement_status": disbursement.disbursement_status,
            "disbursed_at": disbursement.disbursed_at.isoformat(),
            "kfs_data": disbursement.kfs_data
        } if disbursement else None
    }
