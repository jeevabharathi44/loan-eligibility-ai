"""
Explainable AI (EBM) Underwriting Engine.
Integrates Microsoft InterpretML Explainable Boosting Machine (GA²M)
with reducing-balance EMI calculation, calibrated risk probabilities,
and local logit feature attributions.
"""
import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List

from ..config import settings


_model = None


def get_ebm_model():
    """Loads and caches the trained Explainable Boosting Machine model."""
    global _model
    if _model is None:
        primary = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models_artifacts", "ebm_loan_model.joblib"))
        if os.path.exists(primary):
            _model = joblib.load(primary)
        elif os.path.exists(settings.ML_MODEL_PATH):
            _model = joblib.load(settings.ML_MODEL_PATH)
        else:
            alt_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ml-service/models/ebm_model.pkl"))
            if os.path.exists(alt_path):
                _model = joblib.load(alt_path)
    return _model


def calculate_reducing_balance_emi(
    loan_amount: float,
    loan_tenure_months: int,
    annual_interest_rate: float = 0.105
) -> Dict[str, float]:
    """
    Standard reducing-balance amortization calculation.
    """
    if loan_tenure_months <= 0 or loan_amount <= 0:
        return {
            "monthly_emi": 0.0,
            "total_interest": 0.0,
            "total_repayment": 0.0,
            "annual_rate": annual_interest_rate
        }

    monthly_rate = annual_interest_rate / 12.0
    factor = (1.0 + monthly_rate) ** loan_tenure_months
    emi = (loan_amount * monthly_rate * factor) / (factor - 1.0)
    total_repayment = emi * loan_tenure_months
    total_interest = total_repayment - loan_amount

    return {
        "monthly_emi": round(float(emi), 2),
        "total_interest": round(float(total_interest), 2),
        "total_repayment": round(float(total_repayment), 2),
        "annual_rate": annual_interest_rate
    }


def prepare_features(payload: Dict[str, Any]) -> pd.DataFrame:
    """Transforms raw loan application data into model features."""
    loan_amt = float(payload.get('loan_amount') or payload.get('loanAmount', 0))
    # Convert lakhs to INR if <= 500
    if 0.1 <= loan_amt <= 500:
        loan_amt_inr = loan_amt * 100000.0
    else:
        loan_amt_inr = loan_amt

    tenure = int(payload.get('loan_tenure') or payload.get('loanTenure', 36))
    income = max(1.0, float(payload.get('income', 10000)))
    obligations = float(payload.get('monthly_obligations') or payload.get('monthlyObligations', 0))

    emi_data = calculate_reducing_balance_emi(loan_amt_inr, tenure)
    emi = emi_data["monthly_emi"]
    dti = (obligations + emi) / income
    lti = loan_amt_inr / (income * 12.0)

    emp_type = str(payload.get('employment_type') or payload.get('employmentType', 'salaried')).lower()
    if emp_type in ['self', 'self-employed', 'business']:
        emp_type = 'self_employed'
    elif emp_type not in ['salaried', 'self_employed', 'not_employed']:
        emp_type = 'salaried'

    record = {
        'age': int(payload.get('age', 30)),
        'income': income,
        'dependents': int(payload.get('dependents', 0)),
        'existing_loans': int(payload.get('existing_loans') or payload.get('existingLoans', 0)),
        'monthly_obligations': obligations,
        'loan_amount': loan_amt_inr,
        'loan_tenure': tenure,
        'cibil_score': int(payload.get('cibil_score') or payload.get('cibilScore', 700)),
        'payment_history': float(payload.get('payment_history') or payload.get('paymentHistory', 90.0)),
        'credit_utilization': float(payload.get('credit_utilization') or payload.get('creditUtilization', 30.0)),
        'credit_history_years': float(payload.get('credit_history_years') or payload.get('creditHistoryYears', 5.0)),
        'recent_enquiries': int(payload.get('recent_enquiries') or payload.get('recentEnquiries', 1)),
        'estimated_emi': emi,
        'debt_to_income_ratio': round(dti, 4),
        'loan_to_income_ratio': round(lti, 4),
        'employment_type': emp_type,
        'loan_purpose': str(payload.get('loan_purpose') or payload.get('loanPurpose', 'personal')).lower()
    }
    return pd.DataFrame([record])


FEATURE_LABELS = {
    'cibil_score': 'CIBIL Credit Score',
    'income': 'Monthly Net Income',
    'debt_to_income_ratio': 'Debt-to-Income (FOIR)',
    'payment_history': 'On-Time Payment History',
    'credit_utilization': 'Credit Card Utilization',
    'loan_amount': 'Requested Loan Amount',
    'loan_to_income_ratio': 'Loan-to-Annual Income',
    'employment_type': 'Employment Stability',
    'estimated_emi': 'Calculated Monthly EMI',
    'credit_history_years': 'Bureau History Length',
    'recent_enquiries': 'Recent Credit Enquiries',
    'age': 'Applicant Age',
    'existing_loans': 'Active Loan Facilities',
    'monthly_obligations': 'Existing Debt Burden',
    'dependents': 'Family Dependents'
}


def explain_ebm_prediction(model, X_df: pd.DataFrame) -> Dict[str, Any]:
    """Extracts exact local logit contributions from EBM."""
    try:
        local_exp = model.explain_local(X_df)
        perf_data = local_exp.data(0)

        names = perf_data.get('names', [])
        scores = perf_data.get('scores', [])
        values = perf_data.get('values', [])
    except Exception:
        # Fallback if explain_local fails
        names = list(X_df.columns)
        scores = [0.0] * len(names)
        values = [str(X_df[col].iloc[0]) for col in names]

    all_factors = []
    positive_factors = []
    negative_factors = []

    for name, score, val in zip(names, scores, values):
        score_val = float(score)
        val_str = str(val) if val is not None else ""

        # Friendly explanation
        label = FEATURE_LABELS.get(name, name.replace('_', ' ').title())
        direction = "POSITIVE" if score_val >= 0 else "NEGATIVE"

        if score_val >= 0:
            exp_text = f"{label} ({val_str}) positively bolsters approval probability (+{abs(score_val):.2f} logit contribution)."
        else:
            exp_text = f"{label} ({val_str}) introduces adverse underwriting risk (-{abs(score_val):.2f} logit penalty)."

        factor_obj = {
            "feature": name,
            "featureLabel": label,
            "value": val_str,
            "contribution": round(score_val, 3),
            "direction": direction,
            "explanation": exp_text
        }
        all_factors.append(factor_obj)
        if score_val >= 0:
            positive_factors.append(factor_obj)
        else:
            negative_factors.append(factor_obj)

    # Sort factors by impact magnitude
    all_factors.sort(key=lambda x: abs(x["contribution"]), reverse=True)
    positive_factors.sort(key=lambda x: x["contribution"], reverse=True)
    negative_factors.sort(key=lambda x: abs(x["contribution"]), reverse=True)

    return {
        "positive_factors": positive_factors[:5],
        "negative_factors": negative_factors[:5],
        "all_factors": all_factors[:10]
    }


def evaluate_applicant_risk(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates loan application with trained EBM model and underwriting policy rules.
    """
    model = get_ebm_model()
    X_df = prepare_features(payload)

    cibil = int(X_df['cibil_score'].iloc[0])
    emp_type = str(X_df['employment_type'].iloc[0])
    dti = float(X_df['debt_to_income_ratio'].iloc[0])

    if model is not None:
        model_features = getattr(model, 'feature_names_in_', None)
        if model_features is not None:
            ebm_input = {}
            for feat in model_features:
                if feat in X_df.columns:
                    ebm_input[feat] = X_df[feat].iloc[0]
                elif feat == "monthly_income":
                    ebm_input[feat] = float(X_df["income"].iloc[0])
                elif feat == "simulated_credit_score":
                    ebm_input[feat] = float(X_df["cibil_score"].iloc[0])
                elif feat == "debt_to_income_pct":
                    ebm_input[feat] = float(X_df["debt_to_income_ratio"].iloc[0] * 100.0)
                elif feat == "simulated_payment_history_ratio":
                    raw_p = float(X_df["payment_history"].iloc[0])
                    ebm_input[feat] = raw_p / 100.0 if raw_p > 1.0 else raw_p
                elif feat == "simulated_credit_utilization":
                    raw_u = float(X_df["credit_utilization"].iloc[0])
                    ebm_input[feat] = raw_u / 100.0 if raw_u > 1.0 else raw_u
                elif feat == "employment_tenure_months":
                    ebm_input[feat] = 24.0
                elif feat == "loan_to_income_ratio":
                    ebm_input[feat] = float(X_df["loan_to_income_ratio"].iloc[0])
                else:
                    ebm_input[feat] = 0.0
            X_eval = pd.DataFrame([ebm_input])
        else:
            X_eval = X_df

        probabilities = model.predict_proba(X_eval)[0]
        prob_approved = float(probabilities[1])
        prob_percentage = round(prob_approved * 100, 1)
        explanations = explain_ebm_prediction(model, X_eval)
    else:
        # Heuristic fallback if model weights missing
        prob_approved = 0.85 if cibil >= 750 else (0.55 if cibil >= 650 else 0.20)
        prob_percentage = round(prob_approved * 100, 1)
        explanations = {"positive_factors": [], "negative_factors": [], "all_factors": []}

    # Policy Overlay Rules
    if cibil < 550 or emp_type == "not_employed" or dti > 0.70:
        predicted_class = "Declined"
        risk_level = "High"
    elif prob_approved >= 0.65 and dti <= 0.50 and cibil >= 700:
        predicted_class = "Approved"
        risk_level = "Low"
    elif prob_approved >= 0.40:
        predicted_class = "Needs Review"
        risk_level = "Moderate"
    else:
        predicted_class = "Declined"
        risk_level = "High"

    emi = float(X_df['estimated_emi'].iloc[0])
    loan_amt = float(X_df['loan_amount'].iloc[0])

    return {
        "predicted_class": predicted_class,
        "predictedClass": predicted_class,
        "probability": prob_approved,
        "probability_percentage": prob_percentage,
        "probabilityPercentage": prob_percentage,
        "risk_level": risk_level,
        "riskLevel": risk_level,
        "model_version": "v1.2.0-ebm",
        "model_name": "Explainable Boosting Machine (EBM)",
        "positive_factors": explanations["positive_factors"],
        "negative_factors": explanations["negative_factors"],
        "all_factors": explanations["all_factors"],
        "factors": explanations["all_factors"],
        "derived_features": {
            "estimated_emi": emi,
            "debt_to_income_ratio": dti,
            "loan_to_income_ratio": float(X_df['loan_to_income_ratio'].iloc[0]),
            "loan_amount_inr": loan_amt
        },
        "disclaimer": "This assessment is an AI-assisted risk prediction for demonstration and research purposes and is not a guaranteed loan approval or denial."
    }


# Compatibility alias
predict_loan_eligibility = evaluate_applicant_risk

