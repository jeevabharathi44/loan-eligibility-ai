# Loan Eligibility AI — Explainable Credit Risk Platform

> **Full-Stack AI Loan Eligibility & Credit Risk Assessment platform featuring Glassbox Machine Learning (Microsoft InterpretML EBM), interactive CIBIL verification, real-time financial ratios (DTI, EMI, LTI), and complete Docker Desktop orchestration.**

[![EBM Accuracy](https://img.shields.io/badge/EBM%20Accuracy-96.4%25-brightgreen)](docs/ML_EXPLAINABILITY.md)
[![EBM ROC-AUC](https://img.shields.io/badge/EBM%20ROC--AUC-0.996-blue)](docs/ML_EXPLAINABILITY.md)
[![Docker Ready](https://img.shields.io/badge/Docker%20Compose-Ready-2496ED?logo=docker&logoColor=white)](docs/DOCKER_GUIDE.md)

---

## 1. Overview & Architecture

Loan Eligibility AI bridges the gap between machine-learning credit scoring and banking regulatory transparency. Instead of black-box scoring formulas, this platform integrates:
- **InterpretML Explainable Boosting Machine (EBM)**: Computes mathematical contributions for every attribute with zero black-box opacity.
- **Interactive CIBIL Consistency Verifier**: Validates self-declared scores against repayment habits and credit vintage with a pluggable provider abstraction.
- **Enterprise Express & Prisma Backend**: Implements JWT authentication, RBAC, Zod validation, Helmet security headers, rate limiting, and immutable audit logs.
- **Modern Responsive React Frontend**: Preserves the original cyberpunk dark-mode aesthetics, CIBIL gauge with marker needle, and feature contribution bars with center vertical split line.

```
loan-eligibility-ai/
├── docker-compose.yml       # 1-command Docker Desktop orchestration
├── .env.example             # Environment configuration template
├── README.md                # Project documentation
├── dataset/                 # 3,500 sample banking underwriting dataset & metadata
│   ├── loan_credit_dataset.csv
│   └── dataset_metadata.json
├── database/                # Database migrations & schemas
│   ├── schema.prisma
│   └── init.sql
├── backend/                 # Express + TypeScript + Prisma REST API
│   ├── Dockerfile
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/credit/ # CreditProvider, MockCreditProvider, VerifiedCreditProvider
│   │   ├── services/mlClient.ts
│   │   └── tests/api.test.ts
│   └── prisma/schema.prisma
├── ml-service/              # Python FastAPI + InterpretML EBM Microservice
│   ├── Dockerfile
│   ├── app.py               # FastAPI server (/health, /metrics, /predict)
│   ├── train.py             # EBM and baseline model training pipeline
│   ├── predict.py           # Inference engine with risk tiering
│   ├── preprocessing.py     # Reducing balance EMI, DTI, LTI derivation
│   ├── explain.py           # Dynamic plain-English explainability synthesizer
│   ├── test_ml.py           # Pytest test suite
│   ├── models/              # Serialized ebm_model.pkl, baseline_model.pkl, metrics.json
│   └── dataset/
├── frontend/                # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── components/      # CibilGauge, FactorBar, StatusBadge, Navbar, Footer
│       └── pages/           # Wizard, Dashboard, Detail, History, Admin, Metrics
└── docs/                    # In-depth architectural & security documentation
    ├── ARCHITECTURE.md
    ├── API_SPECIFICATION.md
    ├── ML_EXPLAINABILITY.md
    ├── SECURITY.md
    └── DOCKER_GUIDE.md
```

---

## 2. Quickstart with Docker Desktop (Recommended)

1. Ensure **Docker Desktop** is running on your machine.
2. In the project root directory, run:
   ```bash
   docker compose up --build
   ```
3. Access the services:
   - **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
   - **Backend API Gateway**: [http://localhost:5000/health](http://localhost:5000/health)
   - **ML Service & Swagger**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Pre-Seeded Demo Accounts:
- **Applicant User**: `arjun@loanai.local` / `User@12345`
- **Underwriter Admin**: `admin@loanai.local` / `Admin@12345`

*(You can also click the 1-click demo buttons on the login screen to autofill these credentials).*

---

## 3. Local Development (Running without Docker)

### Step 3.1: Python ML Microservice
```bash
cd ml-service
python -m pip install -r requirements.txt
python train.py      # Trains EBM model & saves metrics
uvicorn app:app --port 8000 --reload
```

### Step 3.2: Express Backend
```bash
cd backend
npm install
npx prisma generate
# With a running MySQL database on localhost:3306:
npx prisma db push
npx ts-node prisma/seed.ts
npm run dev          # Runs on http://localhost:5000
```

### Step 3.3: React Frontend
```bash
cd frontend
npm install
npm run dev          # Runs on http://localhost:3000 or http://localhost:5173
```

---

## 4. Running Test Suites

### Backend Tests (Jest + Supertest)
```bash
cd backend
npm test
```
*Executes 15 test cases covering JWT authentication, duplicate registration, IDOR security, CIBIL range validation, ML fault tolerance, and application lifecycle.*

### ML Service Tests (Pytest)
```bash
cd ml-service
python -m pytest test_ml.py -v
```
*Tests financial EMI/DTI formulas, model inference, EBM attribution extraction, and input validation.*

---

## 5. Machine Learning Telemetry & Metrics

| Metric | Logistic Regression (Baseline) | Explainable Boosting Machine (EBM) |
|---|---|---|
| **Accuracy** | 87.43% | **96.43%** |
| **Precision** | 85.27% | **96.23%** |
| **Recall** | 81.48% | **94.44%** |
| **F1 Score** | 83.33% | **95.33%** |
| **ROC-AUC** | 0.9527 | **0.9962** |

*All metrics are derived from empirical evaluation on a 20% holdout test partition (`test_samples: 700`) without data leakage or fabrication.*

---

## 6. Credit Bureau Integration & Privacy Notice

- **No Scraping**: The platform strictly complies with ethical and security standards. It does NOT scrape CIBIL or bypass CAPTCHAs.
- **Provider Abstraction**: Implements `CreditProvider.verifyCreditProfile()` with support for:
  1. `DEMO MODE`: Manual self-declared data marked `"Demo credit information – not verified"`.
  2. `VERIFIED PROVIDER MODE`: Architecture for authorized bureau APIs with credentials stored solely in environment variables.
- **Regulatory Consent**: An ISO-8601 consent timestamp is stored with every credit profile.

---

## 7. Disclaimer

*This assessment is an AI-assisted risk assessment for demonstration and research purposes and is not a guaranteed loan approval or denial.*
