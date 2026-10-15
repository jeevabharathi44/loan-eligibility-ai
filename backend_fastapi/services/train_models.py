"""
Automated Model Training and Evaluation Pipeline.
Trains:
1. Explainable Boosting Machine (EBM) Loan Eligibility Classifier + Logistic Regression Baseline
2. Document Type Classifier
Saves trained models, feature importances, and evaluation metrics.
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, brier_score_loss
)
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from interpret.glassbox import ExplainableBoostingClassifier

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "synthetic_loan_applicants.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models_artifacts")
os.makedirs(MODELS_DIR, exist_ok=True)


def train_loan_eligibility_models():
    print(f"Loading data from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    
    # Preprocessing
    df = df.dropna(subset=["synthetic_loan_approved"])
    features = [
        "monthly_income",
        "simulated_credit_score",
        "debt_to_income_pct",
        "simulated_payment_history_ratio",
        "simulated_credit_utilization",
        "employment_tenure_months",
        "loan_to_income_ratio"
    ]
    
    # Fill remaining median for missing values in features
    for col in features:
        df[col] = df[col].fillna(df[col].median())
        
    X = df[features]
    y = df["synthetic_loan_approved"].astype(int)
    
    # Train / Test split (80/20) - Stratified
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    print(f"Dataset Size: {len(df)} records. Train: {len(X_train)}, Test: {len(X_test)}")
    print(f"Class distribution (Approved %): Train: {y_train.mean():.3f}, Test: {y_test.mean():.3f}")
    
    # 1. Train EBM
    print("Training Explainable Boosting Machine (EBM)...")
    ebm = ExplainableBoostingClassifier(
        random_state=42,
        max_bins=128,
        interactions=5
    )
    ebm.fit(X_train, y_train)
    
    ebm_preds = ebm.predict(X_test)
    ebm_probs = ebm.predict_proba(X_test)[:, 1]
    
    ebm_metrics = {
        "model_name": "Explainable Boosting Machine (EBM)",
        "model_version": "v1.2.0-ebm",
        "accuracy": round(float(accuracy_score(y_test, ebm_preds)), 4),
        "precision": round(float(precision_score(y_test, ebm_preds)), 4),
        "recall": round(float(recall_score(y_test, ebm_preds)), 4),
        "f1_score": round(float(f1_score(y_test, ebm_preds)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, ebm_probs)), 4),
        "brier_score": round(float(brier_score_loss(y_test, ebm_probs)), 4),
        "confusion_matrix": confusion_matrix(y_test, ebm_preds).tolist()
    }
    
    # 2. Train Logistic Regression Baseline
    print("Training Logistic Regression Baseline...")
    lr_pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(random_state=42, max_iter=1000))
    ])
    lr_pipe.fit(X_train, y_train)
    
    lr_preds = lr_pipe.predict(X_test)
    lr_probs = lr_pipe.predict_proba(X_test)[:, 1]
    
    lr_metrics = {
        "model_name": "Logistic Regression (Baseline)",
        "accuracy": round(float(accuracy_score(y_test, lr_preds)), 4),
        "precision": round(float(precision_score(y_test, lr_preds)), 4),
        "recall": round(float(recall_score(y_test, lr_preds)), 4),
        "f1_score": round(float(f1_score(y_test, lr_preds)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, lr_probs)), 4),
        "brier_score": round(float(brier_score_loss(y_test, lr_probs)), 4),
        "confusion_matrix": confusion_matrix(y_test, lr_preds).tolist()
    }
    
    # Feature importances from EBM global explanation
    global_exp = ebm.explain_global()
    feature_importances = []
    for f, imp in zip(global_exp.data()["names"], global_exp.data()["scores"]):
        feature_importances.append({
            "feature": str(f),
            "importance": round(float(imp), 4)
        })
    feature_importances = sorted(feature_importances, key=lambda x: x["importance"], reverse=True)
    
    # Save models
    ebm_model_path = os.path.join(MODELS_DIR, "ebm_loan_model.joblib")
    joblib.dump(ebm, ebm_model_path)
    
    lr_model_path = os.path.join(MODELS_DIR, "logistic_baseline_model.joblib")
    joblib.dump(lr_pipe, lr_model_path)
    
    # Save overall metrics report
    report = {
        "ebm": ebm_metrics,
        "baseline": lr_metrics,
        "feature_importances": feature_importances,
        "training_metadata": {
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "features_used": features,
            "target": "synthetic_loan_approved",
            "model_version": "v1.2.0-ebm",
            "disclaimer": "Trained on synthetic loan applicant dataset with reproducible seed=42. Does not predict real-world lending performance without production bureau data."
        }
    }
    
    report_path = os.path.join(MODELS_DIR, "ml_metrics.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
        
    print(f"Saved EBM model -> {ebm_model_path}")
    print(f"Saved ML metrics -> {report_path}")
    print(f"EBM Metrics: Acc={ebm_metrics['accuracy']}, F1={ebm_metrics['f1_score']}, AUC={ebm_metrics['roc_auc']}")
    return report


def train_document_classifier():
    print("Training Lightweight Document Classifier...")
    # Synthetic corpus of typical extracted document texts
    docs_data = [
        # PAN documents
        ("INCOME TAX DEPARTMENT GOVT OF INDIA PERMANENT ACCOUNT NUMBER CARD PAN DELPJ9476P FATHER NAME DATE OF BIRTH SIGNATURE", "PAN"),
        ("GOVERNMENT OF INDIA INCOME TAX DEPT PERMANENT ACCOUNT NUMBER ABCDE1234F SIGNATURE", "PAN"),
        ("PAN CARD NSDL PROTEAN E-GOV INCOME TAX PERMANENT ACCOUNT NUMBER", "PAN"),
        ("INCOME TAX CARD FATHER NAME DOB PAN NUMBER", "PAN"),
        
        # Aadhaar documents
        ("UNIQUE IDENTIFICATION AUTHORITY OF INDIA UIDAI GOVERNMENT OF INDIA AADHAAR ENROLMENT VID MERA AADHAAR MERI PEHCHAN MALE FEMALE DOB ADDRESS", "AADHAAR"),
        ("UIDAI CENTRAL IDENTITIES DATA REPOSITORY GOVT OF INDIA AADHAAR NUMBER MASKED VID", "AADHAAR"),
        ("BHARAT SARKAR AADHAAR CARD ENROLMENT NUMBER DOB ADDRESS MALE", "AADHAAR"),
        ("UIDAI GOVT OF INDIA AADHAAR CARD 12 DIGIT IDENTIFIER", "AADHAAR"),
        
        # Salary Slip documents
        ("PAYSLIP FOR THE MONTH OF EARNINGS BASIC PAY HRA SPECIAL ALLOWANCE GROSS SALARY DEDUCTIONS PF TDS NET PAY EMPLOYEE ID", "SALARY_SLIP"),
        ("SALARY STATEMENT SALARY SLIP MONTHLY EMOLUMENTS NET CREDIT EMPLOYER NAME DESIGNATION", "SALARY_SLIP"),
        ("PAY SLIP PRIVATE LIMITED GROSS EARNINGS NET SALARY TOTAL DEDUCTIONS PROVIDENT FUND TAX", "SALARY_SLIP"),
        ("MONTHLY SALARY CERTIFICATE CTC PAYABLE DAYS NET SALARY IN WORDS", "SALARY_SLIP"),
        
        # Bank Statement documents
        ("ACCOUNT STATEMENT STATE BANK OF INDIA SAVINGS ACCOUNT TRANSACTION DATE PARTICULARS WITHDRAWALS DEPOSITS BALANCE IFSC", "BANK_STATEMENT"),
        ("HDFC BANK LTD ACCOUNT STATEMENT SUMMARY DEBITS CREDITS AVAILABLE BALANCE CLOSING BALANCE", "BANK_STATEMENT"),
        ("ICICI BANK CURRENT ACCOUNT STATEMENT STATEMENT PERIOD OPENING BALANCE TRANSACTION NARRATION", "BANK_STATEMENT"),
        ("BANK ACCOUNT STATEMENT PASSBOOK ENTRIES SALARY CREDIT CHEQUE DEPOSIT BALANCE", "BANK_STATEMENT"),
        
        # Other documents
        ("RENTAL AGREEMENT TENANCY CONTRACT STAMP PAPER LESSOR LESSEE PREMISES", "OTHER"),
        ("UTILITY BILL ELECTRICITY CONSUMPTION TARIFF UNITS CONSUMED AMOUNT DUE", "OTHER"),
        ("COLLEGE DEGREE CERTIFICATE UNIVERSITY EXAMINATION DEGREE OF BACHELOR MARKS", "OTHER")
    ]
    
    texts = [d[0] for d in docs_data]
    labels = [d[1] for d in docs_data]
    
    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
        ("nb", MultinomialNB())
    ])
    pipe.fit(texts, labels)
    
    doc_model_path = os.path.join(MODELS_DIR, "doc_classifier_model.joblib")
    joblib.dump(pipe, doc_model_path)
    print(f"Saved Document Classifier -> {doc_model_path}")
    return pipe


if __name__ == "__main__":
    train_loan_eligibility_models()
    train_document_classifier()
    print("All models successfully trained and serialized!")
