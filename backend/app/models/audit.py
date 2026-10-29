import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, JSON
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String(36), nullable=False, index=True)
    
    officer_id = Column(String(50), nullable=False, default="EMP-90421")
    officer_name = Column(String(100), nullable=False, default="Dr. Arulmozhi Varman")
    officer_title = Column(String(100), nullable=False, default="Chief Underwriting Officer & Risk Auditor")
    
    action = Column(String(50), nullable=False) # SYSTEM_GATE_EVALUATED, MANUAL_OVERRIDE_APPROVE, MANUAL_OVERRIDE_REJECT, DOCS_REQUESTED, DISBURSEMENT_AUTHORIZED
    previous_status = Column(String(30), nullable=False)
    new_status = Column(String(30), nullable=False)
    
    justification = Column(Text, nullable=False)
    regulatory_reference = Column(String(150), default="RBI Digital Lending Guidelines (DLG) - Fair Lending & Discretionary Override Rule 6.2")
    digital_signature = Column(String(128), nullable=False) # Cryptographic signature hash
    ip_address = Column(String(45), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.utcnow)

class DisbursementRecord(Base):
    __tablename__ = "disbursement_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String(36), unique=True, index=True, nullable=False)
    
    # NPCI / NACH e-Mandate
    nach_umrn = Column(String(50), unique=True, nullable=False) # e.g. UMRN-2026-NACH-XXXXX
    bank_name = Column(String(100), nullable=False, default="State Bank of India")
    bank_account_masked = Column(String(30), nullable=False) # e.g. "XXXXXXXX7890"
    ifsc_code = Column(String(20), nullable=False) # e.g. "SBIN0001234"
    mandate_amount_limit = Column(Float, nullable=False)
    mandate_status = Column(String(30), default="ACTIVE_REGISTERED")
    
    # IMPS Instant Disbursement
    imps_rrn = Column(String(30), unique=True, nullable=False) # 12-digit Retrieval Reference Number
    imps_utr = Column(String(30), unique=True, nullable=False) # Bank Unique Transaction Reference
    disbursement_amount = Column(Float, nullable=False) # INR
    disbursement_status = Column(String(30), default="COMPLETED_SUCCESS")
    disbursed_at = Column(DateTime, default=datetime.utcnow)
    
    # RBI Key Fact Statement (KFS)
    kfs_data = Column(JSON, nullable=True) # Full regulatory disclosure JSON
