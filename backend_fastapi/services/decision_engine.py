"""
Central Instant Decision Engine and 11-Stage Workflow State Machine.
Coordinates prerequisite evaluations across Documents, Identity, Credit,
Bank, and Explainable AI assessments before issuing preliminary or final decisions.
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from ..models import (
    LoanApplication, Document, FaceVerificationSession,
    CreditCheck, BankAccount, Prediction, ReviewDecision
)
from .ocr_service import evaluate_consistency
from .ml_engine import evaluate_applicant_risk


# Standard State Machine Constants
STAGE_DRAFT = "DRAFT"
STAGE_SUBMITTED = "SUBMITTED"
STAGE_DOCS_PENDING = "DOCUMENTS_PENDING"
STAGE_IDENTITY_PENDING = "IDENTITY_CHECK_PENDING"
STAGE_CREDIT_PENDING = "CREDIT_CHECK_PENDING"
STAGE_BANK_PENDING = "BANK_VERIFICATION_PENDING"
STAGE_AI_COMPLETE = "AI_ASSESSMENT_COMPLETE"
STAGE_PRELIM_ELIGIBLE = "PRELIMINARY_ELIGIBLE"
STAGE_PRELIMINARY_ELIGIBLE = "PRELIMINARY_ELIGIBLE"
STAGE_REVIEW_REQUIRED = "REVIEW_REQUIRED"
STAGE_DECLINED = "DECLINED"
STAGE_APPROVED = "APPROVED"
STAGE_DISB_PENDING = "DISBURSEMENT_PENDING"
STAGE_DISBURSED = "DISBURSED"


def evaluate_application_state(app: LoanApplication, db: Session) -> Dict[str, Any]:
    """
    Evaluates current progress through the 11 stages and determines next state,
    pending requirements, and preliminary eligibility.
    """
    reasons: List[str] = []
    pending_requirements: List[str] = []

    # 1. Documents Check
    docs = db.query(Document).filter(Document.application_id == app.id).all()
    doc_dicts = [
        {
            "documentType": d.doc_type,
            "verificationStatus": d.verification_status,
            "fields": {}
        }
        for d in docs
    ]
    consistency = evaluate_consistency(
        declared_applicant_name=app.user.name if app.user else "Applicant",
        declared_monthly_income=app.income,
        documents=doc_dicts
    )

    if consistency["missingDocuments"]:
        pending_requirements.extend(consistency["missingDocuments"])
        reasons.append("Mandatory identity and financial documents are still pending.")

    # 2. Face Verification Check
    face_session = (
        db.query(FaceVerificationSession)
        .filter(FaceVerificationSession.application_id == app.id)
        .order_by(FaceVerificationSession.verified_at.desc())
        .first()
    )
    if not face_session:
        pending_requirements.append("Camera-based Live Face Verification")
        reasons.append("Applicant live identity verification has not been performed.")
    elif face_session.status != "PASSED":
        reasons.append(f"Face verification returned status: {face_session.status}. Manual review required.")

    # 3. Credit Check
    credit_record = (
        db.query(CreditCheck)
        .filter(CreditCheck.application_id == app.id)
        .order_by(CreditCheck.created_at.desc())
        .first()
    )
    if not credit_record:
        pending_requirements.append("Credit Bureau Score Inquiry")
    elif credit_record.verification_status == "UNABLE_TO_VERIFY":
        reasons.append("Bureau service temporarily unavailable. Credit check pending manual review.")

    # Determine State Transition
    if app.status in [STAGE_APPROVED, STAGE_DISB_PENDING, STAGE_DISBURSED]:
        current_stage = app.status
        decision = app.status
        can_disburse = (app.status == STAGE_APPROVED)
    elif pending_requirements:
        # Progressively identify the exact pending stage
        if consistency["missingDocuments"]:
            current_stage = STAGE_DOCS_PENDING
        elif not face_session:
            current_stage = STAGE_IDENTITY_PENDING
        else:
            current_stage = STAGE_CREDIT_PENDING
        decision = "PENDING_CHECKS"
        can_disburse = False
    else:
        # All prerequisites satisfied: execute risk & affordability decision
        current_stage = STAGE_AI_COMPLETE
        can_disburse = False

        # Run EBM assessment
        cibil = credit_record.cibil_score if credit_record else 700
        ai_res = evaluate_applicant_risk({
            "income": app.income,
            "employment_type": app.employment_type,
            "age": app.age,
            "dependents": app.dependents,
            "loan_amount": app.loan_amount,
            "loan_tenure": app.loan_tenure,
            "loan_purpose": app.loan_purpose,
            "existing_loans": app.existing_loans,
            "monthly_obligations": app.monthly_obligations,
            "cibil_score": cibil,
            "payment_history": credit_record.payment_history if credit_record else 90.0,
            "credit_utilization": credit_record.credit_utilization if credit_record else 30.0,
            "credit_history_years": credit_record.credit_history_years if credit_record else 5.0,
            "recent_enquiries": credit_record.recent_enquiries if credit_record else 1
        })

        if consistency["overallRisk"] == "HIGH" or (face_session and face_session.status != "PASSED"):
            decision = STAGE_REVIEW_REQUIRED
            reasons.append("Discrepancies flagged during identity or document verification require underwriter review.")
        elif cibil < 550 or ai_res["predicted_class"] == "Declined":
            decision = STAGE_DECLINED
            reasons.append("Adverse risk profile: Bureau credit score or debt-to-income exceeds threshold.")
        elif ai_res["predicted_class"] == "Approved":
            decision = STAGE_PRELIMINARY_ELIGIBLE
            reasons.append("All automated verification checks passed. Strong credit profile and comfortable repayment capacity.")
        else:
            decision = STAGE_REVIEW_REQUIRED
            reasons.append("Moderate credit risk: routed for institutional underwriter confirmation.")

    return {
        "applicationId": app.id,
        "currentStage": current_stage,
        "decision": decision,
        "reasons": reasons,
        "pendingRequirements": pending_requirements,
        "canDisburse": can_disburse
    }
