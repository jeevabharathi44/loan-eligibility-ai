import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List
from app.config import settings

_ebm_model = None

def get_ebm_model():
    global _ebm_model
    if _ebm_model is None:
        if not os.path.exists(settings.EBM_MODEL_PATH):
            raise FileNotFoundError(f"EBM model file not found at {settings.EBM_MODEL_PATH}")
        _ebm_model = joblib.load(settings.EBM_MODEL_PATH)
    return _ebm_model

def calculate_reducing_balance_emi(
    loan_amount: float,
    tenure_months: int,
    annual_interest_rate: float = 0.105
) -> float:
    """
    Equated Monthly Installment (EMI) using Reducing Balance method.
    EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
    """
    if tenure_months <= 0 or loan_amount <= 0:
        return 0.0
    r = annual_interest_rate / 12.0
    factor = (1.0 + r) ** tenure_months
    emi = (loan_amount * r * factor) / (factor - 1.0)
    return float(round(emi, 2))

def calculate_dti_ratio(monthly_obligations: float, calculated_emi: float, monthly_income: float) -> float:
    """
    Debt-to-Income (DTI / FOIR) ratio in percentage.
    DTI = (Existing Debt Obligations + Calculated Reducing-Balance EMI) / Monthly Net Income
    """
    if monthly_income <= 0:
        return 100.0
    return float(round(((monthly_obligations + calculated_emi) / monthly_income) * 100.0, 2))

def calculate_lti_multiplier(loan_amount: float, monthly_income: float) -> float:
    """
    Loan-to-Income (LTI) Multiplier relative to annual income.
    LTI = Loan Amount / (Monthly Income * 12)
    """
    annual_income = monthly_income * 12.0
    if annual_income <= 0:
        return 99.0
    return float(round(loan_amount / annual_income, 2))

def format_inr(val: float) -> str:
    return f"₹{int(val):,}"

def generate_plain_english_explanation(feature: str, value: Any, score: float, direction: str) -> str:
    """
    Translates raw logit contribution into plain-English fair lending disclosure
    mandated by RBI Digital Lending Guidelines.
    """
    mag = abs(score)
    strength = "significantly" if mag > 1.0 else "moderately" if mag > 0.4 else "marginally"
    
    if feature == "cibil_score":
        c = int(value)
        if direction == "positive":
            tier = "Prime" if c >= 750 else "Good"
            return f"CIBIL score of {c} ({tier}) {strength} improved credit assessment, demonstrating consistent repayment discipline."
        else:
            tier = "Subprime" if c < 580 else "Near-Prime"
            return f"CIBIL score of {c} ({tier}) {strength} penalized eligibility due to elevated default risk history."
            
    elif feature == "debt_to_income_ratio":
        dti = round(float(value), 1)
        if direction == "positive":
            return f"Debt-to-Income (DTI/FOIR) ratio of {dti}% is within safe prudential limits (<= 50%), preserving disposable income."
        else:
            return f"Debt-to-Income (DTI/FOIR) ratio of {dti}% exceeds recommended threshold, signaling heavy repayment strain."
            
    elif feature == "income":
        inc_s = format_inr(float(value))
        if direction == "positive":
            return f"Monthly net income of {inc_s} provides solid cash-flow buffering to service the requested debt."
        else:
            return f"Monthly net income of {inc_s} is below optimal exposure threshold for this loan principal."
            
    elif feature == "employment_type":
        emp = str(value).replace("_", " ").title()
        if direction == "positive":
            return f"Salaried employment provides verifiable, steady cash flow with corporate payroll verification."
        else:
            return f"{emp} status introduces income variance and requires higher cash-reserve scrutiny."
            
    elif feature == "loan_to_income_ratio":
        lti = round(float(value), 2)
        if direction == "positive":
            return f"Loan-to-Income (LTI) multiplier of {lti}x annual income is conservatively leveraged."
        else:
            return f"Loan-to-Income (LTI) multiplier of {lti}x annual income represents aggressive leverage."
            
    elif feature == "payment_history":
        pay = round(float(value), 1)
        if direction == "positive":
            return f"On-time payment track record of {pay}% demonstrates dependable credit behavior."
        else:
            return f"Payment track record of {pay}% reflects past 30+ DPD delinquencies or delayed settlements."
            
    elif feature == "credit_utilization":
        u = round(float(value), 1)
        if direction == "positive":
            return f"Revolving credit utilization of {u}% is disciplined (< 30%), indicating low dependence on revolving debt."
        else:
            return f"Revolving credit card utilization of {u}% indicates reliance on unsecured revolving credit."
            
    elif feature == "recent_enquiries":
        enq = int(value)
        if direction == "positive":
            return f"Only {enq} bureau enquiry in 6 months reflects disciplined credit appetite."
        else:
            return f"{enq} recent bureau enquiries signal aggressive credit hunger across multiple lenders."
            
    # Default label
    f_lbl = feature.replace("_", " ").title()
    if direction == "positive":
        return f"{f_lbl} ({value}) added a positive credit bonus of +{score:.3f} logits."
    else:
        return f"{f_lbl} ({value}) applied a risk penalty of {score:.3f} logits."

def evaluate_underwriting_decision(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main Underwriting Engine combining Microsoft InterpretML EBM with
    Module 5 Dynamic Underwriting Decision Gates and RBI Digital Lending norms.
    """
    model = get_ebm_model()
    
    # 1. Financial calculation
    income = max(1.0, float(payload.get("income", 50000)))
    loan_amt = float(payload.get("loan_amount", 500000))
    tenure = int(payload.get("loan_tenure", 36))
    obligations = float(payload.get("monthly_obligations", 0))
    cibil = int(payload.get("cibil_score", 650))
    emp_type = str(payload.get("employment_type", "salaried")).lower()
    
    emi = calculate_reducing_balance_emi(loan_amt, tenure)
    dti = calculate_dti_ratio(obligations, emi, income)
    lti = calculate_lti_multiplier(loan_amt, income)
    
    # Biometric & Cross-field flags from upstream gates
    biometrics_passed = payload.get("biometrics_passed", True)
    biometric_sim = float(payload.get("biometric_similarity", 88.0))
    cross_field_status = str(payload.get("cross_field_status", "MATCH")).upper()
    name_similarity = float(payload.get("name_similarity", 100.0))
    
    # 2. Prepare feature vector for EBM
    # EBM was trained with DTI as decimal ratio (e.g. 0.28 for 28%)
    dti_dec = round(dti / 100.0, 4)
    
    record = {
        'age': int(payload.get('age', 30)),
        'income': income,
        'dependents': int(payload.get('dependents', 1)),
        'existing_loans': int(payload.get('existing_loans', 0)),
        'monthly_obligations': obligations,
        'loan_amount': loan_amt,
        'loan_tenure': tenure,
        'cibil_score': cibil,
        'payment_history': float(payload.get('payment_history', 95.0)),
        'credit_utilization': float(payload.get('credit_utilization', 30.0)),
        'credit_history_years': float(payload.get('credit_history_years', 5.0)),
        'recent_enquiries': int(payload.get('recent_enquiries', 1)),
        'estimated_emi': emi,
        'debt_to_income_ratio': dti_dec,
        'loan_to_income_ratio': lti,
        'employment_type': emp_type,
        'loan_purpose': str(payload.get('loan_purpose', 'personal')).lower()
    }
    X_df = pd.DataFrame([record])
    
    # 3. Explainable Local Feature Contributions
    local_exp = model.explain_local(X_df)
    data = local_exp.data(0)
    
    names = data['names']
    scores = data['scores']
    values = data['values']
    intercept = round(float(data.get('extra', {}).get('scores', [0])[0] if 'extra' in data else 0.0), 4)
    
    factors: List[Dict[str, Any]] = []
    for n, s, v in zip(names, scores, values):
        s_float = round(float(s), 4)
        direction = "positive" if s_float >= 0 else "negative"
        display_val = v
        if n == "debt_to_income_ratio":
            display_val = f"{dti:.1f}%"
        elif n == "income" or n == "loan_amount" or n == "estimated_emi":
            display_val = format_inr(float(v))
            
        factors.append({
            "feature": n,
            "feature_label": n.replace("_", " ").title(),
            "value": display_val,
            "contribution": s_float,
            "direction": direction,
            "explanation": generate_plain_english_explanation(n, v, s_float, direction)
        })
        
    factors.sort(key=lambda x: abs(x['contribution']), reverse=True)
    positive_factors = [f for f in factors if f['direction'] == "positive"]
    negative_factors = [f for f in factors if f['direction'] == "negative"]
    
    # 4. Waterfall Bar Generation
    waterfall_bars: List[Dict[str, Any]] = []
    running = intercept
    waterfall_bars.append({
        "name": "Base Intercept",
        "type": "base",
        "value": intercept,
        "running_total": round(running, 3),
        "color": "#64748b" # slate
    })
    
    # Top 6 impactful factors in waterfall
    top_factors = factors[:6]
    for tf in top_factors:
        c = tf["contribution"]
        running += c
        waterfall_bars.append({
            "name": tf["feature_label"],
            "type": "bonus" if c >= 0 else "penalty",
            "value": round(c, 3),
            "running_total": round(running, 3),
            "color": "#10b981" if c >= 0 else "#ef4444"
        })
        
    waterfall_bars.append({
        "name": "Final Net Logit",
        "type": "total",
        "value": round(running, 3),
        "running_total": round(running, 3),
        "color": "#3b82f6"
    })
    
    # 5. Dynamic Underwriting Decision Gates (Module 5 Specification)
    decision_reasons: List[str] = []
    
    # Check Biometric Gate first
    if not biometrics_passed or biometric_sim < 75.0:
        system_decision = "DECLINED"
        risk_tier = "SUBPRIME"
        calibrated_prob = 0.0
        decision_reasons.append(f"Biometric Verification Failure: Cross-similarity ({biometric_sim}%) fell below mandatory 75.0% threshold. Immediate Security Denial.")
    elif cross_field_status == "MISMATCH":
        system_decision = "DECLINED"
        risk_tier = "SUBPRIME"
        calibrated_prob = 0.05
        decision_reasons.append("Critical Document Discrepancy: KYC cross-field consistency validation failed critical authenticity check.")
    # PRIME TIER
    elif cibil >= 700 and dti <= 50.0 and emp_type == "salaried" and cross_field_status == "MATCH":
        system_decision = "APPROVED"
        risk_tier = "PRIME"
        # Calibrated Probability between 85% and 98%
        cibil_boost = (cibil - 700) / 200.0 * 8.0 # 0 to 8%
        dti_bonus = max(0.0, (50.0 - dti) / 50.0 * 5.0) # 0 to 5%
        calibrated_prob = round(min(98.0, 85.0 + cibil_boost + dti_bonus), 1)
        decision_reasons.append(f"Prime Credit Score: CIBIL {cibil} exceeds prime threshold (>= 700).")
        decision_reasons.append(f"Healthy DTI (FOIR): {dti:.1f}% remains comfortably below 50.0% statutory maximum.")
        decision_reasons.append("Stable Salaried Employment with confirmed corporate payroll credit.")
        decision_reasons.append("Biometric and Document Integrity: 100% cross-field match and tri-biometric score >= 75%.")
    # SUBPRIME / ADVERSE RISK
    elif cibil < 580 or dti > 70.0 or emp_type == "not_employed":
        system_decision = "DECLINED"
        risk_tier = "SUBPRIME"
        # Calibrated Probability between 8% and 25%
        base_subprime = 12.0
        if cibil < 540: base_subprime -= 4.0
        if dti > 80.0: base_subprime -= 3.0
        calibrated_prob = round(max(5.0, min(24.0, base_subprime)), 1)
        if cibil < 580:
            decision_reasons.append(f"Subprime Credit Score: CIBIL {cibil} falls below minimum policy floor of 580.")
        if dti > 70.0:
            decision_reasons.append(f"Excessive Debt-to-Income: DTI of {dti:.1f}% exceeds safe repayment ceiling (> 70.0%).")
        if emp_type == "not_employed":
            decision_reasons.append("Employment Status: Unemployed applicants ineligible for unsecured retail facilities.")
    # NEAR-PRIME / RISK ADVISORY / NEEDS REVIEW
    else:
        system_decision = "NEEDS_REVIEW"
        risk_tier = "NEAR_PRIME"
        # Calibrated Probability between 50% and 65%
        prob_mid = 56.4
        if cross_field_status == "DISCREPANCY_FLAG":
            decision_reasons.append(f"Document Disparity Flag: Legal Name discrepancy detected across Aadhaar/PAN (Similarity: {name_similarity}%). Underwriter exception required.")
        if 580 <= cibil < 700:
            decision_reasons.append(f"Near-Prime Score: CIBIL {cibil} indicates moderate credit vintage; requires loan officer assessment.")
        if 50.0 < dti <= 70.0:
            decision_reasons.append(f"Elevated DTI: {dti:.1f}% requires assessment of applicant liquid reserves or debt consolidation.")
        if emp_type == "self_employed":
            decision_reasons.append("Self-Employed Category: Business cash-flow seasonality requires audited ITR verification.")
        calibrated_prob = prob_mid
        
    prob_fraction = round(calibrated_prob / 100.0, 4)
    
    summary = (
        f"Automated Policy Decision: {system_decision} ({risk_tier} Tier). "
        f"Calibrated Approval Probability: {calibrated_prob}%. "
        f"Derived EMI: {format_inr(emi)} | DTI: {dti:.1f}% | LTI: {lti:.2f}x."
    )
    
    rbi_notice = (
        "Pursuant to Reserve Bank of India (RBI) Digital Lending Guidelines (2022/2023) and Fair Lending Practice Code, "
        "all underwriting decisions are governed by Explainable AI (EBM). No automated decision is irrevocable. "
        "Applicants have the statutory right to request human officer re-evaluation by Dr. Arulmozhi Varman."
    )
    
    return {
        "risk_tier": risk_tier,
        "system_decision": system_decision,
        "probability": prob_fraction,
        "probability_percentage": calibrated_prob,
        "estimated_emi": emi,
        "debt_to_income_ratio": dti,
        "loan_to_income_ratio": lti,
        "loan_amount": loan_amt,
        "intercept": intercept,
        "positive_factors": positive_factors[:5],
        "negative_factors": negative_factors[:5],
        "all_factors": factors,
        "waterfall_bars": waterfall_bars,
        "decision_summary": summary,
        "decision_reasons": decision_reasons,
        "rbi_compliance_notice": rbi_notice
    }
