"""
Inference pipeline for Loan Eligibility AI.
Loads trained EBM model, performs feature transformation, evaluates risk,
and attaches explainable factors.
"""
import os
import joblib
import pandas as pd
from typing import Dict, Any

from preprocessing import prepare_features
from explain import extract_ebm_explanations

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "ebm_model.pkl")

_ebm_model = None


def get_model():
    global _ebm_model
    if _ebm_model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Run train.py first.")
        _ebm_model = joblib.load(MODEL_PATH)
    return _ebm_model


def predict_loan_eligibility(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates loan application with trained EBM model.
    Returns predicted class, calibrated probability, risk level, feature contributions,
    and plain-English explanations.
    """
    model = get_model()
    X_df = prepare_features(input_data)

    # Raw model probabilities
    probabilities = model.predict_proba(X_df)[0]
    prob_approved = float(probabilities[1])
    prob_percentage = round(prob_approved * 100, 1)

    cibil = int(input_data.get('cibil_score', 650))
    emp_type = str(input_data.get('employment_type', 'salaried')).lower()

    # Domain risk rule overlay on top of calibrated probability
    # CIBIL < 550 is declined by credit policy across Indian lenders
    if cibil < 550 or emp_type == "not_employed":
        predicted_class = "Declined"
        risk_level = "High"
    elif prob_approved >= 0.65:
        predicted_class = "Approved"
        risk_level = "Low"
    elif prob_approved >= 0.40:
        predicted_class = "Needs Review"
        risk_level = "Moderate"
    else:
        predicted_class = "Declined"
        risk_level = "High"

    # Explainability
    explanation_res = extract_ebm_explanations(model, X_df)

    derived_features = {
        "estimated_emi": float(X_df['estimated_emi'].iloc[0]),
        "debt_to_income_ratio": float(X_df['debt_to_income_ratio'].iloc[0]),
        "loan_to_income_ratio": float(X_df['loan_to_income_ratio'].iloc[0]),
        "loan_amount_inr": float(X_df['loan_amount'].iloc[0])
    }

    return {
        "predicted_class": predicted_class,
        "probability": prob_approved,
        "probability_percentage": prob_percentage,
        "risk_level": risk_level,
        "model_version": "v1.2.0-ebm",
        "model_name": "Explainable Boosting Machine (EBM)",
        "positive_factors": explanation_res["positive_factors"],
        "negative_factors": explanation_res["negative_factors"],
        "all_factors": explanation_res["all_factors"],
        "derived_features": derived_features,
        "disclaimer": "This assessment is an AI-assisted risk assessment for demonstration/research purposes and is not a guaranteed loan approval or denial."
    }
