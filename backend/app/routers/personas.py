from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.persona_service import get_all_personas, get_persona_by_id
from app.schemas.underwriting import UnderwritingEvaluateRequest
from app.routers.applications import submit_loan_application
from app.services.disbursement_service import execute_simulated_disbursement
from app.models.application import LoanApplication

router = APIRouter(prefix="/personas", tags=["Benchmark Demonstration Personas (Module 5 & Viva Testing)"])

@router.get("")
def list_demo_personas():
    """
    Returns the benchmark demonstration personas for Viva testing:
    1. Jeeva Bharathi M: Salaried, CIBIL 785, DTI 28% -> Instant Approval
    2. Jeeva B: Self-Employed, CIBIL 662, DTI 48%, Name Disparity -> Underwriter Review
    3. Karthik Raman: Subprime CIBIL 535, DTI 82% -> Automated Policy Rejection
    """
    return get_all_personas()

@router.get("/{persona_id}")
def get_persona(persona_id: str):
    return get_persona_by_id(persona_id)

@router.post("/{persona_id}/seed")
def seed_persona_application(persona_id: str, db: Session = Depends(get_db)):
    """
    1-Click Viva Test Seeder: creates a full live application in the database
    for the selected persona with complete KYC, biometrics, EBM explanations,
    and decision gate status.
    """
    p = get_persona_by_id(persona_id)
    
    payload = UnderwritingEvaluateRequest(
        name=p["name"],
        age=p["age"],
        income=p["income"],
        employment_type=p["employment_type"],
        dependents=p["dependents"],
        existing_loans=p["existing_loans"],
        monthly_obligations=p["monthly_obligations"],
        loan_amount=p["loan_amount"],
        loan_tenure=p["loan_tenure"],
        loan_purpose=p["loan_purpose"],
        cibil_score=p["cibil_score"],
        payment_history=p["payment_history"],
        credit_utilization=p["credit_utilization"],
        credit_history_years=p["credit_history_years"],
        recent_enquiries=p["recent_enquiries"],
        biometrics_passed=(p.get("biometric_similarity", 85) >= 75.0),
        biometric_similarity=p.get("biometric_similarity", 85.0),
        name_similarity=p.get("name_similarity", 100.0),
        cross_field_status=p.get("cross_field_status", "MATCH")
    )
    
    result = submit_loan_application(payload, db)
    
    # If prime approved persona, simulate disbursement
    if result["system_decision"] == "APPROVED" and persona_id == "jeeva_bharathi":
        app_obj = db.query(LoanApplication).filter(LoanApplication.id == result["application_id"]).first()
        if app_obj:
            execute_simulated_disbursement(db, app_obj)
            result["disbursed"] = True
            
    return {
        "status": "SEEDED_SUCCESSFULLY",
        "persona_id": persona_id,
        "applicant_name": p["name"],
        "application_id": result["application_id"],
        "system_decision": result["system_decision"],
        "risk_tier": result["risk_tier"],
        "calibrated_probability": result["probability_percentage"]
    }
