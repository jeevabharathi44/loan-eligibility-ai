from typing import Optional
from pydantic import BaseModel, Field

class MobileSignInRequest(BaseModel):
    mobile: str = Field(..., description="10-digit Indian Mobile number")
    auth_mode: str = "MOBILE_OTP"

class VerifyOtpRequest(BaseModel):
    mobile: str
    otp: str = Field(..., min_length=4, max_length=6)

class UsernameSignInRequest(BaseModel):
    username: str
    pin: str = Field(..., min_length=4, max_length=6)

class OtherIdSignInRequest(BaseModel):
    id_type: str = Field(..., description="AADHAAR, PAN, or DRIVING_LICENSE")
    id_number: str
    consent_given: bool = True

class ConsentRequest(BaseModel):
    session_token: str
    consent: bool = True

class UserOut(BaseModel):
    id: str
    username: str
    full_name: str
    mobile: str
    email: Optional[str] = None
    role: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
    session_id: str
    auth_mode: str
    consent_recorded: bool
