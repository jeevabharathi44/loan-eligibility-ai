"""
Explainability engine for Loan Eligibility AI.
Translates InterpretML EBM local feature contributions into structured factor rankings
and dynamic plain-English explanations.
"""
from typing import Dict, List, Any


def format_currency_inr(amount: float) -> str:
    """Formats amount into Indian Rupee formatting."""
    return f"₹{int(amount):,}"


def generate_factor_explanation(feature: str, value: Any, contribution: float, direction: str) -> str:
    """
    Generates a contextual, plain-English explanation based on the feature value
    and the real mathematical contribution computed by the EBM model.
    """
    contrib_mag = abs(contribution)
    strength = "significantly" if contrib_mag > 1.2 else "moderately" if contrib_mag > 0.5 else "slightly"

    if feature == "cibil_score":
        score = int(value)
        if direction == "positive":
            tier = "Prime" if score >= 750 else "Good"
            return f"CIBIL score of {score} ({tier}) {strength} improved eligibility by demonstrating strong credit discipline and low default history."
        else:
            tier = "Subprime / Poor" if score < 550 else "Fair"
            return f"CIBIL score of {score} ({tier}) {strength} lowered eligibility due to elevated historical credit risk."

    elif feature == "debt_to_income_ratio":
        dti_pct = round(float(value) * 100, 1)
        if direction == "positive":
            return f"Debt-to-Income (DTI) ratio of {dti_pct}% is conservative and manageable, leaving healthy disposable income for loan service."
        else:
            return f"Debt-to-Income (DTI) ratio of {dti_pct}% is high, indicating heavy ongoing monthly obligations that constrain debt servicing."

    elif feature == "income":
        inc_fmt = format_currency_inr(float(value))
        if direction == "positive":
            return f"Monthly income of {inc_fmt} provides solid cash-flow buffering and {strength} supported the application."
        else:
            return f"Monthly income of {inc_fmt} is on the lower threshold for the requested exposure, constraining borrowing limits."

    elif feature == "loan_to_income_ratio":
        lti = round(float(value), 1)
        if direction == "positive":
            return f"Loan amount is {lti}x annual income, representing a well-proportioned credit demand relative to earning capacity."
        else:
            return f"Loan amount is {lti}x annual income, exceeding recommended leverage benchmarks."

    elif feature == "employment_type":
        emp_str = str(value).replace("_", " ").title()
        if direction == "positive":
            return f"{emp_str} status offers predictable and verifiable income stability."
        else:
            return f"{emp_str} status introduces income volatility or unverified employment risk."

    elif feature == "payment_history":
        pay_pct = round(float(value), 1)
        if direction == "positive":
            return f"On-time payment track record of {pay_pct}% establishes consistent repayment diligence."
        else:
            return f"On-time payment record of {pay_pct}% reflects prior delinquencies or delayed payments."

    elif feature == "credit_utilization":
        util_pct = round(float(value), 1)
        if direction == "positive":
            return f"Credit card utilization of {util_pct}% is well below the prudent 30% ceiling, signaling low reliance on revolving credit."
        else:
            return f"Credit card utilization of {util_pct}% indicates heavy reliance on revolving lines, increasing risk."

    elif feature == "recent_enquiries":
        enq = int(value)
        if direction == "positive":
            return f"Only {enq} recent credit enquiry in the past 6 months indicates calm, disciplined credit demand."
        else:
            return f"{enq} recent credit enquiries indicate aggressive credit-seeking behavior, which triggers lender caution."

    elif feature == "credit_history_years":
        yrs = round(float(value), 1)
        if direction == "positive":
            return f"Credit vintage of {yrs} years provides a mature, seasoned track record to evaluate."
        else:
            return f"Credit vintage of {yrs} years represents a relatively young or sparse credit profile."

    elif feature == "loan_amount":
        amt_fmt = format_currency_inr(float(value))
        if direction == "positive":
            return f"Requested loan of {amt_fmt} is modest relative to overall financial parameters."
        else:
            return f"Requested loan principal of {amt_fmt} imposes substantial repayment exposure."

    elif feature == "estimated_emi":
        emi_fmt = format_currency_inr(float(value))
        if direction == "positive":
            return f"Estimated monthly EMI of {emi_fmt} is comfortable within current net earnings."
        else:
            return f"Estimated monthly EMI of {emi_fmt} represents a significant commitment against monthly cash flow."

    elif feature == "dependents":
        dep = int(value)
        if direction == "positive":
            return f"Having {dep} financial dependent(s) minimizes household non-discretionary overhead."
        else:
            return f"Having {dep} dependents increases household baseline expenditure obligations."

    elif feature == "existing_loans":
        loans = int(value)
        if direction == "positive":
            return f"Managing {loans} active loan(s) demonstrates disciplined multi-facility servicing without strain."
        else:
            return f"Currently servicing {loans} existing loan facilities expands baseline credit exposure."

    elif feature == "loan_purpose":
        purp = str(value).title()
        if direction == "positive":
            return f"Loan intended for {purp} is categorized as low-volatility or asset-building capital."
        else:
            return f"Loan intended for {purp} is treated with higher risk weighting by credit policy."

    elif feature == "age":
        age = int(value)
        if direction == "positive":
            return f"Applicant age of {age} aligns with prime earning and career longevity years."
        else:
            return f"Applicant age of {age} falls outside optimal earning longevity brackets."

    # General fallback for any interaction or other feature
    human_name = feature.replace("_", " ").title()
    if direction == "positive":
        return f"{human_name} value ({value}) {strength} improved the approval probability score."
    else:
        return f"{human_name} value ({value}) {strength} increased the estimated credit risk profile."


def extract_ebm_explanations(ebm_model, X_df) -> Dict[str, Any]:
    """
    Extracts genuine local explanation contributions from EBM model for a single input row.
    """
    local_exp = ebm_model.explain_local(X_df)
    data = local_exp.data(0)

    names = data['names']
    scores = data['scores']
    values = data['values']

    factors = []
    for name, score, val in zip(names, scores, values):
        score_float = round(float(score), 4)
        direction = "positive" if score_float >= 0 else "negative"
        explanation_text = generate_factor_explanation(name, val, score_float, direction)

        factors.append({
            "feature": name,
            "feature_label": name.replace("_", " ").title(),
            "value": val,
            "contribution": score_float,
            "direction": direction,
            "explanation": explanation_text
        })

    # Sort factors by impact magnitude
    factors.sort(key=lambda x: abs(x['contribution']), reverse=True)

    positive_factors = [f for f in factors if f['direction'] == "positive"]
    negative_factors = [f for f in factors if f['direction'] == "negative"]

    return {
        "all_factors": factors,
        "positive_factors": positive_factors[:5],
        "negative_factors": negative_factors[:5],
        "intercept": round(float(data.get('extra', {}).get('scores', [0])[0] if 'extra' in data else 0.0), 4)
    }
