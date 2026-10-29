import os
import base64
from typing import Dict, Any, List

def load_real_photo_b64(filename: str, fallback_initials: str = "JM", fallback_color: str = "#0284c7", is_grayscale: bool = False) -> str:
    """Loads actual biometric face crops extracted from official identity documents."""
    fpath = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "faces", filename)
    if os.path.exists(fpath):
        with open(fpath, "rb") as fp:
            return "data:image/jpeg;base64," + base64.b64encode(fp.read()).decode("utf-8")
    return create_persona_avatar_svg(fallback_initials, fallback_color, is_grayscale)

def create_persona_avatar_svg(initials: str, bg_color: str, is_grayscale: bool = False) -> str:
    """
    Creates high-definition SVG data URI representing photo badges for
    Aadhaar registry, PAN card, and live webcam feed.
    """
    filter_attr = 'filter="grayscale(100%)"' if is_grayscale else ""
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="grad_{initials}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{bg_color}" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="16" fill="url(#grad_{initials})" {filter_attr}/>
  <circle cx="100" cy="80" r="42" fill="#e2e8f0" opacity="0.9" {filter_attr}/>
  <path d="M 40 180 C 40 135, 70 125, 100 125 C 130 125, 160 135, 160 180 Z" fill="#cbd5e1" opacity="0.85" {filter_attr}/>
  <text x="100" y="88" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#1e293b" text-anchor="middle">{initials}</text>
</svg>"""
    import base64
    b64 = base64.b64encode(svg.encode("utf-8")).decode("utf-8")
    return f"data:image/svg+xml;base64,{b64}"

PERSONAS: Dict[str, Dict[str, Any]] = {
    "jeeva_bharathi": {
        "id": "jeeva_bharathi",
        "tag": "Prime Tier (Instant Approval)",
        "badge_color": "green",
        "name": "Jeeva Bharathi M",
        "pan_name": "JEEVA BHARATHI M",
        "aadhaar_name": "Jeeva Bharathi M",
        "father_name": "MAHALINGAM",
        "mobile": "+91 98765 43210",
        "mobile_raw": "9876543210",
        "email": "jeeva.bharathi@fintech.gov.in",
        "dob": "2006-02-25",
        "gender": "M",
        "pan_number": "DELPJ9476P",
        "aadhaar_masked": "XXXX-XXXX-2450",
        "aadhaar_raw": "2235 1313 2450",
        "aadhaar_vid": "9184 5431 5321 6352",
        "address": "No. 42, Anna Salai, Guindy Industrial Estate, Chennai, Tamil Nadu - 600025",
        
        # Financial Profile
        "age": 20,
        "employment_type": "salaried",
        "income": 95000,
        "dependents": 1,
        "existing_loans": 1,
        "monthly_obligations": 8000,
        "loan_amount": 500000, # ₹5 Lakhs
        "loan_tenure": 36,
        "loan_purpose": "personal",
        
        # Bureau metrics
        "cibil_score": 785,
        "payment_history": 98.5,
        "credit_utilization": 18.0,
        "credit_history_years": 4.0,
        "recent_enquiries": 1,
        
        # Target expectations
        "expected_decision": "APPROVED",
        "expected_dti": "25.5%",
        "expected_probability": "94.2%",
        "story": "Senior AI & Full-Stack Engineer with verified Government e-KYC (Aadhaar 2235 1313 2450, PAN DELPJ9476P) and 98.6% tri-biometric face match.",
        
        # Biometrics (Real photos extracted from Government documents)
        "aadhaar_photo": load_real_photo_b64("jeeva_bharathi_aadhaar.jpg", "JM", "#0284c7", is_grayscale=True),
        "pan_photo": load_real_photo_b64("jeeva_bharathi_pan.jpg", "JM", "#0369a1"),
        "live_photo": load_real_photo_b64("jeeva_bharathi_pan.jpg", "JM", "#0ea5e9"),
        "biometric_similarity": 98.6,
        "name_similarity": 100.0,
        "cross_field_status": "MATCH"
    },
    
    "jeeva_b": {
        "id": "jeeva_b",
        "tag": "Near-Prime / Risk Advisory (Underwriter Review)",
        "badge_color": "amber",
        "name": "Jeeva B",
        "pan_name": "JEEVA B",
        "aadhaar_name": "Jeeva Bharathi M",
        "father_name": "MAHALINGAM",
        "mobile": "+91 98765 43211",
        "mobile_raw": "9876543211",
        "email": "jeeva.consulting@enterprise.in",
        "dob": "2006-02-25",
        "gender": "M",
        "pan_number": "DELPJ9476P",
        "aadhaar_masked": "XXXX-XXXX-2450",
        "aadhaar_raw": "2235 1313 2450",
        "aadhaar_vid": "9184 5431 5321 6352",
        "address": "Flat 3B, Tech Park View, Thoraipakkam, OMR, Chennai, Tamil Nadu - 600096",
        
        # Financial Profile
        "age": 20,
        "employment_type": "self_employed",
        "income": 65000,
        "dependents": 2,
        "existing_loans": 2,
        "monthly_obligations": 14000,
        "loan_amount": 500000, # ₹5 Lakhs
        "loan_tenure": 36,
        "loan_purpose": "business",
        
        # Bureau metrics
        "cibil_score": 662,
        "payment_history": 88.0,
        "credit_utilization": 46.0,
        "credit_history_years": 3.0,
        "recent_enquiries": 3,
        
        # Target expectations
        "expected_decision": "NEEDS_REVIEW",
        "expected_dti": "46.5%",
        "expected_probability": "56.4%",
        "story": "Self-employed developer. Authentic biometrics (Aadhaar & PAN DELPJ9476P match), but minor name abbreviation discrepancy (Jeeva B vs Jeeva Bharathi M) triggering underwriter exception review.",
        
        # Biometrics (Real photos extracted from Government documents)
        "aadhaar_photo": load_real_photo_b64("jeeva_bharathi_aadhaar.jpg", "JM", "#0284c7", is_grayscale=True),
        "pan_photo": load_real_photo_b64("jeeva_bharathi_pan.jpg", "JB", "#b45309"),
        "live_photo": load_real_photo_b64("jeeva_bharathi_pan.jpg", "JB", "#f59e0b"),
        "biometric_similarity": 98.6,
        "name_similarity": 43.8, # Levenshtein disparity!
        "cross_field_status": "DISCREPANCY_FLAG"
    },
    
    "karthik_raman": {
        "id": "karthik_raman",
        "tag": "Subprime / Adverse Risk (Policy Rejection)",
        "badge_color": "rose",
        "name": "Karthik Raman",
        "pan_name": "Karthik Raman",
        "aadhaar_name": "Karthik Raman",
        "mobile": "+91 98765 43212",
        "mobile_raw": "9876543212",
        "email": "karthik.raman@mail.local",
        "dob": "1988-11-20",
        "gender": "M",
        "pan_number": "BQWPR9876K",
        "aadhaar_masked": "XXXXXXXX9134",
        "address": "Door 12, West Cross Street, Madurai, Tamil Nadu - 625001",
        
        # Financial Profile
        "age": 45,
        "employment_type": "self_employed",
        "income": 32000,
        "dependents": 3,
        "existing_loans": 3,
        "monthly_obligations": 18000,
        "loan_amount": 600000, # ₹6 Lakhs
        "loan_tenure": 36,
        "loan_purpose": "personal",
        
        # Bureau metrics
        "cibil_score": 535,
        "payment_history": 62.0,
        "credit_utilization": 88.0,
        "credit_history_years": 2.5,
        "recent_enquiries": 6,
        
        # Target expectations
        "expected_decision": "DECLINED",
        "expected_dti": "117.2%",
        "expected_probability": "12.8%",
        "story": "Over-leveraged subprime profile with DTI > 100%, frequent recent enquiries, and CIBIL < 580 triggering automated policy rejection.",
        
        # Biometrics
        "aadhaar_photo": create_persona_avatar_svg("KR", "#e11d48", is_grayscale=True),
        "pan_photo": create_persona_avatar_svg("KR", "#be123c"),
        "live_photo": create_persona_avatar_svg("KR", "#f43f5e"),
        "biometric_similarity": 81.0,
        "name_similarity": 100.0,
        "cross_field_status": "MATCH"
    }
}

def get_all_personas() -> List[Dict[str, Any]]:
    return [get_persona_by_id(pid) for pid in PERSONAS.keys()]

def get_persona_by_id(persona_id: str) -> Dict[str, Any]:
    if persona_id not in PERSONAS:
        persona_id = "jeeva_bharathi"
    p = dict(PERSONAS[persona_id])
    if persona_id in ["jeeva_bharathi", "jeeva_b"]:
        p["aadhaar_photo"] = load_real_photo_b64("jeeva_bharathi_aadhaar.jpg", "JM", "#0284c7")
        p["pan_photo"] = load_real_photo_b64("jeeva_bharathi_pan.jpg", "JM", "#0369a1")
        p["live_photo"] = load_real_photo_b64("jeeva_bharathi_pan.jpg", "JM", "#0ea5e9")
    return p
