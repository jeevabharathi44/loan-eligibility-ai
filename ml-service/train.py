"""
Model training pipeline for Loan Eligibility AI.
Trains an Explainable Boosting Machine (EBM) and a Logistic Regression baseline.
Evaluates both on test data and serializes model artifacts and metrics.
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)
from interpret.glassbox import ExplainableBoostingClassifier

from preprocessing import (
    FEATURE_NAMES,
    NUMERICAL_COLS,
    CATEGORICAL_COLS
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "loan_credit_dataset.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)


def train_models():
    print(f"Loading dataset from: {DATASET_PATH}")
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)
    print(f"Total samples: {len(df)}")

    X = df[FEATURE_NAMES]
    y = df['loan_status']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"Train samples: {len(X_train)}, Test samples: {len(X_test)}")

    # 1. Baseline Model: Logistic Regression
    print("\n--- Training Baseline (Logistic Regression) ---")
    preprocessor_lr = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), NUMERICAL_COLS),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CATEGORICAL_COLS)
        ]
    )

    baseline_pipeline = Pipeline([
        ('preprocessor', preprocessor_lr),
        ('classifier', LogisticRegression(max_iter=1000, random_state=42))
    ])

    baseline_pipeline.fit(X_train, y_train)
    y_pred_base = baseline_pipeline.predict(X_test)
    y_proba_base = baseline_pipeline.predict_proba(X_test)[:, 1]

    cm_base = confusion_matrix(y_test, y_pred_base).tolist()
    baseline_metrics = {
        "model_name": "Logistic Regression (Baseline)",
        "accuracy": round(float(accuracy_score(y_test, y_pred_base)), 4),
        "precision": round(float(precision_score(y_test, y_pred_base, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred_base, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test, y_pred_base, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, y_proba_base)), 4),
        "confusion_matrix": cm_base
    }
    print(f"Baseline Accuracy: {baseline_metrics['accuracy']:.4f}")
    print(f"Baseline ROC-AUC:  {baseline_metrics['roc_auc']:.4f}")
    print(f"Baseline F1 Score: {baseline_metrics['f1_score']:.4f}")

    # 2. Main Model: Explainable Boosting Machine (EBM)
    print("\n--- Training Explainable Boosting Machine (EBM) ---")
    feature_types = ['continuous' if c in NUMERICAL_COLS else 'nominal' for c in FEATURE_NAMES]
    
    ebm = ExplainableBoostingClassifier(
        feature_names=FEATURE_NAMES,
        feature_types=feature_types,
        random_state=42,
        max_bins=256,
        interactions=10
    )

    ebm.fit(X_train, y_train)
    y_pred_ebm = ebm.predict(X_test)
    y_proba_ebm = ebm.predict_proba(X_test)[:, 1]

    cm_ebm = confusion_matrix(y_test, y_pred_ebm).tolist()
    ebm_metrics = {
        "model_name": "Explainable Boosting Machine (EBM)",
        "model_version": "v1.2.0-ebm",
        "accuracy": round(float(accuracy_score(y_test, y_pred_ebm)), 4),
        "precision": round(float(precision_score(y_test, y_pred_ebm, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred_ebm, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test, y_pred_ebm, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, y_proba_ebm)), 4),
        "confusion_matrix": cm_ebm
    }
    print(f"EBM Accuracy: {ebm_metrics['accuracy']:.4f}")
    print(f"EBM ROC-AUC:  {ebm_metrics['roc_auc']:.4f}")
    print(f"EBM F1 Score: {ebm_metrics['f1_score']:.4f}")

    # Global feature importances
    global_explanation = ebm.explain_global(name="EBM Global")
    global_data = global_explanation.data()
    feature_importances = []
    for name, score in zip(global_data['names'], global_data['scores']):
        feature_importances.append({
            "feature": str(name),
            "importance": round(float(score), 4)
        })
    feature_importances.sort(key=lambda x: x['importance'], reverse=True)

    # 3. Save artifacts
    print("\n--- Saving Artifacts ---")
    joblib.dump(ebm, os.path.join(MODELS_DIR, "ebm_model.pkl"))
    joblib.dump(baseline_pipeline, os.path.join(MODELS_DIR, "baseline_model.pkl"))

    all_metrics = {
        "ebm": ebm_metrics,
        "baseline": baseline_metrics,
        "feature_importances": feature_importances,
        "training_metadata": {
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "features_used": FEATURE_NAMES,
            "target": "loan_status"
        }
    }

    with open(os.path.join(MODELS_DIR, "metrics.json"), "w") as f:
        json.dump(all_metrics, f, indent=2)

    print("Model training and serialization completed successfully.")
    return all_metrics


if __name__ == "__main__":
    train_models()
