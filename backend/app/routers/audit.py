from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.application import LoanApplication
from app.models.audit import AuditLog, DisbursementRecord
from app.schemas.audit import OverrideRequest, AuditLogOut
from app.services.audit_service import create_immutable_audit_log, get_audit_trail
from app.config import settings

router = APIRouter(prefix="/audit", tags=["Institutional Underwriting & Audit Cockpit (Module 6)"])

@router.get("/cockpit-stats")
def get_cockpit_overview(db: Session = Depends(get_db)):
    """
    Returns real-time operational underwriting statistics for Dr. Arulmozhi Varman's cockpit.
    """
    total = db.query(func.count(LoanApplication.id)).scalar() or 0
    approved = db.query(func.count(LoanApplication.id)).filter(LoanApplication.final_decision.in_(["APPROVED", "DISBURSED"])).scalar() or 0
    needs_review = db.query(func.count(LoanApplication.id)).filter(LoanApplication.final_decision == "NEEDS_REVIEW").scalar() or 0
    declined = db.query(func.count(LoanApplication.id)).filter(LoanApplication.final_decision == "DECLINED").scalar() or 0
    
    disbursed_sum = db.query(func.sum(DisbursementRecord.disbursement_amount)).scalar() or 0.0
    avg_cibil = db.query(func.avg(LoanApplication.cibil_score)).scalar() or 0.0
    avg_dti = db.query(func.avg(LoanApplication.debt_to_income_ratio)).scalar() or 0.0
    
    return {
        "officer": {
            "name": settings.CHIEF_UNDERWRITER_NAME,
            "id": settings.CHIEF_UNDERWRITER_ID,
            "title": settings.CHIEF_UNDERWRITER_TITLE,
            "regulator": "Reserve Bank of India (RBI)"
        },
        "stats": {
            "total_applications": total,
            "approved_count": approved,
            "needs_review_count": needs_review,
            "declined_count": declined,
            "total_disbursed_amount_inr": disbursed_sum,
            "average_cibil": round(avg_cibil, 1),
            "average_dti_percentage": round(avg_dti, 1)
        }
    }

@router.post("/override")
def submit_underwriter_override(payload: OverrideRequest, db: Session = Depends(get_db)):
    """
    Executes Chief Underwriter manual override with immutable audit logging.
    Officer: Dr. Arulmozhi Varman (EMP-90421).
    """
    app = db.query(LoanApplication).filter(LoanApplication.id == payload.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Loan Application not found")
        
    prev_status = app.final_decision
    
    action_map = {
        "APPROVE": "APPROVED",
        "REJECT": "DECLINED",
        "REQUEST_DOCUMENTS": "NEEDS_REVIEW"
    }
    new_status = action_map.get(payload.action.upper(), "NEEDS_REVIEW")
    
    app.final_decision = new_status
    app.is_officer_overridden = True
    
    audit_entry = create_immutable_audit_log(
        db=db,
        application_id=app.id,
        action=f"OFFICER_OVERRIDE_{payload.action.upper()}",
        previous_status=prev_status,
        new_status=new_status,
        justification=payload.justification,
        officer_id=payload.officer_id,
        officer_name=payload.officer_name
    )
    
    db.commit()
    db.refresh(app)
    
    return {
        "status": "OVERRIDE_RECORDED",
        "application_id": app.id,
        "previous_status": prev_status,
        "new_status": new_status,
        "officer_name": payload.officer_name,
        "officer_id": payload.officer_id,
        "digital_signature": audit_entry.digital_signature,
        "timestamp": audit_entry.timestamp.isoformat()
    }

@router.get("/trail/{application_id}")
def get_application_audit_trail(application_id: str, db: Session = Depends(get_db)):
    """
    Retrieves complete chronological immutable audit log for an application.
    """
    logs = get_audit_trail(db, application_id)
    return [
        {
            "id": log.id,
            "action": log.action,
            "previous_status": log.previous_status,
            "new_status": log.new_status,
            "officer_id": log.officer_id,
            "officer_name": log.officer_name,
            "justification": log.justification,
            "digital_signature": log.digital_signature,
            "timestamp": log.timestamp.isoformat()
        }
        for log in logs
    ]
