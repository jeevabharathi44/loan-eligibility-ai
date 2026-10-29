import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Explainable AI (XAI) Digital Personal Loan Processing System"
    APP_VERSION: str = "2.0.0"
    API_PREFIX: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "xai-digital-lending-secret-key-rbi-compliant-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./loan_xai.db")
    CORS_ORIGINS: list[str] = ["*"]
    
    BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))
    MODELS_DIR: str = os.path.join(BASE_DIR, "models_storage")
    EBM_MODEL_PATH: str = os.path.join(MODELS_DIR, "ebm_model.pkl")
    METRICS_PATH: str = os.path.join(MODELS_DIR, "metrics.json")
    
    # Biometric verification threshold (RBI benchmark: >= 75%)
    BIOMETRIC_PASS_THRESHOLD: float = 75.0
    
    # Underwriter Auditor Credentials
    CHIEF_UNDERWRITER_ID: str = "EMP-90421"
    CHIEF_UNDERWRITER_NAME: str = "Dr. Arulmozhi Varman"
    CHIEF_UNDERWRITER_TITLE: str = "Chief Underwriting Officer & Risk Auditor"

settings = Settings()
