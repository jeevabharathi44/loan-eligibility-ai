# Synthetic Datasets for Digital Personal Loan Processing System
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
