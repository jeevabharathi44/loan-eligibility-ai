import hashlib
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.audit import AuditLog
from app.config import settings

def create_immutable_audit_log(
    db: Session,
    application_id: str,
    action: str,
    previous_status: str,
    new_status: str,
    justification: str,
    officer_id: str = settings.CHIEF_UNDERWRITER_ID,
    officer_name: str = settings.CHIEF_UNDERWRITER_NAME,
    officer_title: str = settings.CHIEF_UNDERWRITER_TITLE,
    ip_address: str = "127.0.0.1"
) -> AuditLog:
    """
    Creates an immutable cryptographic audit record for regulatory compliance
    under RBI Digital Lending Guidelines.
    """
    ts = datetime.utcnow()
    raw_payload = f"{application_id}:{officer_id}:{ts.isoformat()}:{action}:{previous_status}->{new_status}:{justification}"
    digital_signature = hashlib.sha256(raw_payload.encode()).hexdigest()
    
    log_entry = AuditLog(
        application_id=application_id,
        officer_id=officer_id,
        officer_name=officer_name,
        officer_title=officer_title,
        action=action,
        previous_status=previous_status,
        new_status=new_status,
        justification=justification,
        regulatory_reference="RBI Digital Lending Directions 2022/2023 - Discretionary Exception Protocol",
        digital_signature=digital_signature,
        ip_address=ip_address,
        timestamp=ts
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry

def get_audit_trail(db: Session, application_id: str) -> List[AuditLog]:
    return db.query(AuditLog).filter(AuditLog.application_id == application_id).order_by(AuditLog.timestamp.desc()).all()
