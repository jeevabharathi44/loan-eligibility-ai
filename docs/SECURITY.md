# Security & Data Governance — Loan Eligibility AI

## 1. Authentication & Token Management
- **JWT (JSON Web Tokens)**: Issued upon successful authentication with 7-day expiration.
- **bcrypt Password Hashing**: Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` with 10 salt rounds.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `USER` (applicant) and `ADMIN` (institutional underwriter).

## 2. Insecure Direct Object Reference (IDOR) Mitigation
- In `GET /api/applications/:id` and related endpoints, the backend strictly verifies ownership:
  ```typescript
  if (application.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied' });
  }
  ```
  A malicious user cannot inspect another user's loan application simply by changing the ID in the URL.

## 3. Network & Application Hardening
- **Helmet**: Sets critical HTTP security headers (X-DNS-Prefetch-Control, X-Frame-Options, Strict-Transport-Security, X-Download-Options, X-Content-Type-Options).
- **CORS (Cross-Origin Resource Sharing)**: Restricted to approved frontend origins.
- **Rate Limiting**:
  - Global API limiter: 150 requests per 15 minutes per IP.
  - Auth limiter: 30 login/registration attempts per 15 minutes to prevent credential stuffing.
- **Zod Schema Validation**: Strict input boundary validation; malformed payloads are rejected with 400 Bad Request before database queries are made.

## 4. Credit Data Minimization & Bureau Privacy
- **Consent Enforcement**: Credit checks cannot be executed without explicit applicant consent (`consentGiven: true`), logged with an ISO timestamp.
- **No Scraping or Credential Theft**: The system implements an authorized `CreditProvider` interface. It does not scrape CIBIL or bypass CAPTCHAs.
- **Clear Demarcation**: Manual and demo credit checks are explicitly stamped with:
  `"Demo credit information – not verified"`.
- **Sensitive Data Minimization**: Only the numerical credit variables necessary for risk evaluation are stored.

## 5. Audit Logging
Every sensitive action produces an immutable audit record in the `audit_logs` table:
- `USER_REGISTERED`
- `USER_LOGIN`
- `APPLICATION_CREATED`
- `CREDIT_PROFILE_VERIFIED`
- `PREDICTION_GENERATED`
- `APPLICATION_STATUS_UPDATED` (with underwriter justification)
