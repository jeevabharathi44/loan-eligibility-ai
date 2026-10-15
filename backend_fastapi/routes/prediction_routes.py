"""
Explainable AI (EBM) Prediction and EMI Calculator Routes.
Returns calibrated approval probabilities, exact local feature attributions, and amortization schedules.
"""
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, LoanApplication, CreditCheck, Prediction, PredictionFactor, AuditLog
from ..schemas import (
    PredictionResponse, PredictionFactorSchema,
    EMICalculatorRequest, EMICalculatorResponse
)
from ..services.ml_engine import evaluate_applicant_risk, calculate_reducing_balance_emi
from ..auth import get_current_user

router = APIRouter(prefix="/api", tags=["Explainable AI & Calculator"])


@router.post("/predictions/evaluate", response_model=PredictionResponse)
def evaluate_loan_prediction(
    applicationId: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(LoanApplication).filter(LoanApplication.id == applicationId).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user.role not in ["REVIEWER", "ADMIN"] and app.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    # Retrieve associated credit check
    credit = (
        db.query(CreditCheck)
        .filter(CreditCheck.application_id == app.id)
        .order_by(CreditCheck.created_at.desc())
        .first()
    )
    cibil_score = credit.cibil_score if credit else 700
    pay_hist = credit.payment_history if credit else 90.0
    util = credit.credit_utilization if credit else 30.0
    hist_yrs = credit.credit_history_years if credit else 5.0
    enq = credit.recent_enquiries if credit else 1

    payload = {
        "income": app.income,
        "employment_type": app.employment_type,
        "age": app.age,
        "dependents": app.dependents,
        "loan_amount": app.loan_amount,
        "loan_tenure": app.loan_tenure,
        "loan_purpose": app.loan_purpose,
        "existing_loans": app.existing_loans,
        "monthly_obligations": app.monthly_obligations,
        "cibil_score": cibil_score,
        "payment_history": pay_hist,
        "credit_utilization": util,
        "credit_history_years": hist_yrs,
        "recent_enquiries": enq
    }

    ai_result = evaluate_applicant_risk(payload)

    # Persist in predictions table
    prediction = Prediction(
        application_id=app.id,
        predicted_class=ai_result["predicted_class"],
        probability=ai_result["probability"],
        risk_level=ai_result["risk_level"],
        model_version=ai_result["model_version"],
        model_name=ai_result["model_name"]
    )
    db.add(prediction)
    db.flush()

    # Persist factor attributions
    factor_schemas = []
    for f in ai_result["all_factors"]:
        db_factor = PredictionFactor(
            prediction_id=prediction.id,
            feature=f["feature"],
            feature_label=f["featureLabel"],
            feature_value=str(f["value"]),
            contribution=f["contribution"],
            direction=f["direction"],
            explanation=f["explanation"]
        )
        db.add(db_factor)
        factor_schemas.append(PredictionFactorSchema(**f))

    # Update application stage to AI_ASSESSMENT_COMPLETE if not already approved/disbursed
    if app.status not in ["APPROVED", "DISBURSEMENT_PENDING", "DISBURSED"]:
        app.stage = "AI_ASSESSMENT_COMPLETE"
        if ai_result["predicted_class"] == "Approved":
            app.status = "APPROVED"
        elif ai_result["predicted_class"] == "Needs Review":
            app.status = "NEEDS_REVIEW"
        else:
            app.status = "DECLINED"

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        application_id=app.id,
        action="AI_PREDICTION_EVALUATED",
        details=f"EBM prediction: {ai_result['predicted_class']} (probability: {ai_result['probability_percentage']}%)."
    )
    db.add(audit)
    db.commit()

    return PredictionResponse(
        id=prediction.id,
        applicationId=app.id,
        predictedClass=ai_result["predicted_class"],
        probability=ai_result["probability"],
        probabilityPercentage=ai_result["probability_percentage"],
        riskLevel=ai_result["risk_level"],
        modelVersion=ai_result["model_version"],
        modelName=ai_result["model_name"],
        positiveFactors=[PredictionFactorSchema(**f) for f in ai_result["positive_factors"]],
        negativeFactors=[PredictionFactorSchema(**f) for f in ai_result["negative_factors"]],
        allFactors=factor_schemas,
        derivedFeatures=ai_result["derived_features"],
        disclaimer=ai_result["disclaimer"]
    )


@router.get("/predictions/{application_id}", response_model=PredictionResponse)
def get_latest_prediction(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

    if current_user.role not in ["REVIEWER", "ADMIN"] and app.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    pred = (
        db.query(Prediction)
        .filter(Prediction.application_id == application_id)
        .order_by(Prediction.created_at.desc())
        .first()
    )

    if not pred:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No prediction found for this application.")

    factors = db.query(PredictionFactor).filter(PredictionFactor.prediction_id == pred.id).all()
    all_schemas = [
        PredictionFactorSchema(
            feature=f.feature,
            featureLabel=f.feature_label or f.feature,
            value=f.feature_value,
            contribution=f.contribution,
            direction=f.direction,
            explanation=f.explanation
        )
        for f in factors
    ]

    pos = [f for f in all_schemas if f.contribution >= 0]
    neg = [f for f in all_schemas if f.contribution < 0]

    emi_data = calculate_reducing_balance_emi(app.loan_amount, app.loan_tenure)

    return PredictionResponse(
        id=pred.id,
        applicationId=pred.application_id,
        predictedClass=pred.predicted_class,
        probability=pred.probability,
        probabilityPercentage=round(pred.probability * 100, 1),
        riskLevel=pred.risk_level,
        modelVersion=pred.model_version,
        modelName=pred.model_name,
        positiveFactors=pos[:5],
        negativeFactors=neg[:5],
        allFactors=all_schemas,
        derivedFeatures={
            "estimated_emi": emi_data["monthly_emi"],
            "loan_amount_inr": app.loan_amount,
            "loan_to_income_ratio": round(app.loan_amount / (max(app.income, 1) * 12), 2),
            "debt_to_income_ratio": round((app.monthly_obligations + emi_data["monthly_emi"]) / max(app.income, 1), 2)
        },
        disclaimer="AI-assisted risk evaluation."
    )


@router.post("/calculator/emi", response_model=EMICalculatorResponse)
def calculate_emi_endpoint(req: EMICalculatorRequest):
    """Interactive reducing-balance EMI and repayment burden calculator."""
    amt = req.loanAmount
    # Convert Lakhs to INR if <= 500
    if 0.1 <= amt <= 500:
        amt_inr = amt * 100000.0
    else:
        amt_inr = amt

    rate = (req.annualInterestRate or 10.5) / 100.0
    calc = calculate_reducing_balance_emi(amt_inr, req.loanTenure, rate)
    emi = calc["monthly_emi"]

    income = max(1.0, req.monthlyIncome or 0.0)
    obligations = req.existingMonthlyObligations or 0.0

    dti = round(((obligations + emi) / income) * 100, 1) if req.monthlyIncome and req.monthlyIncome > 0 else 0.0
    lti = round(amt_inr / (income * 12.0), 2) if req.monthlyIncome and req.monthlyIncome > 0 else 0.0

    if dti <= 40.0:
        affordability = "COMFORTABLE"
    elif dti <= 60.0:
        affordability = "MANAGEABLE"
    else:
        affordability = "HIGH_BURDEN"

    return EMICalculatorResponse(
        monthlyEMI=calc["monthly_emi"],
        totalInterest=calc["total_interest"],
        totalRepayment=calc["total_repayment"],
        annualInterestRate=req.annualInterestRate or 10.5,
        debtToIncomeRatio=dti,
        loanToIncomeRatio=lti,
        affordabilityStatus=affordability
    )
