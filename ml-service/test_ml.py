"""
Tests for ML Service prediction, explanations, and API endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app import app
from predict import predict_loan_eligibility
from preprocessing import calculate_emi, calculate_dti, calculate_lti

client = TestClient(app)


def test_financial_calculations():
    # Test EMI on 10 lakh, 36 months, 10.5% annual rate
    emi = calculate_emi(1000000, 36, 0.105)
    assert 32000 < emi < 33000

    # Test DTI
    dti = calculate_dti(10000, 20000, 60000)
    assert dti == 0.5

    # Test LTI
    lti = calculate_lti(600000, 50000)
    assert lti == 1.0


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_ready"] is True


def test_metrics_endpoint():
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "ebm" in data
    assert "baseline" in data
    assert data["ebm"]["accuracy"] > 0.90
    assert len(data["feature_importances"]) > 0


def test_predict_approved_profile():
    payload = {
        "name": "Arjun Sharma",
        "age": 30,
        "income": 90000,
        "loan_amount": 8,  # 8 lakhs
        "loan_tenure": 36,
        "employment_type": "salaried",
        "dependents": 1,
        "existing_loans": 1,
        "monthly_obligations": 5000,
        "cibil_score": 780,
        "payment_history": 98,
        "credit_utilization": 20,
        "credit_history_years": 8,
        "recent_enquiries": 1
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_class"] == "Approved"
    assert data["risk_level"] == "Low"
    assert len(data["positive_factors"]) > 0
    assert "disclaimer" in data


def test_predict_declined_profile():
    payload = {
        "name": "Rajan Verma",
        "age": 55,
        "income": 25000,
        "loan_amount": 30,  # 30 lakhs
        "loan_tenure": 60,
        "employment_type": "self_employed",
        "dependents": 4,
        "existing_loans": 3,
        "monthly_obligations": 15000,
        "cibil_score": 520,  # Subprime
        "payment_history": 60,
        "credit_utilization": 90,
        "credit_history_years": 2,
        "recent_enquiries": 6
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_class"] == "Declined"
    assert data["risk_level"] == "High"
    assert len(data["negative_factors"]) > 0


def test_predict_validation_error():
    payload = {
        "age": 12,  # Invalid age (< 18)
        "income": 90000
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422
