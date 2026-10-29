from typing import Optional, Dict, Any, List
from pydantic import BaseModel

class CrossFieldCheckItem(BaseModel):
    field_name: str
    aadhaar_value: str
    pan_value: str
    declared_value: str
    is_match: bool
    levenshtein_distance: int
    similarity_percentage: float
    flag_type: str # MATCH, MINOR_DISCREPANCY, CRITICAL_MISMATCH

class CrossFieldConsistencyResponse(BaseModel):
    status: str # MATCH, DISCREPANCY_FLAG, MISMATCH
    overall_similarity: float
    name_similarity: float
    name_levenshtein_distance: int
    fields: List[CrossFieldCheckItem]
    requires_officer_review: bool
    review_reason: Optional[str] = None
    pan_status_verified: bool
    aadhaar_xml_signature_valid: bool

class KYCRecordOut(BaseModel):
    id: str
    aadhaar_masked: str
    pan_number: str
    aadhaar_name: str
    pan_name: str
    declared_name: str
    dob: str
    gender: str
    address: str
    signature_valid: bool
    uidai_cert_cn: str
    xml_sha256_hash: str
    pan_status: str
    name_similarity_score: float
    levenshtein_distance: int
    cross_field_status: str
    aadhaar_xml_raw: Optional[str] = None
