# Machine Learning & Explainability — Loan Eligibility AI

## 1. Problem Statement

Credit underwriting requires high predictive accuracy to manage credit default risk, but banking regulations (e.g. RBI Fair Lending Practices, FCRA, Equal Credit Opportunity Act) strictly mandate that adverse decisions must be accompanied by specific, actionable reasons. Traditional "black-box" models (Deep Neural Networks, Random Forests, XGBoost) obscure why an applicant was approved or denied.

**Loan Eligibility AI** solves this dilemma by utilizing **InterpretML's Explainable Boosting Machine (EBM)**, which provides state-of-the-art predictive performance while remaining 100% mathematically interpretable ("glassbox").

---

## 2. Dataset Provenance & Synthesis

The dataset (`dataset/loan_credit_dataset.csv`) contains 3,500 samples modeling realistic Indian retail banking underwriting distributions:
- **Demographics**: Age (21-65), Dependents (0-4), Employment Type (Salaried, Self-employed, Not employed).
- **Financial Parameters**: Monthly income (log-normal, median ₹50,000), Active loans (0-4), Existing monthly obligations.
- **Credit Bureau Attributes**: CIBIL credit score (300-900), On-time payment % (40-100%), Credit utilization % (5-98%), Credit vintage (years), Recent credit enquiries (0-12).
- **Derived Financial Metrics**: Reducing balance monthly EMI (10.5% APR), Fixed Obligation to Income Ratio (DTI / FOIR), and Loan-to-Income (LTI).

---

## 3. The Glassbox EBM Model

The Explainable Boosting Machine is a Generalized Additive Model with pairwise interactions (GA2M):

$$g(E[y]) = \beta_0 + \sum_{i=1}^p f_i(x_i) + \sum_{i \ne j} f_{ij}(x_i, x_j)$$

Where:
- $g(\cdot)$ is the logit link function.
- $\beta_0$ is the global baseline intercept.
- $f_i(x_i)$ is a univariate shape function computed via cyclic gradient boosted trees on one feature at a time with round-robin feature scheduling.
- $f_{ij}(x_i, x_j)$ captures pairwise feature interaction effects.

### Why EBM is Legally Compliant for Lending:
1. **Exact Local Contributions**: Each feature's contribution $f_i(x_i)$ is an exact additive term in log-odds space. No post-hoc approximations (like SHAP sampling or LIME perturbations) are required.
2. **Monotonicity & Auditing**: Credit risk policies can inspect the exact curve for CIBIL score or DTI ratio to ensure there are no unintended biases or non-monotonic anomalies.

---

## 4. Empirical Evaluation Results

Both models were trained on 80% (2,800 samples) and evaluated on a holdout test split of 20% (700 samples):

| Evaluation Metric | Baseline (Logistic Regression) | Explainable Boosting Machine (EBM) |
|---|---|---|
| **Accuracy** | 87.43% | **96.43%** |
| **Precision** | 85.27% | **96.23%** |
| **Recall** | 81.48% | **94.44%** |
| **F1-Score** | 83.33% | **95.33%** |
| **ROC-AUC** | 0.9527 | **0.9962** |

### Confusion Matrix on Test Holdout (700 samples)
- **EBM**:
  - True Negatives (Declined): **420**
  - False Positives (Erroneous Approvals): **10**
  - False Negatives (Missed Approvals): **15**
  - True Positives (Approved): **255**
- **Baseline (Logistic Regression)**:
  - True Negatives: **392**, False Positives: **38**
  - False Negatives: **50**, True Positives: **220**

---

## 5. Dynamic Plain-English Explanation Engine

Rather than hard-coding generic explanations, `ml-service/explain.py` derives plain-English explanations directly from the applicant's real numerical attributes and the exact mathematical contribution score ($f_i(x_i)$):

1. **Direction**: Positive contributions ($f_i > 0$) increase approval likelihood; negative contributions ($f_i < 0$) increase risk.
2. **Magnitude**: Impact is graduated into "significantly" ($|f_i| > 1.2$), "moderately" ($|f_i| > 0.5$), or "slightly".
3. **Context**: Specific metrics (e.g. DTI of 28.9%, CIBIL of 780 Prime, Salaried employment status) are injected to provide actionable financial feedback.
