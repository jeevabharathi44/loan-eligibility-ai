import json
import os
from fastapi import APIRouter, HTTPException
from app.config import settings
from app.schemas.underwriting import UnderwritingEvaluateRequest, UnderwritingResponse
from app.services.ebm_service import evaluate_underwriting_decision

router = APIRouter(prefix="/underwriting", tags=["Explainable Boosting Machine (EBM) Underwriting Engine (Module 4 & 5)"])

@router.post("/evaluate", response_model=UnderwritingResponse)
def evaluate_loan_application(payload: UnderwritingEvaluateRequest):
    """
    Evaluates loan application with Microsoft InterpretML EBM (GA²M) and applies
    dynamic underwriting decision gates (Prime, Near-Prime, Subprime).
    """
    try:
        result = evaluate_underwriting_decision(payload.model_dump())
        result["applicant_name"] = payload.name
        result["application_id"] = payload.application_id
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"EBM Underwriting Evaluation failed: {str(e)}")

@router.get("/metrics")
def get_ebm_model_metrics():
    """
    Returns authentic training metrics and global feature importance from the EBM model.
    """
    if not os.path.exists(settings.METRICS_PATH):
        raise HTTPException(status_code=404, detail="EBM metrics.json not found")
    with open(settings.METRICS_PATH, "r") as f:
        metrics = json.load(f)
    return metrics
