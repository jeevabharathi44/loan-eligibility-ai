"""
SQLAlchemy ORM models for Loan Eligibility AI Digital Processing System.
Implements complete entity relationships for authentication, application lifecycle,
consents, fintech verification adapters, ML predictions, reviewer overrides, and disbursements.
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from .database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    # Role: "APPLICANT", "REVIEWER", "ADMIN"
    role = Column(String(20), default="APPLICANT", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    applications = relationship("LoanApplication", back_populates="user", cascade="all, delete-orphan")
    consents = relationship("ApplicantConsent", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class LoanProduct(Base):
    __tablename__ = "loan_products"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    min_amount = Column(Float, default=10000.0)
    max_amount = Column(Float, default=5000000.0)
    min_tenure = Column(Integer, default=6)
    max_tenure = Column(Integer, default=60)
    base_interest_rate = Column(Float, default=10.5)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_code = Column(String(50), default="PERSONAL_EXPRESS")
    
    # Financial profile
    income = Column(Float, nullable=False)
    employment_type = Column(String(50), nullable=False)  # salaried, self_employed, not_employed
    age = Column(Integer, nullable=False)
    dependents = Column(Integer, default=0)
    loan_amount = Column(Float, nullable=False)
    loan_tenure = Column(Integer, nullable=False)  # in months
    loan_purpose = Column(String(50), default="personal")
    existing_loans = Column(Integer, default=0)
    monthly_obligations = Column(Float, default=0.0)

    # 11-Stage Instant Decision State Machine Status
    # DRAFT -> SUBMITTED -> DOCUMENTS_PENDING -> IDENTITY_CHECK_PENDING ->
    # CREDIT_CHECK_PENDING -> BANK_VERIFICATION_PENDING -> AI_ASSESSMENT_COMPLETE ->
    # PRELIMINARY_ELIGIBLE / REVIEW_REQUIRED / DECLINED -> APPROVED -> DISBURSEMENT_PENDING -> DISBURSED
    status = Column(String(50), default="DRAFT", nullable=False)
    stage = Column(String(50), default="DRAFT", nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="applications")
    consents = relationship("ApplicantConsent", back_populates="application", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="application", cascade="all, delete-orphan")
    digilocker_records = relationship("DigiLockerRecord", back_populates="application", cascade="all, delete-orphan")
    face_sessions = relationship("FaceVerificationSession", back_populates="application", cascade="all, delete-orphan")
    credit_checks = relationship("CreditCheck", back_populates="application", cascade="all, delete-orphan")
    bank_accounts = relationship("BankAccount", back_populates="application", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="application", cascade="all, delete-orphan")
    review_decisions = relationship("ReviewDecision", back_populates="application", cascade="all, delete-orphan")
    disbursements = relationship("DisbursementRecord", back_populates="application", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="application")


class ApplicantConsent(Base):
    __tablename__ = "applicant_consents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("loan_applications.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    purpose = Column(String(100), nullable=False)  # "DIGILOCKER_FETCH", "FACE_LIVENESS", "CIBIL_PULL", "BANK_VERIFY"
    consent_text = Column(Text, nullable=False)
    ip_address = Column(String(50), default="127.0.0.1")
    user_agent = Column(String(255), default="System Client")
    is_revoked = Column(Boolean, default=False)
    granted_at = Column(DateTime, default=datetime.utcnow)
    revoked_at = Column(DateTime, nullable=True)

    application = relationship("LoanApplication", back_populates="consents")
    user = relationship("User", back_populates="consents")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("loan_applications.id", ondelete="CASCADE"), nullable=False)
    doc_type = Column(String(50), nullable=False)  # "PAN", "AADHAAR", "SALARY_SLIP", "BANK_STATEMENT"
    source = Column(String(50), default="USER_UPLOAD")  # "DIGILOCKER", "USER_UPLOAD"
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=True)
    mime_type = Column(String(100), default="application/pdf")
    # Status: "ISSUER_VERIFIED", "USER_UPLOADED_PENDING_REVIEW", "OCR_EXTRACTED", "REJECTED"
    verification_status = Column(String(50), default="USER_UPLOADED_PENDING_REVIEW")
    is_demo_synthetic = Column(Boolean, default=False)
    ocr_data = Column(Text, nullable=True)  # JSON string of extracted key-value pairs
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("LoanApplication", back_populates="documents")


class DigiLockerRecord(Base):
    __tablename__ = "digilocker_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("loan_applications.id", ondelete="CASCADE"), nullable=False)
    provider_mode = Column(String(20), default="DEMO")  # "DEMO", "REAL"
    request_id = Column(String(100), nullable=False)
    issuer_name = Column(String(150), nullable=False)  # "Income Tax Department", "UIDAI"
    doc_id = Column(String(100), nullable=False)
    document_type = Column(String(50), nullable=False)
    is_issuer_authenticated = Column(Boolean, default=True)
    verification_status = Column(String(50), default="DEMO_UNVERIFIED")  # "ISSUER_VERIFIED", "DEMO_UNVERIFIED"
    raw_metadata = Column(Text, nullable=True)  # JSON string
    timestamp = Column(DateTime, default=datetime.utcnow)

    application = relationship("LoanApplication", back_populates="digilocker_records")


class FaceVerificationSession(Base):
    __tablename__ = "face_verification_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("loan_applications.id", ondelete="CASCADE"), nullable=False)
    provider_mode = Column(String(20), default="DEMO")  # "DEMO", "REAL"
    session_token = Column(String(100), nullable=False)
    liveness_score = Column(Float, default=0.0)
    face_match_score = Column(Float, default=0.0)
    # Status: "PASSED", "FAILED", "INCONCLUSIVE", "MANUAL_REVIEW_REQUIRED"
    status = Column(String(50), default="PASSED")
    is_demo_synthetic = Column(Boolean, default=False)
    quality_metrics = Column(Text, nullable=True)  # JSON: lighting, blur, face_count
    verified_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("LoanApplication", back_populates="face_sessions")


class CreditCheck(Base):
    __tablename__ = "credit_checks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("loan_applications.id", ondelete="CASCADE"), nullable=False)
    provider_mode = Column(String(20), default="DEMO")  # "DEMO", "REAL"
    provider_name = Column(String(100), default="CIBIL_TRANSUNION")
    cibil_score = Column(Integer, nullable=False)
    payment_history = Column(Float, default=100.0)
    credit_utilization = Column(Float, default=0.0)
    credit_history_years = Column(Float, default=1.0)
    recent_enquiries = Column(Integer, default=0)
    # Status: "VERIFIED", "DEMO_UNVERIFIED", "UNABLE_TO_VERIFY", "PENDING"
    verification_status = Column(String(50), default="DEMO_UNVERIFIED")
    consent_timestamp = Column(DateTime, default=datetime.utcnow)
    report_data = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("LoanApplication", back_populates="credit_checks")


class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("loan_applications.id", ondelete="CASCADE"), nullable=False)
    provider_mode = Column(String(20), default="DEMO")
    bank_name = Column(String(100), nullable=False)
    account_number_masked = Column(String(30), nullable=False)  # e.g., "XXXXXXXX4321"
    ifsc_code = Column(String(20), nullable=False)
    account_holder_name = Column(String(150), nullable=False)
    name_similarity_score = Column(Float, default=1.0)
    # Status: "VERIFIED", "FAILED", "MANUAL_REVIEW"
    verification_status = Column(String(50), default="VERIFIED")
    verification_reference = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("LoanApplication", back_populates="bank_accounts")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("loan_applications.id", ondelete="CASCADE"), nullable=False)
    predicted_class = Column(String(50), nullable=False)  # "Approved", "Needs Review", "Declined"
    probability = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)  # "Low", "Moderate", "High"
    model_version = Column(String(50), default="v1.2.0-ebm")
    model_name = Column(String(100), default="Explainable Boosting Machine (EBM)")
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("LoanApplication", back_populates="predictions")
    factors = relationship("PredictionFactor", back_populates="prediction", cascade="all, delete-orphan")


class PredictionFactor(Base):
    __tablename__ = "prediction_factors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    prediction_id = Column(String(36), ForeignKey("predictions.id", ondelete="CASCADE"), nullable=False)
    feature = Column(String(100), nullable=False)
    feature_label = Column(String(150), nullable=True)
    feature_value = Column(String(100), nullable=True)
    contribution = Column(Float, nullable=False)
    direction = Column(String(20), nullable=False)  # "POSITIVE", "NEGATIVE"
    explanation = Column(Text, nullable=False)

    prediction = relationship("Prediction", back_populates="factors")


class ReviewDecision(Base):
    __tablename__ = "review_decisions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("loan_applications.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    previous_status = Column(String(50), nullable=False)
    new_status = Column(String(50), nullable=False)
    decision_type = Column(String(50), nullable=False)  # "PRELIMINARY", "FINAL_APPROVAL", "DECLINE", "OVERRIDE"
    reason = Column(String(255), nullable=False)
    comments = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    application = relationship("LoanApplication", back_populates="review_decisions")
    reviewer = relationship("User")


class DisbursementRecord(Base):
    __tablename__ = "disbursement_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("loan_applications.id", ondelete="CASCADE"), nullable=False)
    provider_mode = Column(String(20), default="DEMO")  # "DEMO", "REAL"
    idempotency_key = Column(String(100), unique=True, index=True, nullable=False)
    amount = Column(Float, nullable=False)
    tenure_months = Column(Integer, nullable=False)
    interest_rate = Column(Float, nullable=False)
    emi_amount = Column(Float, nullable=False)
    status = Column(String(50), default="SIMULATED")  # "SIMULATED", "INITIATED", "SUCCESS", "FAILED"
    transaction_reference = Column(String(100), nullable=False)
    simulated_banner_displayed = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    application = relationship("LoanApplication", back_populates="disbursements")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    application_id = Column(String(36), ForeignKey("loan_applications.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    ip_address = Column(String(50), default="127.0.0.1")
    details = Column(Text, nullable=True)  # JSON string
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
    application = relationship("LoanApplication", back_populates="audit_logs")
