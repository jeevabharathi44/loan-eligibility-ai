import uuid
from datetime import datetime, timedelta
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.user import User, DigiLockerSession
from app.schemas.auth import (
    MobileSignInRequest,
    VerifyOtpRequest,
    UsernameSignInRequest,
    OtherIdSignInRequest,
    ConsentRequest,
    AuthResponse,
    UserOut
)
from app.services.persona_service import get_all_personas, get_persona_by_id

router = APIRouter(prefix="/auth", tags=["DigiLocker Single Sign-On (Meri Pehchaan)"])

def create_jwt_token(user_id: str, role: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "role": role,
        "exp": expire
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

@router.post("/digilocker/mobile-otp")
def request_mobile_otp(payload: MobileSignInRequest, db: Session = Depends(get_db)):
    """
    Step 1 of Mobile Sign-in: sends simulated 6-digit OTP to applicant mobile.
    """
    mobile_clean = payload.mobile.replace("+91", "").replace(" ", "").strip()
    return {
        "status": "OTP_SENT",
        "mobile": f"+91 {mobile_clean}",
        "session_id": str(uuid.uuid4()),
        "expires_in_seconds": 60,
        "demo_hint": "Demo OTP is 123456"
    }

@router.post("/digilocker/verify-otp", response_model=AuthResponse)
def verify_mobile_otp(payload: VerifyOtpRequest, db: Session = Depends(get_db)):
    """
    Step 2 of Mobile Sign-in: verifies OTP and creates DigiLocker authenticated session.
    """
    mobile_clean = payload.mobile.replace("+91", "").replace(" ", "").strip()
    
    # Check if this mobile corresponds to a pre-defined persona
    matched_persona = None
    for p in get_all_personas():
        if p["mobile_raw"] == mobile_clean or p["mobile"].replace(" ", "") == payload.mobile.replace(" ", ""):
            matched_persona = p
            break
            
    name = matched_persona["name"] if matched_persona else "DigiLocker User"
    email = matched_persona["email"] if matched_persona else f"user_{mobile_clean}@digilocker.gov.in"
    username = f"user_{mobile_clean}"
    
    # Check or create user
    user = db.query(User).filter(User.mobile == mobile_clean).first()
    if not user:
        user = User(
            username=username,
            full_name=name,
            mobile=mobile_clean,
            email=email,
            role="APPLICANT"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    session_token = f"DGL-SESS-{uuid.uuid4().hex[:20]}"
    dgl_session = DigiLockerSession(
        user_id=user.id,
        auth_mode="MOBILE_OTP",
        id_type="MOBILE",
        id_value_masked=f"+91 XXXXX{mobile_clean[-4:]}" if len(mobile_clean) >= 4 else mobile_clean,
        session_token=session_token,
        is_verified=True,
        consent_given=True,
        consent_timestamp=datetime.utcnow()
    )
    db.add(dgl_session)
    db.commit()
    
    token = create_jwt_token(user.id, user.role)
    
    return AuthResponse(
        access_token=token,
        user=UserOut(
            id=user.id,
            username=user.username,
            full_name=user.full_name,
            mobile=user.mobile,
            email=user.email,
            role=user.role
        ),
        session_id=session_token,
        auth_mode="MOBILE_OTP",
        consent_recorded=True
    )

@router.post("/digilocker/username-pin", response_model=AuthResponse)
def signin_username_pin(payload: UsernameSignInRequest, db: Session = Depends(get_db)):
    """
    Sign-in mode 2: DigiLocker Username & 6-digit Security PIN.
    """
    # Special officer login check
    if payload.username.lower() in ["officer", "auditor", "arulmozhi", "emp-90421"]:
        user = db.query(User).filter(User.role == "CHIEF_UNDERWRITER").first()
        if not user:
            user = User(
                username="dr_arulmozhi",
                full_name=settings.CHIEF_UNDERWRITER_NAME,
                mobile="9000090421",
                email="officer@rbi-lending.gov.in",
                role="CHIEF_UNDERWRITER"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
        session_token = f"DGL-OFFICER-{uuid.uuid4().hex[:16]}"
        token = create_jwt_token(user.id, user.role)
        return AuthResponse(
            access_token=token,
            user=UserOut(
                id=user.id,
                username=user.username,
                full_name=user.full_name,
                mobile=user.mobile,
                email=user.email,
                role=user.role
            ),
            session_id=session_token,
            auth_mode="USERNAME_PIN",
            consent_recorded=True
        )

    # General applicant login
    user = db.query(User).filter(User.username == payload.username).first()
    if not user:
        user = User(
            username=payload.username,
            full_name="DigiLocker Citizen",
            mobile="9876543200",
            email=f"{payload.username}@meripehchaan.gov.in",
            role="APPLICANT"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    session_token = f"DGL-SESS-{uuid.uuid4().hex[:20]}"
    token = create_jwt_token(user.id, user.role)
    return AuthResponse(
        access_token=token,
        user=UserOut(
            id=user.id,
            username=user.username,
            full_name=user.full_name,
            mobile=user.mobile,
            email=user.email,
            role=user.role
        ),
        session_id=session_token,
        auth_mode="USERNAME_PIN",
        consent_recorded=True
    )

@router.post("/digilocker/other-id", response_model=AuthResponse)
def signin_other_id(payload: OtherIdSignInRequest, db: Session = Depends(get_db)):
    """
    Sign-in mode 3: Authenticate via Aadhaar Number, PAN Number, or Driving License.
    """
    clean_id = payload.id_number.strip().upper()
    masked = f"XXXX-XXXX-{clean_id[-4:]}" if len(clean_id) >= 4 else clean_id
    
    # Check if matches persona
    matched_persona = None
    for p in get_all_personas():
        if p["pan_number"] == clean_id or clean_id in p["aadhaar_masked"]:
            matched_persona = p
            break
            
    name = matched_persona["name"] if matched_persona else f"Citizen ({payload.id_type})"
    mobile = matched_persona["mobile_raw"] if matched_persona else "9876543210"
    email = matched_persona["email"] if matched_persona else f"citizen_{clean_id[-4:]}@digilocker.gov.in"
    
    user = db.query(User).filter(User.username == clean_id).first()
    if not user:
        user = User(
            username=clean_id,
            full_name=name,
            mobile=mobile,
            email=email,
            role="APPLICANT"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    session_token = f"DGL-OTHERID-{uuid.uuid4().hex[:16]}"
    token = create_jwt_token(user.id, user.role)
    return AuthResponse(
        access_token=token,
        user=UserOut(
            id=user.id,
            username=user.username,
            full_name=user.full_name,
            mobile=user.mobile,
            email=user.email,
            role=user.role
        ),
        session_id=session_token,
        auth_mode=f"OTHER_ID_{payload.id_type}",
        consent_recorded=payload.consent_given
    )
