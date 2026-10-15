"""
DigiLocker Integration Service Adapter.
Complies with official API Setu and DigiLocker specifications:
- https://api.apisetu.gov.in/
- https://apisetu.gov.in/digilocker

Provides:
1. IDigiLockerProvider (Interface)
2. DemoDigiLockerProvider (Synthetic documents labeled DEMO — NOT OFFICIALLY VERIFIED)
3. RealDigiLockerProvider (API Setu OAuth 2.0 flow conforming to official spec)
"""
import uuid
import json
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import httpx
from fastapi import HTTPException, status

from ..config import settings

logger = logging.getLogger("digilocker_adapter")


class IDigiLockerProvider(ABC):
    @abstractmethod
    def get_authorization_url(self, application_id: str, state: str) -> str:
        """Returns the URL to initiate the authorized DigiLocker consent/OAuth flow."""
        pass

    @abstractmethod
    async def exchange_token(self, code: str, state: str) -> Dict[str, Any]:
        """Exchanges authorization code for an access token."""
        pass

    @abstractmethod
    async def fetch_issued_documents(self, token: str, application_id: str) -> List[Dict[str, Any]]:
        """Retrieves authorized issuer-verified documents."""
        pass


class DemoDigiLockerProvider(IDigiLockerProvider):
    """
    Simulated DigiLocker provider for offline demonstration and testing.
    All outputs are visibly tagged as DEMO — NOT OFFICIALLY VERIFIED.
    """
    def __init__(self):
        self.mode = "demo"

    def get_authorization_url(self, application_id: str, state: str) -> str:
        # Mock consent redirect returning directly to application workflow
        return f"{settings.DIGILOCKER_REDIRECT_URI}?code=demo_auth_code_{uuid.uuid4().hex[:8]}&state={state}&app_id={application_id}&mode=demo"

    async def exchange_token(self, code: str, state: str) -> Dict[str, Any]:
        return {
            "access_token": f"demo_token_{uuid.uuid4().hex}",
            "token_type": "Bearer",
            "expires_in": 3600,
            "scope": "read_documents",
            "is_demo": True
        }

    async def fetch_issued_documents(self, token: str, application_id: str) -> List[Dict[str, Any]]:
        # Returns standard synthetic personal loan documents: Aadhaar and PAN Card
        return [
            {
                "docId": f"DOC-DL-PAN-{uuid.uuid4().hex[:6].upper()}",
                "documentType": "PAN",
                "issuerName": "Income Tax Department, Govt of India",
                "isIssuerAuthenticated": True,
                "verificationStatus": "DEMO_UNVERIFIED",
                "labelTag": "DEMO — NOT OFFICIALLY VERIFIED",
                "fields": {
                    "panNumber": "ABCDE1234F",
                    "fullName": "Karthik Selvam",
                    "dateOfBirth": "1994-05-14",
                    "fatherName": "Selvam Palanisamy",
                    "status": "Active / Validated in NSDL Registry (Simulated)"
                }
            },
            {
                "docId": f"DOC-DL-AADHAAR-{uuid.uuid4().hex[:6].upper()}",
                "documentType": "AADHAAR",
                "issuerName": "Unique Identification Authority of India (UIDAI)",
                "isIssuerAuthenticated": True,
                "verificationStatus": "DEMO_UNVERIFIED",
                "labelTag": "DEMO — NOT OFFICIALLY VERIFIED",
                "fields": {
                    "maskedAadhaar": "XXXXXXXX8912",
                    "fullName": "Karthik Selvam",
                    "dateOfBirth": "1994-05-14",
                    "gender": "MALE",
                    "address": "Plot 12, 4th Main Road, Anna Nagar, Chennai, Tamil Nadu - 600040",
                    "xmlSignature": "VALID_SIMULATED_DIGITAL_SIGNATURE"
                }
            }
        ]


class RealDigiLockerProvider(IDigiLockerProvider):
    """
    Production-grade adapter communicating with official API Setu DigiLocker gateway.
    Never fabricates responses: requires valid DIGILOCKER_CLIENT_ID and DIGILOCKER_CLIENT_SECRET.
    """
    def __init__(self):
        self.mode = "real"
        self.base_url = settings.DIGILOCKER_BASE_URL
        self.client_id = settings.DIGILOCKER_CLIENT_ID
        self.client_secret = settings.DIGILOCKER_CLIENT_SECRET
        self.redirect_uri = settings.DIGILOCKER_REDIRECT_URI

    def _check_credentials(self):
        if not self.client_id or not self.client_secret or self.client_id == "DEMO_DIGILOCKER_ID":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Production DigiLocker credentials are not configured in environment. Please supply DIGILOCKER_CLIENT_ID and DIGILOCKER_CLIENT_SECRET."
            )

    def get_authorization_url(self, application_id: str, state: str) -> str:
        self._check_credentials()
        # Official DigiLocker OAuth consent authorization endpoint
        return (
            f"{self.base_url}/oauth/authorize"
            f"?response_type=code"
            f"&client_id={self.client_id}"
            f"&redirect_uri={self.redirect_uri}"
            f"&state={state}"
            f"&scope=read_issued_documents"
        )

    async def exchange_token(self, code: str, state: str) -> Dict[str, Any]:
        self._check_credentials()
        token_endpoint = f"{self.base_url}/oauth/token"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(
                    token_endpoint,
                    data={
                        "grant_type": "authorization_code",
                        "code": code,
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                        "redirect_uri": self.redirect_uri
                    }
                )
                if response.status_code != 200:
                    logger.error(f"DigiLocker token exchange error: {response.text}")
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"DigiLocker authorization provider returned an error: {response.status_code}"
                    )
                return response.json()
            except httpx.RequestError as exc:
                logger.error(f"DigiLocker network exception: {str(exc)}")
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail="DigiLocker provider gateway timed out. Please retry or choose manual upload."
                )

    async def fetch_issued_documents(self, token: str, application_id: str) -> List[Dict[str, Any]]:
        self._check_credentials()
        docs_endpoint = f"{self.base_url}/public/oauth2/1/issueddocuments"
        async with httpx.AsyncClient(timeout=12.0) as client:
            try:
                response = await client.get(
                    docs_endpoint,
                    headers={"Authorization": f"Bearer {token}"}
                )
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail="Failed to retrieve issued documents from DigiLocker API Setu."
                    )
                raw_docs = response.json().get("items", [])
                parsed_docs = []
                for item in raw_docs:
                    parsed_docs.append({
                        "docId": item.get("uri", str(uuid.uuid4())),
                        "documentType": item.get("doctype", "UNKNOWN"),
                        "issuerName": item.get("issuer", "Government Issuer"),
                        "isIssuerAuthenticated": True,
                        "verificationStatus": "ISSUER_VERIFIED",
                        "labelTag": "OFFICIALLY ISSUER VERIFIED",
                        "fields": item.get("parameters", {})
                    })
                return parsed_docs
            except httpx.RequestError as exc:
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail="DigiLocker provider failed to return documents within timeout window."
                )


def get_digilocker_provider() -> IDigiLockerProvider:
    """Factory selecting provider based on configured environment mode."""
    if settings.DIGILOCKER_MODE.lower() == "real":
        return RealDigiLockerProvider()
    return DemoDigiLockerProvider()
