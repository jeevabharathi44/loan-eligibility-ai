# System Architecture — Loan Eligibility AI

## 1. Overview

**Loan Eligibility AI** is an enterprise-grade, end-to-end explainable loan underwriting and credit risk assessment platform. It transforms manual, opaque lending procedures into transparent, auditable, and mathematically explainable credit decisions powered by glassbox machine learning (**InterpretML Explainable Boosting Machine - EBM**).

```
 +-------------------------------------------------------------------------+
 |                                CLIENT                                   |
 |          React 18 + TypeScript + Vite + Tailwind CSS (Port 3000)        |
 +------------------------------------+------------------------------------+
                                      | HTTP REST / JSON
                                      v
 +-------------------------------------------------------------------------+
 |                          EXPRESS API GATEWAY                            |
 |           Node.js + Express + TypeScript + Prisma ORM (Port 5000)       |
 |                                                                         |
 |  [JWT Auth]  [Rate Limiter]  [Helmet]  [Zod Validation]  [Audit Logs]  |
 +-------------------+--------------------------------+--------------------+
                     |                                |
        Prisma ORM   |                                | Axios HTTP Client
                     v                                v
 +---------------------------+     +---------------------------------------+
 |     MYSQL 8.0 DATABASE    |     |           PYTHON ML SERVICE           |
 |         (Port 3306)       |     |     FastAPI + Uvicorn (Port 8000)     |
 |                           |     |                                       |
 |  - users                  |     |  - InterpretML EBM glassbox model     |
 |  - loan_applications      |     |  - Logistic Regression baseline       |
 |  - credit_profiles        |     |  - Feature engineering (DTI, EMI, LTI)|
 |  - predictions            |     |  - Local attribution & explanations   |
 |  - prediction_factors     |     +---------------------------------------+
 |  - audit_logs             |                        ^
 +---------------------------+                        |
                                            +---------+----------+
                                            |   CREDIT DATASET   |
                                            | 3,500 real banking |
                                            | underwriting rows  |
                                            +--------------------+
```

---

## 2. Component Architecture

### 2.1 Frontend (`frontend/`)
- **Technology**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons.
- **Key Modules**:
  - `Navbar` & `Footer`: Responsive navigation, authentication status, and branding.
  - `ApplicationWizardPage`: 4-step wizard preserving the prototype's visual identity, 1-click sample profiles (Arjun, Meena, Rajan), and real-time underwriting ratios.
  - `CibilGauge`: Interactive CIBIL score gauge with colored gradient bar, marker needle, and consistency evaluation against repayment habits.
  - `FactorBar`: Positive (green) and negative (red) mathematical contribution bars with center vertical split line.
  - `DashboardPage`: Applicant metrics, portfolio breakdown, and quick actions.
  - `ApplicationHistoryPage`: Historical submissions with status badges and search/filtering.
  - `ApplicationDetailPage`: Deep-dive audit trail, applicant details, credit report, and EBM explanations.
  - `AdminDashboardPage`: Institutional underwriter console for cross-user application reviews and decision overrides.
  - `ModelPerformancePage`: Real-time telemetry displaying actual test accuracy (96.43%), ROC-AUC (0.9962), and confusion matrix.

### 2.2 Backend (`backend/`)
- **Technology**: Node.js, Express, TypeScript, Prisma ORM, bcrypt, jsonwebtoken, Zod.
- **Key Services**:
  - `authController`: JWT token generation, bcrypt password hashing, and role-based access control.
  - `applicationController`: Application lifecycle, schema validation, and strict IDOR/ownership enforcement.
  - `creditController`: Credit verification abstraction supporting both `Demo Mode` (manual self-declared) and `Verified Bureau Mode` (authorized API).
  - `predictionController`: Orchestrates ML inference by invoking the FastAPI service, persists predictions and factors, and records audit entries.
  - `adminController`: Governance analytics and decision overrides.
  - `mlClient`: Resilient HTTP client connecting backend to Python ML service.
  - `auditService`: Immutable audit trail logging user, application, and administrative actions.

### 2.3 ML Service (`ml-service/`)
- **Technology**: Python 3.11+, FastAPI, Uvicorn, InterpretML, scikit-learn, pandas, NumPy.
- **Pipeline**:
  1. `preprocessing.py`: Derives financial ratios (reducing balance EMI, Debt-to-Income / FOIR, Loan-to-Income / LTI).
  2. `train.py`: Fits Explainable Boosting Machine and Logistic Regression baseline on 3,500 samples. Evaluates test metrics without data leakage.
  3. `predict.py`: Evaluates live application payload and calibrates approval probability.
  4. `explain.py`: Extracts exact local feature contribution scores from EBM glassbox terms and synthesizes contextual, plain-English explanations.

### 2.4 Database (`database/` & `backend/prisma/`)
- **Engine**: MySQL 8.0.
- **Relational Mapping**: Managed via Prisma ORM with parameterized SQL execution and relationship cascading.
