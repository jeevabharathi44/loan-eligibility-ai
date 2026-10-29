from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field

class OverrideRequest(BaseModel):
    application_id: str
    action: str = Field(..., description="APPROVE, REJECT, or REQUEST_DOCUMENTS")
    justification: str = Field(..., min_length=10, description="Mandatory detailed reason for underwriter override")
    officer_id: str = "EMP-90421"
    officer_name: str = "Dr. Arulmozhi Varman"
    officer_pin: str = "90421"

class AuditLogOut(BaseModel):
    id: str
    application_id: str
    officer_id: str
    officer_name: str
    officer_title: str
    action: str
    previous_status: str
    new_status: str
    justification: str
    regulatory_reference: str
    digital_signature: str
    timestamp: datetime

class DisburseRequest(BaseModel):
    application_id: str
    bank_name: str = "State Bank of India"
    bank_account_number: str = "392019485721"
    ifsc_code: str = "SBIN0001234"

class DisbursementOut(BaseModel):
    application_id: str
    nach_umrn: str
    bank_name: str
    bank_account_masked: str
    ifsc_code: str
    mandate_amount_limit: float
    mandate_status: str
    imps_rrn: str
    imps_utr: str
    disbursement_amount: float
    disbursement_status: str
    disbursed_at: datetime
    kfs_data: Dict[str, Any]
