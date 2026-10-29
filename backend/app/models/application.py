import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, JSON
from app.database import Base

class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_no = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(String(36), nullable=False, index=True)
    applicant_name = Column(String(150), nullable=False)
    
    # Financial profile
    age = Column(Integer, nullable=False, default=30)
    monthly_income = Column(Float, nullable=False) # INR
    employment_type = Column(String(30), nullable=False) # salaried, self_employed, not_employed
    dependents = Column(Integer, default=1)
    existing_loans = Column(Integer, default=0)
    monthly_obligations = Column(Float, default=0.0) # INR
    
    # Loan parameters
    requested_amount = Column(Float, nullable=False) # INR
    tenure_months = Column(Integer, nullable=False, default=36)
    loan_purpose = Column(String(50), default="personal")
    
    # Credit Bureau Profile
    cibil_score = Column(Integer, nullable=False) # 300 to 900
    payment_history_pct = Column(Float, default=95.0)
    credit_utilization_pct = Column(Float, default=30.0)
    credit_history_years = Column(Float, default=5.0)
    recent_enquiries = Column(Integer, default=1)
    
    # Computed Financial Ratios
    calculated_emi = Column(Float, nullable=False)
    debt_to_income_ratio = Column(Float, nullable=False) # DTI / FOIR
    loan_to_income_ratio = Column(Float, nullable=False) # LTI
    
    # AI Underwriting Decision Gates
    approval_probability = Column(Float, nullable=False) # 0.0 to 1.0
    risk_tier = Column(String(30), nullable=False) # PRIME, NEAR_PRIME, SUBPRIME
    system_decision = Column(String(30), nullable=False) # APPROVED, NEEDS_REVIEW, DECLINED
    final_decision = Column(String(30), nullable=False)  # APPROVED, NEEDS_REVIEW, DECLINED, DISBURSED
    
    # Explainability & Decision notes
    decision_summary = Column(Text, nullable=True)
    decision_reasons = Column(JSON, nullable=True) # List of strings explaining why
    is_officer_overridden = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class EBMExplanation(Base):
    __tablename__ = "ebm_explanations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String(36), unique=True, index=True, nullable=False)
    
    intercept = Column(Float, nullable=False, default=0.0)
    final_score = Column(Float, nullable=False, default=0.0) # Sum of logits
    
    # Structured factors JSON
    positive_factors = Column(JSON, nullable=False)
    negative_factors = Column(JSON, nullable=False)
    all_factors = Column(JSON, nullable=False)
    waterfall_data = Column(JSON, nullable=False)
    
    model_version = Column(String(50), default="InterpretML-EBM-GA2M-v2.0")
    created_at = Column(DateTime, default=datetime.utcnow)
