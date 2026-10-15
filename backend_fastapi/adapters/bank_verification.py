"""
Bank Account Verification Adapter (Penny Drop / Account Validation).
Validates account status, masks sensitive numbers, performs name-matching scoring,
and ensures clear distinction between bank verification and loan approval.
"""
import uuid
import re
import difflib
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import httpx
from fastapi import HTTPException, status

from ..config import settings


def mask_account_number(acc_num: str) -> str:
    """Masks all but the last 4 digits of a bank account number."""
    if len(acc_num) <= 4:
        return "XXXX"
    return "X" * (len(acc_num) - 4) + acc_num[-4:]


def calculate_name_similarity(name1: str, name2: str) -> float:
    """Calculates string similarity ratio using SequenceMatcher."""
    n1 = re.sub(r'[^a-zA-Z0-9\s]', '', name1.strip().lower())
    n2 = re.sub(r'[^a-zA-Z0-9\s]', '', name2.strip().lower())
    return round(difflib.SequenceMatcher(None, n1, n2).ratio(), 3)


class IBankVerificationProvider(ABC):
    @abstractmethod
    async def verify_account(
        self,
        application_id: str,
        bank_name: str,
        account_number: str,
        ifsc_code: str,
        account_holder_name: str,
        applicant_name: str,
        consent_given: bool
    ) -> Dict[str, Any]:
        """Performs account validation and name-matching check."""
        pass


class DemoBankVerificationProvider(IBankVerificationProvider):
    """
    Simulated penny-drop verification provider.
    Evaluates real IFSC format and name similarity heuristics.
    """
    def __init__(self):
        self.mode = "demo"

    async def verify_account(
        self,
        application_id: str,
        bank_name: str,
        account_number: str,
        ifsc_code: str,
        account_holder_name: str,
        applicant_name: str,
        consent_given: bool
    ) -> Dict[str, Any]:
        if not consent_given:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Applicant consent is required for bank account verification."
            )

        # Basic IFSC validation (4 alphabetic + 0 + 6 alphanumeric)
        clean_ifsc = ifsc_code.strip().upper()
        if not re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', clean_ifsc):
            return {
                "applicationId": application_id,
                "bankName": bank_name,
                "accountNumberMasked": mask_account_number(account_number),
                "ifscCode": clean_ifsc,
                "accountHolderName": account_holder_name,
                "nameSimilarityScore": 0.0,
                "verificationStatus": "FAILED",
                "verificationReference": None,
                "isDemo": True,
                "message": "Invalid IFSC code format. IFSC must be 11 characters starting with 4 bank letters and fifth digit '0'."
            }

        # Compare account holder name against applicant name
        similarity = calculate_name_similarity(applicant_name, account_holder_name)

        if similarity >= 0.70:
            verif_status = "VERIFIED"
            msg = f"Bank account verified via simulated penny-drop. Name match: {int(similarity * 100)}%."
        elif similarity >= 0.40:
            verif_status = "MANUAL_REVIEW"
            msg = f"Name match ({int(similarity * 100)}%) is borderline between '{applicant_name}' and '{account_holder_name}'. Routed for manual review."
        else:
            verif_status = "FAILED"
            msg = f"Name mismatch detected ({int(similarity * 100)}%). Account holder does not match loan applicant."

        return {
            "applicationId": application_id,
            "bankName": bank_name,
            "accountNumberMasked": mask_account_number(account_number),
            "ifscCode": clean_ifsc,
            "accountHolderName": account_holder_name,
            "nameSimilarityScore": similarity,
            "verificationStatus": verif_status,
            "verificationReference": f"DEMO_PENNY_TXN_{uuid.uuid4().hex[:10].upper()}",
            "isDemo": True,
            "regulatoryBanner": "DEMO BANK VERIFICATION — NO REAL BANK ACCOUNT CHECK PERFORMED",
            "message": msg
        }


class RealBankVerificationProvider(IBankVerificationProvider):
    """
    Production adapter targeting NPCI IMPS penny-drop or Open Banking gateway.
    """
    def __init__(self):
        self.mode = "real"
        self.client_id = settings.BANK_PROVIDER_CLIENT_ID
        self.client_secret = settings.BANK_PROVIDER_CLIENT_SECRET
        self.endpoint = settings.BANK_PROVIDER_ENDPOINT

    def _check_credentials(self):
        if not self.client_id or not self.client_secret or self.client_id == "DEMO_BANK_CLIENT":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Production bank verification credentials are not configured in environment."
            )

    async def verify_account(
        self,
        application_id: str,
        bank_name: str,
        account_number: str,
        ifsc_code: str,
        account_holder_name: str,
        applicant_name: str,
        consent_given: bool
    ) -> Dict[str, Any]:
        self._check_credentials()
        # Dispatches penny-drop request to official gateway
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Production penny-drop gateway requires active merchant credentials."
        )


def get_bank_provider() -> IBankVerificationProvider:
    if settings.BANK_PROVIDER_MODE.lower() == "real":
        return RealBankVerificationProvider()
    return DemoBankVerificationProvider()
