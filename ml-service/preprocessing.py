"""
Preprocessing and feature engineering module for Loan Eligibility AI.
Handles financial feature derivation, categorical encoding, and feature scaling.
"""
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
import joblib

FEATURE_NAMES = [
    'age',
    'income',
    'dependents',
    'existing_loans',
    'monthly_obligations',
    'loan_amount',
    'loan_tenure',
    'cibil_score',
    'payment_history',
    'credit_utilization',
    'credit_history_years',
    'recent_enquiries',
    'estimated_emi',
    'debt_to_income_ratio',
    'loan_to_income_ratio',
    'employment_type',
    'loan_purpose'
]

NUMERICAL_COLS = [
    'age',
    'income',
    'dependents',
    'existing_loans',
    'monthly_obligations',
    'loan_amount',
    'loan_tenure',
    'cibil_score',
    'payment_history',
    'credit_utilization',
    'credit_history_years',
    'recent_enquiries',
    'estimated_emi',
    'debt_to_income_ratio',
    'loan_to_income_ratio'
]

CATEGORICAL_COLS = ['employment_type', 'loan_purpose']


def calculate_emi(loan_amount: float, loan_tenure_months: int, annual_interest_rate: float = 0.105) -> float:
    """Calculates Equated Monthly Installment (EMI) using reducing balance method."""
    if loan_tenure_months <= 0 or loan_amount <= 0:
        return 0.0
    monthly_rate = annual_interest_rate / 12.0
    factor = (1.0 + monthly_rate) ** loan_tenure_months
    emi = (loan_amount * monthly_rate * factor) / (factor - 1.0)
    return float(round(emi, 2))


def calculate_dti(monthly_obligations: float, estimated_emi: float, monthly_income: float) -> float:
    """Calculates Debt-to-Income (DTI) ratio (Fixed Obligation to Income Ratio)."""
    if monthly_income <= 0:
        return 1.0
    return float(round((monthly_obligations + estimated_emi) / monthly_income, 4))


def calculate_lti(loan_amount: float, monthly_income: float) -> float:
    """Calculates Loan-to-Income (LTI) ratio against annual income."""
    annual_income = monthly_income * 12.0
    if annual_income <= 0:
        return 99.0
    return float(round(loan_amount / annual_income, 4))


def prepare_features(data_dict: dict) -> pd.DataFrame:
    """
    Transforms raw applicant input dictionary into feature-engineered DataFrame.
    """
    loan_amt = float(data_dict.get('loan_amount', 0))
    # If loan amount is supplied in lakhs (< 1000), convert to standard INR
    if 0.1 <= loan_amt <= 500:
        loan_amt_inr = loan_amt * 100000.0
    else:
        loan_amt_inr = loan_amt

    tenure = int(data_dict.get('loan_tenure', 36))
    income = max(1.0, float(data_dict.get('income', 10000)))
    obligations = float(data_dict.get('monthly_obligations', 0))

    emi = calculate_emi(loan_amt_inr, tenure)
    dti = calculate_dti(obligations, emi, income)
    lti = calculate_lti(loan_amt_inr, income)

    record = {
        'age': int(data_dict.get('age', 30)),
        'income': income,
        'dependents': int(data_dict.get('dependents', 0)),
        'existing_loans': int(data_dict.get('existing_loans', 0)),
        'monthly_obligations': obligations,
        'loan_amount': loan_amt_inr,
        'loan_tenure': tenure,
        'cibil_score': int(data_dict.get('cibil_score', 650)),
        'payment_history': float(data_dict.get('payment_history', 85)),
        'credit_utilization': float(data_dict.get('credit_utilization', 35)),
        'credit_history_years': float(data_dict.get('credit_history_years', 5)),
        'recent_enquiries': int(data_dict.get('recent_enquiries', 1)),
        'estimated_emi': emi,
        'debt_to_income_ratio': dti,
        'loan_to_income_ratio': lti,
        'employment_type': str(data_dict.get('employment_type', 'salaried')).lower(),
        'loan_purpose': str(data_dict.get('loan_purpose', 'personal')).lower()
    }

    df = pd.DataFrame([record])
    return df
