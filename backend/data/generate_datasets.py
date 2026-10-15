"""
Reproducible Synthetic Dataset Generator for Explainable AI Digital Loan Processing System.
Generates 5 realistic synthetic datasets with seed=42:
1. synthetic_loan_applicants.csv (~5,000 records)
2. synthetic_credit_profiles.csv
3. synthetic_document_registry.csv
4. synthetic_bank_profiles.csv
5. synthetic_verification_scenarios.csv
"""
import os
import random
import json
from datetime import datetime, timedelta, timezone
import numpy as np
import pandas as pd

np.random.seed(42)
random.seed(42)

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
os.makedirs(DATA_DIR, exist_ok=True)

TAMIL_FIRST_NAMES = [
    "Jeeva", "Karthik", "Muthu", "Kavitha", "Anitha", "Suresh", "Saravanan", "Murugan",
    "Priya", "Meena", "Vignesh", "Aravind", "Dinesh", "Senthil", "Lakshmi", "Bhuvaneshwari",
    "Selvam", "Sundaram", "Pandian", "Elango", "Ramesh", "Manikandan", "Gopinath", "Deepa"
]
TAMIL_LAST_NAMES = [
    "Bharathi", "Selvam", "Pandian", "Sundaram", "Murugan", "Kumar", "Rajan", "Thevar",
    "Nadar", "Pillai", "Chettiar", "Gounder", "Mani", "Palanisamy", "Mahalingam", "Natarajan"
]

EMPLOYMENT_TYPES = ["salaried", "self_employed", "not_employed"]
EMPLOYMENT_PROBS = [0.70, 0.25, 0.05]

LOAN_PURPOSES = ["personal", "home_improvement", "medical", "education", "debt_consolidation", "wedding"]

# -------------------------------------------------------------
# 1. Generate synthetic_loan_applicants.csv (5,000 records)
# -------------------------------------------------------------
def generate_loan_applicants(n=5000):
    records = []
    for i in range(1, n + 1):
        app_id = f"SYN_APP_{i:05d}"
        first_name = random.choice(TAMIL_FIRST_NAMES)
        last_name = random.choice(TAMIL_LAST_NAMES)
        applicant_name = f"{first_name} {last_name}"
        
        emp_type = np.random.choice(EMPLOYMENT_TYPES, p=EMPLOYMENT_PROBS)
        
        # Age
        if emp_type == "not_employed":
            age = int(np.random.choice([np.random.randint(18, 24), np.random.randint(58, 72)]))
            income = float(np.random.choice([0, np.random.uniform(5000, 15000)]))
            tenure_months = 0
        elif emp_type == "salaried":
            age = int(np.random.normal(32, 7))
            age = max(20, min(60, age))
            income = float(np.random.lognormal(mean=10.8, sigma=0.5))  # around 35k - 120k
            income = round(max(15000.0, min(350000.0, income)), -2)
            tenure_months = int(np.random.randint(6, max(7, (age - 20) * 12)))
        else: # self_employed
            age = int(np.random.normal(38, 8))
            age = max(22, min(65, age))
            income = float(np.random.lognormal(mean=11.0, sigma=0.6))
            income = round(max(20000.0, min(500000.0, income)), -2)
            tenure_months = int(np.random.randint(12, max(13, (age - 21) * 12)))

        # Credit history & payment ratio
        credit_history_years = round(max(0.5, (age - 18) * np.random.uniform(0.2, 0.8)), 1)
        payment_ratio = round(np.random.beta(a=18, b=2), 3)  # skewed towards 0.85-0.99
        credit_utilization = round(np.random.beta(a=2, b=5), 3) # skewed towards 0.15-0.45
        recent_inquiries = int(np.random.poisson(lam=1.5))
        
        # Credit Score correlation
        score_base = 300 + (payment_ratio * 400) + ((1 - credit_utilization) * 150) + min(credit_history_years * 5, 50) - (recent_inquiries * 10)
        cibil_score = int(np.clip(score_base + np.random.normal(0, 20), 300, 900))
        
        # Loan terms
        req_amount = round(float(np.random.choice([100000, 200000, 300000, 500000, 750000, 1000000, 1500000, 2500000])), -3)
        req_tenure = int(np.random.choice([12, 24, 36, 48, 60]))
        
        # Existing obligations
        existing_obligations = round(float(max(0, income * np.random.uniform(0.0, 0.40) if income > 0 else 0)), -2)
        expenses = round(float(max(3000, income * np.random.uniform(0.20, 0.50) if income > 0 else 5000)), -2)
        
        # EMI calculation (10.5% APR)
        r = 0.105 / 12
        emi = round((req_amount * r * ((1 + r)**req_tenure)) / (((1 + r)**req_tenure) - 1)) if req_tenure > 0 else 0
        
        # Debt-to-income
        dti = round(((existing_obligations + emi) / income) * 100, 1) if income > 0 else 999.0
        lti = round(req_amount / (income * 12), 2) if income > 0 else 99.0
        
        # Default & Approval target definition
        # Approval criteria based on realistic risk underwriting:
        approval_score = 0.0
        if cibil_score >= 750: approval_score += 0.40
        elif cibil_score >= 650: approval_score += 0.15
        else: approval_score -= 0.35
        
        if dti <= 40.0: approval_score += 0.30
        elif dti <= 55.0: approval_score += 0.05
        else: approval_score -= 0.30
        
        if payment_ratio >= 0.92: approval_score += 0.20
        elif payment_ratio < 0.80: approval_score -= 0.25
        
        if emp_type == "salaried": approval_score += 0.10
        elif emp_type == "not_employed": approval_score -= 0.50
        
        prob_approved = 1.0 / (1.0 + np.exp(-approval_score * 3.0))
        approved = int(np.random.binomial(1, prob_approved))
        default_outcome = 0 if approved == 1 and np.random.uniform(0, 1) > 0.06 else (1 if approved == 0 else int(np.random.binomial(1, 0.08)))
        
        records.append({
            "synthetic_applicant_id": app_id,
            "applicant_name": applicant_name,
            "age": age,
            "employment_type": emp_type,
            "monthly_income": income,
            "employment_tenure_months": tenure_months,
            "existing_monthly_obligations": existing_obligations,
            "declared_monthly_expenses": expenses,
            "requested_loan_amount": req_amount,
            "loan_tenure_months": req_tenure,
            "loan_purpose": random.choice(LOAN_PURPOSES),
            "estimated_emi": emi,
            "debt_to_income_pct": dti,
            "loan_to_income_ratio": lti,
            "simulated_credit_score": cibil_score,
            "simulated_credit_history_length": credit_history_years,
            "simulated_credit_utilization": credit_utilization,
            "simulated_recent_credit_inquiries": recent_inquiries,
            "simulated_payment_history_ratio": payment_ratio,
            "synthetic_loan_approved": approved,
            "synthetic_default_outcome": default_outcome
        })
        
    df = pd.DataFrame(records)
    # Inject 1.5% controlled missing values for test validation
    mask_income = np.random.choice([True, False], size=len(df), p=[0.01, 0.99])
    df.loc[mask_income, "monthly_income"] = np.nan
    mask_obl = np.random.choice([True, False], size=len(df), p=[0.01, 0.99])
    df.loc[mask_obl, "existing_monthly_obligations"] = np.nan

    out_path = os.path.join(DATA_DIR, "synthetic_loan_applicants.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} records -> {out_path}")
    return df

# -------------------------------------------------------------
# 2. Generate synthetic_credit_profiles.csv
# -------------------------------------------------------------
def generate_credit_profiles(applicants_df):
    records = []
    for idx, row in applicants_df.iterrows():
        app_id = row["synthetic_applicant_id"]
        c_id = f"SYN_CRD_{idx+1:05d}"
        score = int(row["simulated_credit_score"]) if pd.notna(row["simulated_credit_score"]) else 720
        pay_ratio = float(row["simulated_payment_history_ratio"]) if pd.notna(row["simulated_payment_history_ratio"]) else 0.95
        util = float(row["simulated_credit_utilization"]) if pd.notna(row["simulated_credit_utilization"]) else 0.25
        history_yrs = float(row["simulated_credit_history_length"]) if pd.notna(row["simulated_credit_history_length"]) else 5.0
        inquiries = int(row["simulated_recent_credit_inquiries"]) if pd.notna(row["simulated_recent_credit_inquiries"]) else 1
        
        # Open accounts & debt
        open_accounts = int(np.random.randint(1, 8))
        total_debt = round(float(np.random.uniform(20000, 800000)), -2)
        monthly_obl = round(total_debt * np.random.uniform(0.03, 0.08), -2)
        
        if score >= 750:
            risk_band = "LOW_RISK_PRIME"
        elif score >= 650:
            risk_band = "MODERATE_RISK_NEAR_PRIME"
        elif score >= 550:
            risk_band = "HIGH_RISK_SUBPRIME"
        else:
            risk_band = "SEVERE_RISK_DEEP_SUBPRIME"
            
        gen_time = (datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30))).isoformat()
        
        records.append({
            "synthetic_credit_profile_id": c_id,
            "synthetic_applicant_id": app_id,
            "simulated_credit_score": score,
            "simulated_payment_history_ratio": pay_ratio,
            "simulated_credit_utilization": util,
            "simulated_credit_history_length": history_yrs,
            "simulated_open_accounts": open_accounts,
            "simulated_recent_inquiries": inquiries,
            "simulated_total_outstanding_debt": total_debt,
            "simulated_monthly_obligations": monthly_obl,
            "synthetic_risk_band": risk_band,
            "generated_at": gen_time,
            "provider_mode": "DEMO_SYNTHETIC",
            "regulatory_banner": "SYNTHETIC — NOT A REAL CIBIL SCORE"
        })
        
    df = pd.DataFrame(records)
    out_path = os.path.join(DATA_DIR, "synthetic_credit_profiles.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} records -> {out_path}")
    return df

# -------------------------------------------------------------
# 3. Generate synthetic_document_registry.csv
# -------------------------------------------------------------
def generate_document_registry(applicants_df):
    records = []
    doc_counter = 1
    scenarios = ["valid", "missing", "expired", "unreadable", "mismatched", "duplicate"]
    
    for idx, row in applicants_df.head(1000).iterrows():
        app_id = row["synthetic_applicant_id"]
        scenario = np.random.choice(scenarios, p=[0.82, 0.05, 0.03, 0.03, 0.04, 0.03])
        
        # PAN Record
        p_status = "ISSUER_AUTHENTICATED" if scenario == "valid" else ("MISMATCH_DETECTED" if scenario == "mismatched" else "REJECTED_UNREADABLE")
        records.append({
            "synthetic_document_id": f"SYN_DOC_{doc_counter:06d}",
            "synthetic_applicant_id": app_id,
            "document_type": "PAN",
            "synthetic_issuer": "Income Tax Department, Govt of India",
            "synthetic_document_status": p_status,
            "synthetic_name_match_status": "EXACT_MATCH" if scenario != "mismatched" else "DIVERGENT",
            "synthetic_expiry_status": "LIFETIME_VALID",
            "expected_fields": json.dumps(["panNumber", "fullName", "dateOfBirth", "fatherName"]),
            "scenario_type": scenario
        })
        doc_counter += 1
        
        # Aadhaar Record
        records.append({
            "synthetic_document_id": f"SYN_DOC_{doc_counter:06d}",
            "synthetic_applicant_id": app_id,
            "document_type": "AADHAAR",
            "synthetic_issuer": "Unique Identification Authority of India (UIDAI)",
            "synthetic_document_status": p_status,
            "synthetic_name_match_status": "EXACT_MATCH" if scenario != "mismatched" else "DIVERGENT",
            "synthetic_expiry_status": "LIFETIME_VALID",
            "expected_fields": json.dumps(["aadhaarNumber", "fullName", "dateOfBirth", "gender"]),
            "scenario_type": scenario
        })
        doc_counter += 1
        
        # Salary / Income Record
        if scenario != "missing":
            records.append({
                "synthetic_document_id": f"SYN_DOC_{doc_counter:06d}",
                "synthetic_applicant_id": app_id,
                "document_type": "SALARY_SLIP" if row["employment_type"] == "salaried" else "BANK_STATEMENT",
                "synthetic_issuer": "Employer Payroll / Banking Partner",
                "synthetic_document_status": "VERIFIED_CONSISTENT" if scenario == "valid" else "NEEDS_REVIEW",
                "synthetic_name_match_status": "MATCHED",
                "synthetic_expiry_status": "RECENT_3_MONTHS",
                "expected_fields": json.dumps(["grossMonthlySalary", "netMonthlyCredit", "payPeriod"]),
                "scenario_type": scenario
            })
            doc_counter += 1

    df = pd.DataFrame(records)
    out_path = os.path.join(DATA_DIR, "synthetic_document_registry.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} records -> {out_path}")
    return df

# -------------------------------------------------------------
# 4. Generate synthetic_bank_profiles.csv
# -------------------------------------------------------------
def generate_bank_profiles(applicants_df):
    records = []
    BANKS = [
        ("State Bank of India", "SBIN0001842"),
        ("HDFC Bank Ltd.", "HDFC0001234"),
        ("ICICI Bank Ltd.", "ICIC0000024"),
        ("Axis Bank Ltd.", "UTIB0000142"),
        ("Canara Bank", "CNRB0002190")
    ]
    for idx, row in applicants_df.iterrows():
        app_id = row["synthetic_applicant_id"]
        b_id = f"SYN_BNK_{idx+1:05d}"
        bank_name, ifsc = random.choice(BANKS)
        raw_acc = str(random.randint(1000000000, 9999999999))
        masked_acc = raw_acc[:4] + "XXXX" + raw_acc[-3:]
        
        # Controlled 3% name mismatch test cases
        is_mismatch = (idx % 33 == 0)
        holder_name = row["applicant_name"] if not is_mismatch else f"{random.choice(TAMIL_FIRST_NAMES)} {random.choice(TAMIL_LAST_NAMES)}"
        
        records.append({
            "synthetic_bank_profile_id": b_id,
            "synthetic_applicant_id": app_id,
            "synthetic_account_holder": holder_name,
            "masked_account_number": masked_acc,
            "synthetic_ifsc": ifsc,
            "bank_name": bank_name,
            "synthetic_account_status": "ACTIVE_VERIFIED" if not is_mismatch else "ACTIVE_NAME_MISMATCH",
            "synthetic_name_match_status": "MATCHED" if not is_mismatch else "MISMATCH",
            "provider_mode": "DEMO_PENNY_DROP",
            "regulatory_banner": "DEMO BANK VERIFICATION — NO REAL BANK ACCOUNT CHECK PERFORMED"
        })
        
    df = pd.DataFrame(records)
    out_path = os.path.join(DATA_DIR, "synthetic_bank_profiles.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} records -> {out_path}")
    return df

# -------------------------------------------------------------
# 5. Generate synthetic_verification_scenarios.csv
# -------------------------------------------------------------
def generate_verification_scenarios():
    scenarios = [
        {"scenario_id": "SCN-01", "scenario_name": "All Checks Pass (Golden Path)", "description": "Applicant Jeeva Bharathi M with valid Aadhaar, PAN, SBI salary account, 780 CIBIL score, and 3-photo match.", "expected_status": "APPROVED", "expected_flags": "NONE", "category": "Happy Path"},
        {"scenario_id": "SCN-02", "scenario_name": "Missing Required Documents", "description": "Applicant submitted loan details without uploading Aadhaar or PAN card proof.", "expected_status": "BLOCKED_SUBMISSION", "expected_flags": "MISSING_MANDATORY_DOCUMENTS", "category": "Document Checklist"},
        {"scenario_id": "SCN-03", "scenario_name": "Applicant Name Mismatch", "description": "Declared name is Muthu Pandian, but uploaded PAN belongs to Sundararajan (similarity 32%).", "expected_status": "FLAGGED_REVIEW", "expected_flags": "NAME_MISMATCH_DETECTED", "category": "Cross-Document"},
        {"scenario_id": "SCN-04", "scenario_name": "Low-Quality / Blurry Scan", "description": "Document image has Laplacian variance < 15.0 or resolution < 200x200 px.", "expected_status": "NEEDS_REVIEW", "expected_flags": "LOW_IMAGE_QUALITY", "category": "OCR Preprocessing"},
        {"scenario_id": "SCN-05", "scenario_name": "Expired Document", "description": "Passport or driving license uploaded with expiry date prior to today.", "expected_status": "REJECTED_EXPIRED", "expected_flags": "EXPIRED_DOCUMENT", "category": "Document Checklist"},
        {"scenario_id": "SCN-06", "scenario_name": "Conflicting Salary Values", "description": "Declared income ₹90,000/mo, but salary slip OCR extracted net income ₹42,000 (discrepancy > 35%).", "expected_status": "FLAGGED_REVIEW", "expected_flags": "INCOME_CONFLICT_DETECTED", "category": "Cross-Document"},
        {"scenario_id": "SCN-07", "scenario_name": "Duplicate File Upload", "description": "Same document uploaded twice for different categories or multiple times.", "expected_status": "WARNING", "expected_flags": "DUPLICATE_FILE_DETECTED", "category": "Upload Pipeline"},
        {"scenario_id": "SCN-08", "scenario_name": "Invalid File Format", "description": "File with .exe or .zip extension uploaded to document endpoint.", "expected_status": "REJECTED_BAD_REQUEST", "expected_flags": "UNSUPPORTED_MIME_TYPE", "category": "Security Validation"},
        {"scenario_id": "SCN-09", "scenario_name": "Corrupted PDF", "description": "PDF file with broken header or corrupted binary byte stream.", "expected_status": "REJECTED_UNREADABLE", "expected_flags": "PDF_CORRUPTED_ERROR", "category": "Security Validation"},
        {"scenario_id": "SCN-10", "scenario_name": "Credit Provider Unavailable", "description": "External CIBIL gateway timeout or connection reset without fallback.", "expected_status": "PENDING_RETRY", "expected_flags": "PROVIDER_UNAVAILABLE", "category": "Bureau Integration"},
        {"scenario_id": "SCN-11", "scenario_name": "Bank Verification Pending", "description": "Penny-drop transaction response awaiting clearing acknowledgment.", "expected_status": "PENDING_VERIFICATION", "expected_flags": "ACCOUNT_VALIDATION_IN_PROGRESS", "category": "Bank Verification"},
        {"scenario_id": "SCN-12", "scenario_name": "Face Verification Inconclusive", "description": "Poor webcam lighting or angle resulting in 65% match confidence.", "expected_status": "MANUAL_REVIEW_REQUIRED", "expected_flags": "INCONCLUSIVE_BIOMETRICS", "category": "Biometrics"},
        {"scenario_id": "SCN-13", "scenario_name": "Three-Photo Identity Mismatch", "description": "PAN card photo does not match Aadhaar card photo (24.3% similarity), indicating identity theft.", "expected_status": "MISMATCH_DETECTED", "expected_flags": "FRAUD_ALERT_IMPERSONATION", "category": "Tri-Biometrics"},
        {"scenario_id": "SCN-14", "scenario_name": "Liveness Failure / Screen Replay", "description": "Static image or printed photograph held in front of webcam.", "expected_status": "FAILED_LIVENESS", "expected_flags": "SPOOF_ATTACK_DETECTED", "category": "Biometrics"},
        {"scenario_id": "SCN-15", "scenario_name": "Underwriter Manual Review Required", "description": "EBM model returns 62% approval probability in the Moderate Risk band.", "expected_status": "NEEDS_REVIEW", "expected_flags": "UNDERWRITER_GOVERNANCE_REQUIRED", "category": "Explainable AI"}
    ]
    df = pd.DataFrame(scenarios)
    out_path = os.path.join(DATA_DIR, "synthetic_verification_scenarios.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} records -> {out_path}")
    return df

# -------------------------------------------------------------
# 6. Generate README.md
# -------------------------------------------------------------
def generate_readme():
    readme_content = """# Synthetic Datasets for Digital Personal Loan Processing System
Generated using fixed random seed (42) for deterministic, reproducible local demonstration and automated testing.

## Files Overview
1. `synthetic_loan_applicants.csv` (~5,000 records)
   - Comprehensive loan applicant demographic, financial, credit, and decision records.
   - Target: `synthetic_loan_approved` (1/0) and `synthetic_default_outcome` (1/0).
   - Injected controlled missing values (1%) for testing missing data resilience.

2. `synthetic_credit_profiles.csv` (5,000 records)
   - Credit bureau profiles mirroring TransUnion CIBIL score bands (300 to 900).
   - Tagged: `SYNTHETIC — NOT A REAL CIBIL SCORE`.

3. `synthetic_document_registry.csv` (~3,000 records)
   - Test scenarios covering: valid, missing, expired, unreadable, mismatched, and duplicate documents.

4. `synthetic_bank_profiles.csv` (5,000 records)
   - Fictional bank account numbers, IFSC codes, and name-matching status for Penny-Drop simulation.
   - Tagged: `DEMO BANK VERIFICATION — NO REAL BANK ACCOUNT CHECK PERFORMED`.

5. `synthetic_verification_scenarios.csv` (15 edge cases)
   - Test matrix covering all 15 acceptance and failure scenarios.

## Limitations
These datasets are synthetically generated for academic, testing, and demonstration purposes. They do not contain any real PII or live credit bureau inquiries.
"""
    out_path = os.path.join(DATA_DIR, "README.md")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(readme_content)
    print(f"Generated README -> {out_path}")

if __name__ == "__main__":
    apps = generate_loan_applicants(5000)
    generate_credit_profiles(apps)
    generate_document_registry(apps)
    generate_bank_profiles(apps)
    generate_verification_scenarios()
    generate_readme()
    print("All 5 synthetic datasets generated successfully!")
