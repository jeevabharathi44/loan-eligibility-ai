from fastapi import APIRouter, Body
from app.schemas.biometrics import TriBiometricVerifyRequest, TriBiometricVerifyResponse
from app.services.biometric_service import generate_liveness_challenge, evaluate_tri_biometric_verification
from app.services.persona_service import get_persona_by_id

router = APIRouter(prefix="/biometrics", tags=["Tri-Biometric Live Facial Verification (Module 2)"])

@router.get("/liveness-challenge")
def get_challenge():
    """
    Returns active randomized liveness challenge (Blink, Turn Head, Smile)
    to prevent 2D photo print attacks.
    """
    return generate_liveness_challenge()

@router.post("/verify-tri-biometric", response_model=TriBiometricVerifyResponse)
def verify_tri_biometric(payload: TriBiometricVerifyRequest):
    """
    Module 2: Real-time 3-way facial comparison pipeline:
    1. Image 1: Aadhaar registry photo (UIDAI)
    2. Image 2: Income Tax Department PAN card photo
    3. Image 3: Real-time captured face from applicant webcam with active liveness detection
    
    Cross-similarity threshold: >= 75.0% required to pass.
    Mismatches automatically trigger immediate security denial.
    """
    persona_id = payload.persona_id
    aadhaar_photo = None
    pan_photo = None
    live_photo = payload.live_webcam_image_b64
    
    if persona_id:
        p = get_persona_by_id(persona_id)
        aadhaar_photo = p["aadhaar_photo"]
        pan_photo = p["pan_photo"]
        if not live_photo:
            live_photo = p["live_photo"]
            
    res = evaluate_tri_biometric_verification(
        aadhaar_photo_b64=aadhaar_photo,
        pan_photo_b64=pan_photo,
        live_webcam_photo_b64=live_photo,
        persona_id=persona_id,
        force_spoof=payload.force_spoof_simulation or False
    )
    return res
