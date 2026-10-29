import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, Text, Integer
from app.database import Base

class KYCRecord(Base):
    __tablename__ = "kyc_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False, index=True)
    application_id = Column(String(36), nullable=True, index=True)
    
    # Official document identifiers
    aadhaar_masked = Column(String(20), nullable=False) # e.g. "XXXXXXXX4892"
    pan_number = Column(String(20), nullable=False) # e.g. "ABCDE1234F"
    
    # Extracted legal fields
    aadhaar_name = Column(String(150), nullable=False)
    pan_name = Column(String(150), nullable=False)
    declared_name = Column(String(150), nullable=False)
    dob = Column(String(20), nullable=False)
    gender = Column(String(10), nullable=False)
    address = Column(Text, nullable=False)
    
    # Cryptographic Aadhaar XML metadata
    aadhaar_xml_raw = Column(Text, nullable=True)
    signature_valid = Column(Boolean, default=True)
    uidai_cert_cn = Column(String(150), default="DS UNIQUE IDENTIFICATION AUTHORITY OF INDIA 04")
    xml_sha256_hash = Column(String(64), nullable=True)
    
    # ITD PAN Master Verification
    pan_status = Column(String(30), default="OPERATIVE_AADHAAR_LINKED") # OPERATIVE_AADHAAR_LINKED, ACTIVE
    itd_match_status = Column(Boolean, default=True)
    
    # Cross-Field Consistency Metrics
    name_similarity_score = Column(Float, default=100.0) # 0 to 100%
    levenshtein_distance = Column(Integer, default=0)
    dob_match = Column(Boolean, default=True)
    pan_valid_syntax = Column(Boolean, default=True)
    cross_field_status = Column(String(30), default="MATCH") # MATCH, DISCREPANCY_FLAG, MISMATCH
    discrepancy_details = Column(Text, nullable=True)
    
    verified_at = Column(DateTime, default=datetime.utcnow)

class BiometricVerification(Base):
    __tablename__ = "biometric_verifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String(36), nullable=True, index=True)
    user_id = Column(String(36), nullable=False, index=True)
    
    # 3-Way Facial Photos (Base64 or image URI)
    aadhaar_photo = Column(Text, nullable=True) # Image 1: Extracted photo from UIDAI Aadhaar registry
    pan_photo = Column(Text, nullable=True)     # Image 2: Extracted photo from ITD PAN card
    live_webcam_photo = Column(Text, nullable=True) # Image 3: Real-time captured face from webcam
    
    # Pairwise cross-similarity scores (0-100%)
    aadhaar_pan_similarity = Column(Float, nullable=False, default=0.0)
    aadhaar_live_similarity = Column(Float, nullable=False, default=0.0)
    pan_live_similarity = Column(Float, nullable=False, default=0.0)
    composite_similarity = Column(Float, nullable=False, default=0.0)
    
    # Active Liveness Verification
    liveness_challenge_type = Column(String(50), default="BLINK_AND_HEAD_TURN")
    liveness_score = Column(Float, default=98.5)
    liveness_passed = Column(Boolean, default=True)
    spoof_detected = Column(Boolean, default=False)
    
    # Gate outcome (Threshold: >= 75%)
    status = Column(String(30), default="PASSED") # PASSED, FAILED_MISMATCH, FAILED_SPOOF
    status_details = Column(Text, nullable=True)
    evaluated_at = Column(DateTime, default=datetime.utcnow)
