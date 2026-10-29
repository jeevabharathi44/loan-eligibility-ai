from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class UnderwritingEvaluateRequest(BaseModel):
    application_id: Optional[str] = None
    name: str = "Applicant"
    age: int = Field(30, ge=18, le=75)
    income: float = Field(..., ge=5000, description="Net Monthly Income in INR")
    employment_type: str = Field(..., description="salaried, self_employed, not_employed")
    dependents: int = Field(1, ge=0, le=10)
    existing_loans: int = Field(0, ge=0, le=10)
    monthly_obligations: float = Field(0.0, ge=0)
    loan_amount: float = Field(..., gt=0, description="Loan amount in INR")
    loan_tenure: int = Field(36, ge=6, le=360, description="Tenure in months")
    loan_purpose: str = Field("personal")
    cibil_score: int = Field(..., ge=300, le=900)
    payment_history: float = Field(95.0, ge=0, le=100)
    credit_utilization: float = Field(30.0, ge=0, le=100)
    credit_history_years: float = Field(5.0, ge=0, le=50)
    recent_enquiries: int = Field(1, ge=0, le=20)
    
    # Biometric & Cross-Field states
    biometrics_passed: bool = True
    biometric_similarity: float = 88.0
    name_similarity: float = 100.0
    cross_field_status: str = "MATCH" # MATCH, DISCREPANCY_FLAG, MISMATCH

class EBMFactor(BaseModel):
    feature: str
    feature_label: str
    value: Any
    contribution: float
    direction: str # positive, negative
    explanation: str

class WaterfallBar(BaseModel):
    name: str
    type: str # base, bonus, penalty, total
    value: float # Contribution delta
    running_total: float
    color: str

class UnderwritingResponse(BaseModel):
    application_id: Optional[str] = None
    application_no: Optional[str] = None
    applicant_name: str
    risk_tier: str # PRIME, NEAR_PRIME, SUBPRIME
    system_decision: str # APPROVED, NEEDS_REVIEW, DECLINED
    probability: float
    probability_percentage: float
    
    # Financial metrics
    estimated_emi: float
    debt_to_income_ratio: float # DTI (FOIR)
    loan_to_income_ratio: float # LTI
    loan_amount: float
    
    # Explanations
    intercept: float
    positive_factors: List[EBMFactor]
    negative_factors: List[EBMFactor]
    all_factors: List[EBMFactor]
    waterfall_bars: List[WaterfallBar]
    decision_summary: str
    decision_reasons: List[str]
    rbi_compliance_notice: str
