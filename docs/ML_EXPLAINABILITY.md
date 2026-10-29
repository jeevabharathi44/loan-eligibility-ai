# Machine Learning Explainability (XAI) & InterpretML EBM Architecture

## 1. The Glassbox Paradigm vs. Black-Box Neural Networks

In traditional credit scoring and underwriting, institutions frequently deploy black-box models (e.g. Deep Neural Networks, Multi-Layer Perceptrons, or Gradient Boosted Trees like XGBoost and LightGBM). While accurate, these architectures obscure the exact mathematical attribution of individual variables, violating:
- **Reserve Bank of India (RBI) Fair Lending Practice Code**.
- **Equal Credit Opportunity & Consumer Protection Directives**.
- **Adverse Action Notice Requirements**: When an applicant is denied credit, the lender is legally obligated to disclose the exact primary factors causing the adverse decision.

This platform implements the **Microsoft InterpretML Explainable Boosting Machine (EBM)**, an implementation of the **Generalized Additive Model with Pairwise Interactions ($GA^2M$)**.

---

## 2. Mathematical Formulation of EBM ($GA^2M$)

The Explainable Boosting Machine models the log-odds of loan approval as an exact additive combination of single-feature shape functions and pairwise interaction terms:

$$\text{logit}(P(\text{Approved})) = \ln\left(\frac{P}{1 - P}\right) = \beta_0 + \sum_{i=1}^{M} f_i(x_i) + \sum_{i < j} f_{ij}(x_i, x_j)$$

Where:
- $\beta_0$: The base log-odds intercept computed across the underlying training population.
- $f_i(x_i)$: The individual feature attribution (spline function / step function) for feature $x_i$ (e.g., CIBIL score, DTI ratio, Income).
- $f_{ij}(x_i, x_j)$: Bivariate interaction terms capturing non-linear coupled risk (e.g. DTI ratio $\times$ Monthly Income).
- $P(\text{Approved})$: The calibrated output probability derived via the logistic sigmoid transform:
  $$P(\text{Approved}) = \frac{1}{1 + \exp\left(-\text{logit}(P)\right)}$$

---

## 3. Local Feature Attribution & Logit Waterfall

For every applicant application, the EBM engine extracts exact local attributions:

```
  Base Intercept (β₀ = -0.420)
       │
       ├─► CIBIL Score (785)                  ──►  +1.285 logits (Prime Bonus)
       ├─► Debt-to-Income (25.5%)             ──►  +0.840 logits (Low Obligation Bonus)
       ├─► Employment Type (Salaried)         ──►  +0.620 logits (Income Stability)
       ├─► Loan-to-Income Multiplier (0.44x)  ──►  +0.350 logits (Conservative Leverage)
       ├─► Payment History (98.5%)            ──►  +0.410 logits (Disciplined Track Record)
       ├─► Revolving Utilization (18.0%)      ──►  +0.210 logits (Prudent Revolving Balance)
       │
       ▼
  Net Logit Sum = +3.295  ──►  P(Approved) = 93.4% (Prime Tier Sanction)
```

### Positive Credit Bonuses (+ Logits)
- **High CIBIL Score ($\ge 750$)**: Reflects multi-year credit discipline with zero 90+ DPD defaults.
- **Conservative DTI ($\le 50\%$)**: Leaves ample disposable cash flow for loan servicing.
- **Corporate Salaried Employment**: Verifiable payroll credits minimize cash-flow volatility.

### Negative Risk Penalties (- Logits)
- **Subprime CIBIL Score ($< 580$)**: Elevates estimated probability of default.
- **High DTI ($> 70\%$)**: Indicates borrower is over-leveraged and debt service is compromised.
- **Unemployed Status / Excessive Enquiries ($> 5$ in 6 months)**: Indicates aggressive credit-seeking behavior.

---

## 4. Dynamic Underwriting Decision Gates (Module 5)

The underwriting decision engine enforces strict regulatory decision gates:

| Risk Tier | Boundary Conditions | Calibrated Approval Probability | Regulatory Action |
| :--- | :--- | :--- | :--- |
| 🟢 **Prime Tier (Approved)** | CIBIL $\ge 700$, DTI $\le 50\%$, Salaried, 100% KYC & Biometrics ($\ge 75\%$) | **85% – 98%** | Instant automated sanction & IMPS disbursement |
| 🟡 **Near-Prime (Needs Review)** | CIBIL 580–680, DTI 50%–70%, Self-Employed, or Name Disparity Flag | **50% – 65%** | Exception flagged for Dr. Arulmozhi Varman review |
| 🔴 **Subprime (Declined)** | CIBIL $< 580$, DTI $> 70\%$, Unemployed, or Biometric/Document Mismatch | **8% – 25%** | Policy rejection with statutory Adverse Action notice |
