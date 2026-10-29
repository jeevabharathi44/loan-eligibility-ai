import uuid
import hashlib
from datetime import datetime
from typing import Dict, Any, Optional

def generate_aadhaar_cryptographic_xml(
    uid_masked: str,
    name: str,
    dob: str,
    gender: str,
    address: str,
    phone_hash: str
) -> Dict[str, Any]:
    """
    Generates simulated official UIDAI signed XML structure complying with
    e-KYC 2.1 specifications (SHA-256 digital signature, X509 certificate).
    """
    txn_id = f"UKC:{uuid.uuid4().hex[:16].upper()}"
    timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S")
    
    xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<KycRes ts="{timestamp}" txn="{txn_id}" ret="Y" code="1">
  <Rar>U2FsdGVkX1+...[UIDAI Encrypted Biometric Token]...</Rar>
  <UidData>
    <Poi dob="{dob}" e="" g="{gender}" m="" n="{name}" pht="" />
    <Poa co="S/O Mahalingam" country="India" dist="Chennai" loc="Guindy" pc="600025" state="Tamil Nadu" street="Anna Salai" vt="Chennai" />
    <Pht hash="{hashlib.sha256(name.encode()).hexdigest()[:32]}">[Cryptographic UIDAI Photo Vector]</Pht>
  </UidData>
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>
      <CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#" />
      <SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256" />
      <Reference URI="">
        <DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256" />
        <DigestValue>{hashlib.sha256(xml_content_base := f"{txn_id}:{uid_masked}:{name}".encode()).hexdigest()[:28]}=</DigestValue>
      </Reference>
    </SignedInfo>
    <SignatureValue>{hashlib.sha256(f"SIG:{txn_id}:{name}".encode()).hexdigest()[:64]}</SignatureValue>
    <KeyInfo>
      <X509Data>
        <X509SubjectName>C=IN, O=UIDAI, OU=UIDAI TECH CENTER BENGALURU, CN=DS UNIQUE IDENTIFICATION AUTHORITY OF INDIA 04</X509SubjectName>
        <X509Certificate>MIIF3DCCBMSgAwIBAgIQN2...[UIDAI Root Authority CA]...</X509Certificate>
      </X509Data>
    </KeyInfo>
  </Signature>
</KycRes>"""

    return {
        "txn_id": txn_id,
        "timestamp": timestamp,
        "xml_raw": xml_content,
        "sha256_hash": hashlib.sha256(xml_content.encode()).hexdigest(),
        "cert_cn": "DS UNIQUE IDENTIFICATION AUTHORITY OF INDIA 04",
        "is_signature_valid": True,
        "demographics": {
            "uid_masked": uid_masked,
            "name": name,
            "dob": dob,
            "gender": gender,
            "address": address
        }
    }

def get_itd_pan_master_record(pan: str, legal_name: str, dob: str) -> Dict[str, Any]:
    """
    Simulates real-time verification against Income Tax Department (ITD) PAN master database.
    """
    return {
        "pan": pan.upper(),
        "name_on_card": legal_name,
        "dob": dob,
        "pan_status": "OPERATIVE_AADHAAR_LINKED",
        "taxpayer_category": "INDIVIDUAL",
        "itd_match_status": True,
        "ao_code": "CHE/W/12/3",
        "last_updated": "2026-03-31T00:00:00Z"
    }
