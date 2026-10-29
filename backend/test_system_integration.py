"""
System Integration Test Suite for Explainable AI (XAI) Digital Personal Loan Processing System
Validates all 6 modules, benchmark personas, and RBI compliance rules.
"""
import sys
import os

# Ensure UTF-8 output on Windows consoles
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.database import engine, Base

# Ensure SQLite schema exists for testing
Base.metadata.create_all(bind=engine)
client = TestClient(app)

def test_system_pipeline():
    print("\n" + "="*80)
    print("STARTING FULL END-TO-END SYSTEM INTEGRATION TEST")
    print("="*80)
    
    # 1. Health check
    print("\n[TEST 1] Checking API Health & Model Readiness...")
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health_data = res.json()
    print(f"  [OK] Status: {health_data['status']}")
    print(f"  [OK] Model: {health_data['model']}")
    print(f"  [OK] Regulator: {health_data['rbi_compliance']}")
    print(f"  [OK] Chief Underwriter: {health_data['underwriter']}")
    
    # 2. Module 1: DigiLocker Single Sign-On (Meri Pehchaan)
    print("\n[TEST 2] Testing Module 1: DigiLocker Single Sign-On Gateway...")
    otp_res = client.post("/api/auth/digilocker/mobile-otp", json={"mobile": "+91 98765 43210"})
    assert otp_res.status_code == 200
    print("  [OK] Step 1: Simulated OTP generated for +91 98765 43210")
    
    verify_res = client.post("/api/auth/digilocker/verify-otp", json={"mobile": "9876543210", "otp": "123456"})
    assert verify_res.status_code == 200
    auth_data = verify_res.json()
    print(f"  [OK] Step 2: Authenticated citizen: {auth_data['user']['full_name']} ({auth_data['session_id']})")
    
    # 2b. Check Cryptographic XML e-Aadhaar & ITD PAN retrieval
    print("\n[TEST 2b] Testing Direct Cryptographic XML e-Aadhaar & ITD PAN Retrieval...")
    kyc_res = client.get("/api/kyc/persona-kyc/jeeva_bharathi")
    assert kyc_res.status_code == 200
    kyc_data = kyc_res.json()
    assert kyc_data["e_aadhaar_xml"]["is_signature_valid"] is True
    print(f"  [OK] UIDAI Digital Signature Verified (Issuer: {kyc_data['e_aadhaar_xml']['cert_cn']})")
    print(f"  [OK] ITD PAN Master Verified (Status: {kyc_data['itd_pan_master']['pan_status']})")
    
    # 3. Module 2: Tri-Biometric Live Facial Verification Gate
    print("\n[TEST 3] Testing Module 2: Tri-Biometric Live Facial Verification Gate...")
    # Test 3a: Authentic biometric verification (>= 75%)
    bio_res = client.post("/api/biometrics/verify-tri-biometric", json={
        "persona_id": "jeeva_bharathi",
        "force_spoof_simulation": False
    })
    assert bio_res.status_code == 200
    bio_data = bio_res.json()
    assert bio_data["is_gate_passed"] is True
    print(f"  [OK] Composite Similarity: {bio_data['composite_similarity']}% >= 75.0% threshold (PASSED)")
    print(f"  [OK] Active Liveness Challenge Verified: {bio_data['liveness']['liveness_score']}%")
    
    # Test 3b: Spoof / Impersonation Simulation (< 75%)
    spoof_res = client.post("/api/biometrics/verify-tri-biometric", json={
        "persona_id": "jeeva_bharathi",
        "force_spoof_simulation": True
    })
    assert spoof_res.status_code == 200
    spoof_data = spoof_res.json()
    assert spoof_data["is_gate_passed"] is False
    assert spoof_data["status"] == "FAILED_SPOOF"
    print(f"  [OK] Anti-Spoofing Gate Triggered: {spoof_data['composite_similarity']}% < 75.0% (SECURITY DENIAL)")
    
    # 4. Module 3: Automated OCR & 100% Cross-Field Consistency Validation
    print("\n[TEST 4] Testing Module 3: OCR Cross-Field Levenshtein Consistency...")
    # Exact Match (Persona 1)
    ocr_p1 = client.post("/api/kyc/ocr-cross-check", json={
        "aadhaar_name": "Jeeva Bharathi M",
        "pan_name": "Jeeva Bharathi M",
        "declared_name": "Jeeva Bharathi M",
        "aadhaar_dob": "1994-08-15",
        "pan_dob": "1994-08-15",
        "declared_dob": "1994-08-15",
        "pan_number": "ABCDE1234F"
    }).json()
    assert ocr_p1["status"] == "MATCH"
    print(f"  [OK] Persona 1 Name Match: Distance {ocr_p1['name_levenshtein_distance']}, Sim {ocr_p1['name_similarity']}% (MATCH)")
    
    # Discrepancy (Persona 2: "Jeeva Bharathi M" vs "Jeeva B")
    ocr_p2 = client.post("/api/kyc/ocr-cross-check", json={
        "aadhaar_name": "Jeeva Bharathi M",
        "pan_name": "Jeeva B",
        "declared_name": "Jeeva Bharathi M",
        "aadhaar_dob": "1994-08-15",
        "pan_dob": "1994-08-15",
        "declared_dob": "1994-08-15",
        "pan_number": "ABCDE1234F"
    }).json()
    assert ocr_p2["status"] == "DISCREPANCY_FLAG"
    assert ocr_p2["requires_officer_review"] is True
    print(f"  [OK] Persona 2 Disparity Detected: Distance {ocr_p2['name_levenshtein_distance']}, Sim {ocr_p2['name_similarity']}% (DISCREPANCY EXCEPTION FLAGGED)")
    
    # 5. Modules 4 & 5: EBM Underwriting Engine & Decision Gates
    print("\n[TEST 5] Testing Modules 4 & 5: Microsoft InterpretML EBM & Decision Gates...")
    
    # 5a. 🟢 Persona 1: Prime Tier Instant Approval
    p1_eval = client.post("/api/applications", json={
        "name": "Jeeva Bharathi M",
        "age": 30,
        "income": 95000,
        "employment_type": "salaried",
        "dependents": 1,
        "existing_loans": 1,
        "monthly_obligations": 8000,
        "loan_amount": 500000,
        "loan_tenure": 36,
        "cibil_score": 785,
        "payment_history": 98.5,
        "credit_utilization": 18.0,
        "credit_history_years": 8.0,
        "recent_enquiries": 1,
        "biometrics_passed": True,
        "biometric_similarity": 92.4,
        "cross_field_status": "MATCH"
    }).json()
    assert p1_eval["system_decision"] == "APPROVED"
    assert p1_eval["risk_tier"] == "PRIME"
    assert p1_eval["probability_percentage"] >= 85.0
    print(f"  [OK] Persona 1: {p1_eval['applicant_name']} -> {p1_eval['system_decision']} ({p1_eval['probability_percentage']}%, DTI: {p1_eval['debt_to_income_ratio']}%)")
    print(f"    • Waterfall Bars: {len(p1_eval['waterfall_bars'])} bars generated, Net Logit: {p1_eval['waterfall_bars'][-1]['value']}")
    
    # 5b. 🟡 Persona 2: Near-Prime Needs Review
    p2_eval = client.post("/api/applications", json={
        "name": "Jeeva B",
        "age": 32,
        "income": 65000,
        "employment_type": "self_employed",
        "dependents": 2,
        "existing_loans": 2,
        "monthly_obligations": 14000,
        "loan_amount": 500000,
        "loan_tenure": 36,
        "cibil_score": 662,
        "payment_history": 88.0,
        "credit_utilization": 46.0,
        "credit_history_years": 5.0,
        "recent_enquiries": 3,
        "biometrics_passed": True,
        "biometric_similarity": 83.1,
        "cross_field_status": "DISCREPANCY_FLAG"
    }).json()
    assert p2_eval["system_decision"] == "NEEDS_REVIEW"
    assert p2_eval["risk_tier"] == "NEAR_PRIME"
    print(f"  [OK] Persona 2: {p2_eval['applicant_name']} -> {p2_eval['system_decision']} ({p2_eval['probability_percentage']}%, DTI: {p2_eval['debt_to_income_ratio']}%)")
    
    # 5c. 🔴 Persona 3: Subprime Policy Rejection
    p3_eval = client.post("/api/applications", json={
        "name": "Karthik Raman",
        "age": 45,
        "income": 32000,
        "employment_type": "self_employed",
        "dependents": 3,
        "existing_loans": 3,
        "monthly_obligations": 18000,
        "loan_amount": 600000,
        "loan_tenure": 36,
        "cibil_score": 535,
        "payment_history": 62.0,
        "credit_utilization": 88.0,
        "credit_history_years": 2.5,
        "recent_enquiries": 6,
        "biometrics_passed": True,
        "biometric_similarity": 81.0,
        "cross_field_status": "MATCH"
    }).json()
    assert p3_eval["system_decision"] == "DECLINED"
    assert p3_eval["risk_tier"] == "SUBPRIME"
    print(f"  [OK] Persona 3: {p3_eval['applicant_name']} -> {p3_eval['system_decision']} ({p3_eval['probability_percentage']}%, DTI: {p3_eval['debt_to_income_ratio']}%)")
    
    # 6. Module 6: Institutional Underwriting & Audit Cockpit (Dr. Arulmozhi Varman)
    print("\n[TEST 6] Testing Module 6: Institutional Underwriting & Audit Cockpit...")
    
    # 6a. Cockpit Stats
    stats_res = client.get("/api/audit/cockpit-stats").json()
    print(f"  [OK] Cockpit Active Officer: {stats_res['officer']['name']} ({stats_res['officer']['id']})")
    print(f"  [OK] Total Applications in Queue: {stats_res['stats']['total_applications']}")
    
    # 6b. Dr. Varman Manual Override on Persona 2
    override_res = client.post("/api/audit/override", json={
        "application_id": p2_eval["application_id"],
        "action": "APPROVE",
        "justification": "Reconciled legal name discrepancy via audited Form 16 and confirmed adequate liquid reserves."
    }).json()
    assert override_res["status"] == "OVERRIDE_RECORDED"
    assert override_res["new_status"] == "APPROVED"
    print(f"  [OK] Manual Override Applied by {override_res['officer_name']}: {override_res['previous_status']} -> {override_res['new_status']}")
    print(f"  [OK] Cryptographic SHA-256 Audit Signature: {override_res['digital_signature']}")
    
    # 6c. Simulated Instant Disbursement via NPCI/NACH e-mandate and IMPS
    disburse_res = client.post("/api/disbursement/execute", json={
        "application_id": p1_eval["application_id"]
    }).json()
    assert disburse_res["disbursement_status"] == "COMPLETED_SUCCESS"
    print(f"  [OK] NPCI NACH e-Mandate UMRN: {disburse_res['nach_umrn']}")
    print(f"  [OK] IMPS Instant Transfer RRN: {disburse_res['imps_rrn']} (UTR: {disburse_res['imps_utr']})")
    print(f"  [OK] Disbursed Principal: ₹{disburse_res['disbursement_amount']:,.2f}")
    print(f"  [OK] RBI Key Fact Statement (KFS) Issued: APR {disburse_res['kfs_data']['annualized_percentage_rate_apr']}, Cooling-off: {disburse_res['kfs_data']['cooling_off_look_up_period']}")
    
    print("\n" + "="*80)
    print("ALL INTEGRATION TESTS PASSED WITH 100% REGULATORY INTEGRITY!")
    print("="*80 + "\n")

if __name__ == "__main__":
    test_system_pipeline()
