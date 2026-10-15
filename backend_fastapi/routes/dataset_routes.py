"""
Dataset Exploration and Telemetry Routes for Loan Assistant.
Exposes benchmark training dataset summary and sample rows for explainability.
"""
import os
import pandas as pd
from typing import Optional
from fastapi import APIRouter, Query, HTTPException

router = APIRouter(prefix="/api/dataset", tags=["Dataset & Telemetry"])

DATASET_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dataset", "loan_credit_dataset.csv")
if not os.path.exists(DATASET_PATH):
    # Fallback to ml-service
    DATASET_PATH = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "ml-service", "dataset", "loan_credit_dataset.csv"))


def load_dataset() -> pd.DataFrame:
    if not os.path.exists(DATASET_PATH):
        raise HTTPException(status_code=404, detail="Dataset file not found.")
    return pd.read_csv(DATASET_PATH)


@router.get("/summary")
def get_dataset_summary():
    """Returns descriptive statistical summary of the 3,500 training instances."""
    df = load_dataset()
    return {
        "success": True,
        "total_records": int(len(df)),
        "features_count": int(df.shape[1]),
        "features": list(df.columns),
        "target_distribution": {
            "approved": int((df["loan_status"] == 1).sum()),
            "rejected_or_review": int((df["loan_status"] == 0).sum()),
        },
        "risk_distribution": df["risk_level"].value_counts().to_dict(),
        "employment_distribution": df["employment_type"].value_counts().to_dict(),
        "averages": {
            "avg_cibil_score": round(float(df["cibil_score"].mean()), 1),
            "avg_income": round(float(df["income"].mean()), 2),
            "avg_loan_amount": round(float(df["loan_amount"].mean()), 2),
            "avg_debt_to_income": round(float(df["debt_to_income_ratio"].mean()), 3),
        }
    }


@router.get("/sample")
def get_dataset_sample(
    limit: int = Query(25, ge=5, le=100),
    risk_level: Optional[str] = Query(None),
    employment_type: Optional[str] = Query(None)
):
    """Returns sample records with optional filtering by risk level or employment type."""
    df = load_dataset()
    if risk_level:
        df = df[df["risk_level"].str.lower() == risk_level.lower()]
    if employment_type:
        df = df[df["employment_type"].str.lower() == employment_type.lower()]

    sample_df = df.head(limit)
    records = sample_df.to_dict(orient="records")
    return {
        "success": True,
        "count": len(records),
        "total_matching": int(len(df)),
        "data": records
    }
