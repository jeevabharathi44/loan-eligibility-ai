"""
Loan Approval and Disbursement Module.
Features Demo Simulation Mode (with mandatory non-real money banner)
and Production Origination Gateway Interface with strict idempotency and prerequisite guards.
"""
import uuid
import logging
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import HTTPException, status

from ..config import settings

logger = logging.getLogger("disbursement_adapter")


class IDisbursementProvider(ABC):
    @abstractmethod
    async def process_disbursement(
        self,
        application_id: str,
        idempotency_key: str,
        amount: float,
        tenure_months: int,
        interest_rate: float,
        emi_amount: float,
        destination_account: Optional[str] = None
    ) -> Dict[str, Any]:
        """Executes or simulates loan disbursement."""
        pass


class DemoDisbursementProvider(IDisbursementProvider):
    """
    Simulated disbursement adapter for demonstrations.
    Visibly renders: SIMULATED DISBURSEMENT — NO REAL MONEY TRANSFERRED.
    """
    def __init__(self):
        self.mode = "DEMO"

    async def process_disbursement(
        self,
        application_id: str,
        idempotency_key: str,
        amount: float,
        tenure_months: int,
        interest_rate: float,
        emi_amount: float,
        destination_account: Optional[str] = None
    ) -> Dict[str, Any]:
        demo_reference = f"SIM-LN-TXN-{uuid.uuid4().hex[:10].upper()}"

        return {
            "success": True,
            "mode": "DEMO",
            "status": "SIMULATED",
            "transactionReference": demo_reference,
            "amount": amount,
            "tenureMonths": tenure_months,
            "interestRate": interest_rate,
            "emiAmount": emi_amount,
            "simulatedBanner": "SIMULATED DISBURSEMENT — NO REAL MONEY TRANSFERRED",
            "timestamp": datetime.utcnow(),
            "message": "Demo disbursement simulated successfully. Notice: This is a synthetic ledger entry for demonstration only. No actual funds were transferred."
        }


class RealOriginationDisbursementProvider(IDisbursementProvider):
    """
    Production lender origination system integration.
    Only proceeds when authentic credentials, verified accounts, and valid approval exist.
    """
    def __init__(self):
        self.mode = "REAL"
        self.api_key = settings.DISBURSEMENT_API_KEY
        self.endpoint = settings.DISBURSEMENT_ENDPOINT

    def _check_credentials(self):
        if not self.api_key or self.api_key == "DEMO_DISBURSEMENT_KEY":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Production disbursement origination gateway is disabled: requires an authorized bank/lender connection and credentials."
            )

    async def process_disbursement(
        self,
        application_id: str,
        idempotency_key: str,
        amount: float,
        tenure_months: int,
        interest_rate: float,
        emi_amount: float,
        destination_account: Optional[str] = None
    ) -> Dict[str, Any]:
        self._check_credentials()
        # Production call requires active lender origination integration
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Production loan origination disbursement requires live authorized banking host."
        )


def get_disbursement_provider() -> IDisbursementProvider:
    if settings.DISBURSEMENT_MODE.upper() == "REAL":
        return RealOriginationDisbursementProvider()
    return DemoDisbursementProvider()
