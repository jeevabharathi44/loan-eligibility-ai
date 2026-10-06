# REST API Specification — Loan Eligibility AI

The Express backend runs on port `5000` (or `http://localhost:5000/api`).
All protected endpoints require a `Bearer <token>` in the HTTP `Authorization` header.

---

## 1. Authentication APIs

### `POST /api/auth/register`
Creates a new applicant or admin account.

**Request Body:**
```json
{
  "name": "Arjun Sharma",
  "email": "arjun@loanai.local",
  "password": "User@12345",
  "role": "USER"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "e43b1234-abcd-5678-ef01-123456789abc",
      "name": "Arjun Sharma",
      "email": "arjun@loanai.local",
      "role": "USER",
      "createdAt": "2026-10-06T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### `POST /api/auth/login`
Authenticates user credentials and returns a signed JWT.

**Request Body:**
```json
{
  "email": "arjun@loanai.local",
  "password": "User@12345"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "e43b1234-abcd-5678-ef01-123456789abc",
      "name": "Arjun Sharma",
      "email": "arjun@loanai.local",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### `GET /api/auth/me`
Returns details of the currently authenticated token bearer.

---

## 2. Loan Applications APIs

### `POST /api/applications`
Submits applicant profile and exposure parameters.

**Request Body:**
```json
{
  "income": 90000,
  "employmentType": "salaried",
  "age": 30,
  "dependents": 1,
  "loanAmount": 800000,
  "loanTenure": 36,
  "loanPurpose": "home",
  "existingLoans": 1,
  "monthlyObligations": 5000
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Loan application created successfully",
  "data": {
    "application": {
      "id": "app-9876-uuid",
      "userId": "user-1234-uuid",
      "status": "PENDING",
      "loanAmount": 800000,
      "loanTenure": 36,
      "createdAt": "2026-10-06T12:00:00.000Z"
    }
  }
}
```

### `GET /api/applications`
Retrieves all applications owned by the logged-in user.

### `GET /api/applications/:id`
Retrieves single application by ID with full credit profile, predictions, factors, and audit logs.
*Strict IDOR authorization: Only the owning user or an administrator can access this endpoint.*

### `PUT /api/applications/:id`
*Admin only*: Manually overrides an application status.

**Request Body:**
```json
{
  "status": "APPROVED",
  "reason": "Executive underwriting exception granted based on collateral guarantee."
}
```

---

## 3. Credit Verification APIs

### `POST /api/credit/verify`
Records credit habits, runs consistency check, and applies provider mode abstraction.

**Request Body:**
```json
{
  "applicationId": "app-9876-uuid",
  "cibilScore": 780,
  "paymentHistory": 98.0,
  "creditUtilization": 20.0,
  "creditHistoryYears": 8.0,
  "recentEnquiries": 1,
  "consentGiven": true,
  "providerMode": "mock"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Credit profile processed successfully",
  "data": {
    "creditProfile": {
      "applicationId": "app-9876-uuid",
      "cibilScore": 780,
      "verificationStatus": "DEMO_UNVERIFIED",
      "provider": "MOCK_CREDIT_BUREAU"
    },
    "displayNotice": "Demo credit information – not verified",
    "notes": "Demo credit check: Declared habits correspond to estimated score of 780, consistent with declared 780."
  }
}
```

---

## 4. Prediction APIs

### `POST /api/predictions`
Triggers the Python FastAPI EBM prediction engine and persists explainable factors.

**Request Body:**
```json
{
  "applicationId": "app-9876-uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "AI loan assessment completed",
  "data": {
    "predictionId": "pred-4321-uuid",
    "applicationId": "app-9876-uuid",
    "predictedClass": "Approved",
    "probability": 0.985,
    "probabilityPercentage": 98.5,
    "riskLevel": "Low",
    "modelVersion": "v1.2.0-ebm",
    "modelName": "Explainable Boosting Machine (EBM)",
    "positiveFactors": [
      {
        "feature": "debt_to_income_ratio",
        "contribution": 1.45,
        "direction": "positive",
        "explanation": "Debt-to-Income (DTI) ratio of 28.9% is conservative and manageable, leaving healthy disposable income for loan service."
      }
    ],
    "negativeFactors": [],
    "derivedFeatures": {
      "estimated_emi": 26012.35,
      "debt_to_income_ratio": 0.3445,
      "loan_to_income_ratio": 0.7407,
      "loan_amount_inr": 800000
    },
    "disclaimer": "This assessment is an AI-assisted risk assessment for demonstration/research purposes and is not a guaranteed loan approval or denial."
  }
}
```

---

## 5. Dashboard & Admin APIs

- `GET /api/dashboard/statistics`: User portfolio statistics, status counts, average CIBIL, and ML service status.
- `GET /api/admin/applications`: Paginated list of all applications across all users.
- `GET /api/admin/statistics`: Platform user counts, approval rate %, risk distributions, and model telemetry.
