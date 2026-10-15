"""
Configuration management for Loan Eligibility AI - FastAPI Unified Backend.
Loads parameters from environment variables with sensible defaults for local development.
"""
import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent


class Settings(BaseSettings):
    APP_NAME: str = "Loan Assistant - Explainable AI Digital Loan & Disbursement System"
    APP_VERSION: str = "2.0.0"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    PORT: int = int(os.getenv("PORT", "5000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")

    # Persistence: SQLite for zero-config local, PostgreSQL for production
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/loan_eligibility.db")

    # Security & Tokens
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-jwt-key-loan-ai-2026-production-change-me")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440

    # CORS
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173")

    # Fintech Adapter Modes ("demo" or "real")
    DIGILOCKER_MODE: str = os.getenv("DIGILOCKER_MODE", "demo")
    DIGILOCKER_CLIENT_ID: str = os.getenv("DIGILOCKER_CLIENT_ID", "DEMO_DIGILOCKER_ID")
    DIGILOCKER_CLIENT_SECRET: str = os.getenv("DIGILOCKER_CLIENT_SECRET", "DEMO_DIGILOCKER_SECRET")
    DIGILOCKER_REDIRECT_URI: str = os.getenv("DIGILOCKER_REDIRECT_URI", "http://localhost:3000/digilocker/callback")
    DIGILOCKER_BASE_URL: str = os.getenv("DIGILOCKER_BASE_URL", "https://api.apisetu.gov.in")

    FACE_VERIFICATION_MODE: str = os.getenv("FACE_VERIFICATION_MODE", "demo")
    FACE_PROVIDER_API_KEY: str = os.getenv("FACE_PROVIDER_API_KEY", "DEMO_FACE_KEY")
    FACE_PROVIDER_ENDPOINT: str = os.getenv("FACE_PROVIDER_ENDPOINT", "https://api.faceverification.example.com/v1")

    CREDIT_PROVIDER_MODE: str = os.getenv("CREDIT_PROVIDER_MODE", "demo")
    CIBIL_CLIENT_ID: str = os.getenv("CIBIL_CLIENT_ID", "DEMO_CIBIL_CLIENT")
    CIBIL_CLIENT_SECRET: str = os.getenv("CIBIL_CLIENT_SECRET", "DEMO_CIBIL_SECRET")
    CIBIL_ENDPOINT: str = os.getenv("CIBIL_ENDPOINT", "https://api.creditbureau.example.com/v1")

    BANK_PROVIDER_MODE: str = os.getenv("BANK_PROVIDER_MODE", "demo")
    BANK_PROVIDER_CLIENT_ID: str = os.getenv("BANK_PROVIDER_CLIENT_ID", "DEMO_BANK_CLIENT")
    BANK_PROVIDER_CLIENT_SECRET: str = os.getenv("BANK_PROVIDER_CLIENT_SECRET", "DEMO_BANK_SECRET")
    BANK_PROVIDER_ENDPOINT: str = os.getenv("BANK_PROVIDER_ENDPOINT", "https://api.bankverification.example.com/v1")

    DISBURSEMENT_MODE: str = os.getenv("DISBURSEMENT_MODE", "demo")
    DISBURSEMENT_API_KEY: str = os.getenv("DISBURSEMENT_API_KEY", "DEMO_DISBURSEMENT_KEY")
    DISBURSEMENT_ENDPOINT: str = os.getenv("DISBURSEMENT_ENDPOINT", "https://api.lenderorigination.example.com/v1")

    # Document Uploads & Storage
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")

    # ML Assets
    ML_MODEL_PATH: str = str(PROJECT_ROOT / "ml-service" / "models" / "ebm_model.pkl")
    METRICS_PATH: str = str(PROJECT_ROOT / "ml-service" / "models" / "metrics.json")

    class Config:
        case_sensitive = True
        extra = "allow"


settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
