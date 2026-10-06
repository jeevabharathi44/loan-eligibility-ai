"""
FastAPI application for Loan Eligibility AI ML Service.
Provides REST endpoints for model inference, health checks, and explainability metrics.
"""
import os
import json
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from predict import predict_loan_eligibility, get_model

app = FastAPI(
    title="Loan Eligibility AI - ML Service",
    description="Explainable Boosting Machine (EBM) inference and explainability API",
    version="1.2.0"
)

# Enable CORS for backend and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
METRICS_PATH = os.path.join(BASE_DIR, "models", "metrics.json")


class ApplicantLoanPayload(BaseModel):
    name: Optional[str] = "Applicant"
    age: int = Field(..., ge=18, le=75, description="Applicant age between 18 and 75")
    employment_type: str = Field(..., description="salaried, self_employed, or not_employed")
    income: float = Field(..., ge=5000, description="Monthly income in INR")
    dependents: int = Field(0, ge=0, le=10, description="Number of dependents")
    existing_loans: int = Field(0, ge=0, le=10, description="Number of active loans")
    monthly_obligations: float = Field(0.0, ge=0, description="Existing monthly debt obligations in INR")
    loan_amount: float = Field(..., gt=0, description="Requested loan amount (in Lakhs if <= 500, else INR)")
    loan_tenure: int = Field(36, ge=6, le=360, description="Loan tenure in months")
    loan_purpose: Optional[str] = Field("personal", description="personal, home, education, business, vehicle")
    cibil_score: int = Field(..., ge=300, le=900, description="CIBIL credit score (300-900)")
    payment_history: float = Field(85.0, ge=0, le=100, description="On-time payment percentage")
    credit_utilization: float = Field(30.0, ge=0, le=100, description="Credit card utilization percentage")
    credit_history_years: float = Field(5.0, ge=0, le=50, description="Credit history length in years")
    recent_enquiries: int = Field(1, ge=0, le=20, description="Number of credit enquiries in last 6 months")


@app.get("/health")
def health_check():
    """Service health and model status check."""
    try:
        model = get_model()
        model_ready = model is not None
    except Exception:
        model_ready = False

    return {
        "status": "healthy" if model_ready else "degraded",
        "service": "Loan Eligibility ML Service",
        "model": "Explainable Boosting Machine (EBM)",
        "model_version": "v1.2.0-ebm",
        "model_ready": model_ready
    }


@app.get("/metrics")
def get_metrics():
    """Returns actual trained model evaluation metrics and feature importances."""
    if not os.path.exists(METRICS_PATH):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model metrics not generated. Please run train.py first."
        )
    with open(METRICS_PATH, "r") as f:
        metrics_data = json.load(f)
    return metrics_data


@app.post("/predict")
def predict_endpoint(payload: ApplicantLoanPayload):
    """
    Evaluates loan eligibility using the trained EBM model and returns explainability factors.
    """
    try:
        result = predict_loan_eligibility(payload.model_dump())
        result["applicant_name"] = payload.name
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference failure: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
