import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    mobile = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=True)
    role = Column(String(30), default="APPLICANT") # APPLICANT, CHIEF_UNDERWRITER
    hashed_pin = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DigiLockerSession(Base):
    __tablename__ = "digilocker_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False, index=True)
    auth_mode = Column(String(30), nullable=False) # MOBILE_OTP, USERNAME_PIN, OTHER_ID
    id_type = Column(String(30), nullable=True) # AADHAAR, PAN, DRIVING_LICENSE
    id_value_masked = Column(String(50), nullable=True)
    session_token = Column(String(255), unique=True, index=True, nullable=False)
    is_verified = Column(Boolean, default=False)
    consent_given = Column(Boolean, default=False)
    consent_timestamp = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
