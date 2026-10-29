from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class TriBiometricVerifyRequest(BaseModel):
    application_id: Optional[str] = None
    user_id: Optional[str] = None
    persona_id: Optional[str] = None
    live_webcam_image_b64: Optional[str] = None # Captured webcam snapshot
    liveness_challenge_response: Optional[str] = None # Challenge token/action confirmed
    force_spoof_simulation: Optional[bool] = False

class BiometricPairResult(BaseModel):
    pair_name: str
    similarity_percentage: float
    threshold: float = 75.0
    passed: bool

class TriBiometricVerifyResponse(BaseModel):
    status: str # PASSED, FAILED_MISMATCH, FAILED_SPOOF
    composite_similarity: float
    threshold: float = 75.0
    is_gate_passed: bool
    pairs: Dict[str, BiometricPairResult]
    liveness: Dict[str, Any]
    denial_reason: Optional[str] = None
    aadhaar_photo_b64: Optional[str] = None
    pan_photo_b64: Optional[str] = None
    live_photo_b64: Optional[str] = None
