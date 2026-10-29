# REST API Specification: Explainable AI Personal Loan Engine

Base URL: `http://localhost:8000/api`  
Swagger Interactive UI: `http://localhost:8000/docs`  
ReDoc Documentation: `http://localhost:8000/redoc`

---

## 1. DigiLocker Single Sign-On (Meri Pehchaan Gateway)

### 1.1 Request Mobile OTP
`POST /auth/digilocker/mobile-otp`
- **Payload**:
  ```json
  {
    "mobile": "+91 98765 43210"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "status": "OTP_SENT",
    "mobile": "+91 9876543210",
    "session_id": "8f3a9e21-...",
    "expires_in_seconds": 60,
    "demo_hint": "Demo OTP is 123456"
  }
  ```

### 1.2 Verify Mobile OTP
`POST /auth/digilocker/verify-otp`
- **Payload**:
  ```json
  {
    "mobile": "9876543210",
    "otp": "123456"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1Ni...",
    "token_type": "bearer",
    "user": {
      "id": "usr-...",
      "username": "user_9876543210",
      "full_name": "Jeeva Bharathi M",
      "role": "APPLICANT"
    },
    "session_id": "DGL-SESS-...",
    "auth_mode": "MOBILE_OTP",
    "consent_recorded": true
  }
  ```

---

## 2. e-Aadhaar & ITD PAN Verification

### 2.1 Fetch Cryptographic XML Record
`GET /kyc/persona-kyc/{persona_id}`
- **Response (200 OK)**:
  ```json
  {
    "persona_id": "jeeva_bharathi",
    "applicant_name": "Jeeva Bharathi M",
    "e_aadhaar_xml": {
      "txn_id": "UKC:F198...",
      "xml_raw": "<?xml version=\"1.0\"...<Signature>...</Signature></KycRes>",
      "sha256_hash": "a4b2c1...",
      "cert_cn": "DS UNIQUE IDENTIFICATION AUTHORITY OF INDIA 04",
      "is_signature_valid": true,
      "demographics": {
        "uid_masked": "XXXXXXXX4892",
        "name": "Jeeva Bharathi M",
        "dob": "1994-08-15",
        "gender": "M",
        "address": "No. 42, Anna Salai, Guindy..."
      }
    },
    "itd_pan_master": {
      "pan": "ABCDE1234F",
      "name_on_card": "Jeeva Bharathi M",
      "pan_status": "OPERATIVE_AADHAAR_LINKED"
    }
  }
  ```

### 2.2 OCR Cross-Field Levenshtein Check
`POST /kyc/ocr-cross-check`
- **Payload**:
  ```json
  {
    "aadhaar_name": "Jeeva Bharathi M",
    "pan_name": "Jeeva B",
    "declared_name": "Jeeva Bharathi M",
    "aadhaar_dob": "1994-08-15",
    "pan_dob": "1994-08-15",
    "declared_dob": "1994-08-15",
    "pan_number": "ABCDE1234F"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "status": "DISCREPANCY_FLAG",
    "overall_similarity": 81.3,
    "name_similarity": 43.8,
    "name_levenshtein_distance": 9,
    "requires_officer_review": true,
    "review_reason": "Name Disparity detected (Levenshtein distance: 9, Similarity: 43.8%). E.g., 'Jeeva Bharathi M' vs 'Jeeva B'. Requires Underwriter Manual Exception Review."
  }
  ```

---

## 3. Tri-Biometric Live Facial Verification

### 3.1 Fetch Active Liveness Challenge
`GET /biometrics/liveness-challenge`
- **Response (200 OK)**:
  ```json
  {
    "challenge_id": "BLINK_TWICE",
    "instruction": "Please blink your eyes naturally twice",
    "action": "blink",
    "challenge_token": "7a8b9c...",
    "timeout_seconds": 15
  }
  ```

### 3.2 Verify Tri-Biometric 3-Way Pipeline
`POST /biometrics/verify-tri-biometric`
- **Payload**:
  ```json
  {
    "persona_id": "jeeva_bharathi",
    "live_webcam_image_b64": "data:image/jpeg;base64,...",
    "force_spoof_simulation": false
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "status": "PASSED",
    "composite_similarity": 92.4,
    "threshold": 75.0,
    "is_gate_passed": true,
    "pairs": {
      "aadhaar_pan": { "pair_name": "Aadhaar Registry ⟷ PAN Card", "similarity_percentage": 93.6, "passed": true },
      "aadhaar_live": { "pair_name": "Aadhaar Registry ⟷ Live Webcam", "similarity_percentage": 92.4, "passed": true },
      "pan_live": { "pair_name": "PAN Card ⟷ Live Webcam", "similarity_percentage": 91.2, "passed": true }
    },
    "liveness": {
      "liveness_passed": true,
      "liveness_score": 98.7,
      "challenge_verified": true
    }
  }
  ```

---

## 4. Underwriting & EBM Explainability

### 4.1 Evaluate Application
`POST /underwriting/evaluate`
- **Payload**:
  ```json
  {
    "name": "Jeeva Bharathi M",
    "age": 30,
    "income": 95000,
    "employment_type": "salaried",
    "dependents": 1,
    "existing_loans": 1,
    "monthly_obligations": 8000,
    "loan_amount": 500000,
    "loan_tenure": 36,
    "loan_purpose": "personal",
    "cibil_score": 785,
    "payment_history": 98.5,
    "credit_utilization": 18.0,
    "credit_history_years": 8.0,
    "recent_enquiries": 1,
    "biometrics_passed": true,
    "biometric_similarity": 92.4,
    "cross_field_status": "MATCH"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "risk_tier": "PRIME",
    "system_decision": "APPROVED",
    "probability": 0.934,
    "probability_percentage": 93.4,
    "estimated_emi": 16252.0,
    "debt_to_income_ratio": 25.53,
    "loan_to_income_ratio": 0.44,
    "intercept": -0.42,
    "positive_factors": [ ... ],
    "negative_factors": [ ... ],
    "waterfall_bars": [ ... ],
    "decision_summary": "Automated Policy Decision: APPROVED (PRIME Tier). Calibrated Approval Probability: 93.4%."
  }
  ```

---

## 5. Institutional Cockpit & Simulated Disbursement

### 5.1 Cockpit Statistics
`GET /audit/cockpit-stats`
- **Response (200 OK)**:
  ```json
  {
    "officer": {
      "name": "Dr. Arulmozhi Varman",
      "id": "EMP-90421",
      "title": "Chief Underwriting Officer & Risk Auditor"
    },
    "stats": {
      "total_applications": 3,
      "approved_count": 1,
      "needs_review_count": 1,
      "declined_count": 1,
      "total_disbursed_amount_inr": 500000.0,
      "average_cibil": 660.7,
      "average_dti_percentage": 63.1
    }
  }
  ```

### 5.2 Officer Manual Override
`POST /audit/override`
- **Payload**:
  ```json
  {
    "application_id": "3f7c2a...",
    "action": "APPROVE",
    "justification": "Reconciled name discrepancy via audited ITR-V Form and verified alternative cash reserves."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "status": "OVERRIDE_RECORDED",
    "previous_status": "NEEDS_REVIEW",
    "new_status": "APPROVED",
    "officer_name": "Dr. Arulmozhi Varman",
    "digital_signature": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
  ```

### 5.3 Execute Instant Disbursement
`POST /disbursement/execute`
- **Payload**:
  ```json
  {
    "application_id": "3f7c2a..."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "nach_umrn": "UMRN-2026-NACH-9K2L8P3M4V1Q",
    "bank_name": "State Bank of India",
    "bank_account_masked": "XXXXXXXX5721",
    "imps_rrn": "202684920184",
    "imps_utr": "RBILEND261028193012948",
    "disbursement_amount": 500000.0,
    "disbursement_status": "COMPLETED_SUCCESS",
    "kfs_data": {
      "regulatory_heading": "KEY FACT STATEMENT (KFS) - RBI DIGITAL LENDING GUIDELINES",
      "annualized_percentage_rate_apr": "10.5%",
      "cooling_off_look_up_period": "3 Business Days"
    }
  }
  ```
