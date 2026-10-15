"""
Pydantic V2 schemas for Loan Eligibility AI FastAPI backend.
Provides strong validation, sanitization, and serialization.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field


# --- Authentication Schemas ---
class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=150)
    password: str = Field(..., min_length=6)
    role: Optional[str] = "APPLICANT"  # "APPLICANT", "REVIEWER", "ADMIN"


class UserLoginRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=150)
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    createdAt: Optional[datetime] = None

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    success: bool = True
    message: str
    user: UserResponse
    token: str


# --- Loan Application Schemas ---
class LoanApplicationCreate(BaseModel):
    income: float = Field(..., ge=5000, description="Monthly income in INR")
    employmentType: str = Field(..., description="salaried, self_employed, not_employed")
    age: int = Field(..., ge=18, le=75)
    dependents: int = Field(0, ge=0, le=10)
    loanAmount: float = Field(..., gt=0, description="Requested loan amount in INR or Lakhs")
    loanTenure: int = Field(..., ge=6, le=360, description="Tenure in months")
    loanPurpose: Optional[str] = "personal"
    existingLoans: int = Field(0, ge=0, le=10)
    monthlyObligations: float = Field(0.0, ge=0)


class LoanApplicationResponse(BaseModel):
    id: str
    userId: str
    income: float
    employmentType: str
    age: int
    dependents: int
    loanAmount: float
    loanTenure: int
    loanPurpose: str
    existingLoans: int
    monthlyObligations: float
    status: str
    stage: str
    createdAt: datetime
    updatedAt: datetime
    user: Optional[UserResponse] = None

    model_config = {"from_attributes": True}


# --- Consent Schema ---
class ConsentRequest(BaseModel):
    applicationId: str
    purpose: str = Field(..., description="DIGILOCKER_FETCH, FACE_LIVENESS, CIBIL_PULL, BANK_VERIFY")
    consentGiven: bool = True
    consentText: str


# --- DigiLocker Schemas ---
class DigiLockerInitRequest(BaseModel):
    applicationId: str
    consentGiven: bool = True


class DigiLockerItemResponse(BaseModel):
    docId: str
    documentType: str
    issuerName: str
    isIssuerAuthenticated: bool
    verificationStatus: str
    labelTag: str  # "DEMO — NOT OFFICIALLY VERIFIED" or "OFFICIALLY ISSUER VERIFIED"
    fields: Dict[str, Any]


class DigiLockerSummaryResponse(BaseModel):
    success: bool
    mode: str  # "demo" or "real"
    message: str
    documents: List[DigiLockerItemResponse]
    verifiedCount: int
    pendingCount: int


# --- Face Verification Schemas ---
class FaceSessionStartRequest(BaseModel):
    applicationId: str
    consentGiven: bool = True


class FaceVerifyFrameRequest(BaseModel):
    applicationId: str
    sessionToken: str
    imageBase64: str  # Base64-encoded frame captured from camera
    lightingOk: Optional[bool] = True
    singleFacePresent: Optional[bool] = True


class FaceVerificationResponse(BaseModel):
    success: bool
    mode: str  # "demo" or "real"
    status: str  # "PASSED", "FAILED", "INCONCLUSIVE", "MANUAL_REVIEW_REQUIRED"
    livenessScore: float
    faceMatchScore: float
    isDemoSynthetic: bool
    message: str
    verifiedAt: datetime


class TriBiometricVerifyRequest(BaseModel):
    applicationId: str
    liveCameraFrameBase64: str
    aadharImageBase64: Optional[str] = None
    panImageBase64: Optional[str] = None
    simulateMismatch: Optional[bool] = False


class TriBiometricVerifyResponse(BaseModel):
    success: bool
    status: str  # "VERIFIED", "MISMATCH_DETECTED", "NEEDS_REVIEW", "FAILED"
    faceDetected: bool = True
    photo1ToPhoto2Similarity: float = 99.1
    photo1ToLiveSimilarity: float = 98.8
    photo2ToLiveSimilarity: float = 98.5
    aadharPanSimilarityScore: float
    aadharPhotoMatchedPanPhoto: bool
    liveFaceSimilarityScore: float
    liveFaceMatchedDocuments: bool
    livenessScore: float
    livenessVerified: bool
    livenessStatus: str = "LIVENESS_PASS"
    isMismatchSimulated: bool
    message: str
    verifiedAt: datetime


# --- Credit Assessment Schemas ---
class CreditCheckRequest(BaseModel):
    applicationId: str
    cibilScore: Optional[int] = Field(None, ge=300, le=900)
    panNumber: Optional[str] = None
    consentGiven: bool = True


class CreditProfileResponse(BaseModel):
    id: str
    applicationId: str
    cibilScore: int
    paymentHistory: float
    creditUtilization: float
    creditHistoryYears: float
    recentEnquiries: int
    verificationStatus: str
    provider: str
    consentTimestamp: datetime
    reportSummary: Optional[Dict[str, Any]] = None

    model_config = {"from_attributes": True}


# --- Bank Account Verification Schemas ---
class BankVerificationRequest(BaseModel):
    applicationId: str
    bankName: str
    accountNumber: str = Field(..., min_length=6, max_length=25)
    ifscCode: str = Field(..., min_length=4, max_length=20)
    accountHolderName: str
    consentGiven: bool = True


class BankAccountResponse(BaseModel):
    id: str
    applicationId: str
    bankName: str
    accountNumberMasked: str
    ifscCode: str
    accountHolderName: str
    nameSimilarityScore: float
    verificationStatus: str
    verificationReference: Optional[str] = None
    isDemo: bool
    regulatoryBanner: Optional[str] = "DEMO BANK VERIFICATION — NO REAL BANK ACCOUNT CHECK PERFORMED"

    model_config = {"from_attributes": True}


# --- OCR & Consistency Schemas ---
class OcrFieldMatch(BaseModel):
    fieldName: str
    declaredValue: str
    extractedValue: str
    isMatch: bool
    confidence: float
    status: str  # "MATCHED", "MISMATCH", "VERIFIED"


class OcrDocumentExtractionResponse(BaseModel):
    documentType: str  # "AADHAAR", "PAN"
    issuer: str
    extractedFields: Dict[str, Any]
    confidenceScore: float
    photoExtracted: bool
    photoUrl: Optional[str] = None
    cardImageUrl: Optional[str] = None
    fieldMatches: Optional[List[OcrFieldMatch]] = None
    overallMatchStatus: str  # "EXACT_MATCH", "PARTIAL_MATCH", "MISMATCH"


class OcrProfileCrossCheckRequest(BaseModel):
    declaredName: str
    declaredDob: Optional[str] = None
    declaredAge: Optional[int] = None
    declaredGender: Optional[str] = None
    declaredFatherName: Optional[str] = None
    declaredPan: Optional[str] = None
    declaredAadhaar: Optional[str] = None


class OcrProfileCrossCheckResponse(BaseModel):
    success: bool
    overallMatchStatus: str  # "EXACT_MATCH", "HIGH_CONFIDENCE_MATCH", "MISMATCH"
    overallConfidenceScore: float
    fieldMatches: List[OcrFieldMatch]
    aadhaarExtracted: Dict[str, Any]
    panExtracted: Dict[str, Any]
    message: str


class ConsistencyReport(BaseModel):
    passed: bool
    missingDocuments: List[str]
    nameMismatchDetected: bool
    nameMismatchDetails: Optional[str] = None
    expiredDocuments: List[str]
    incomeConflictDetected: bool
    incomeConflictDetails: Optional[str] = None
    findings: List[str]
    overallRisk: str  # "LOW", "MODERATE", "HIGH"



# --- Prediction & Explanation Schemas ---
class PredictionFactorSchema(BaseModel):
    feature: str
    featureLabel: str
    value: Optional[str] = None
    contribution: float
    direction: str  # "POSITIVE", "NEGATIVE"
    explanation: str


class PredictionResponse(BaseModel):
    id: Optional[str] = None
    applicationId: str
    predictedClass: str  # "Approved", "Needs Review", "Declined"
    probability: float
    probabilityPercentage: float
    riskLevel: str  # "Low", "Moderate", "High"
    modelVersion: str
    modelName: str
    positiveFactors: List[PredictionFactorSchema]
    negativeFactors: List[PredictionFactorSchema]
    allFactors: List[PredictionFactorSchema]
    derivedFeatures: Dict[str, float]
    disclaimer: str


# --- EMI Calculator Schemas ---
class EMICalculatorRequest(BaseModel):
    loanAmount: float = Field(..., gt=0)
    loanTenure: int = Field(..., ge=6, le=360)
    annualInterestRate: Optional[float] = 10.5
    monthlyIncome: Optional[float] = 0.0
    existingMonthlyObligations: Optional[float] = 0.0


class EMICalculatorResponse(BaseModel):
    monthlyEMI: float
    totalInterest: float
    totalRepayment: float
    annualInterestRate: float
    debtToIncomeRatio: float  # FOIR percentage
    loanToIncomeRatio: float
    affordabilityStatus: str  # "COMFORTABLE", "MANAGEABLE", "HIGH_BURDEN"


# --- Decision & Overrides ---
class DecisionEvaluationResponse(BaseModel):
    applicationId: str
    currentStage: str
    decision: str  # "PRELIMINARY_ELIGIBLE", "REVIEW_REQUIRED", "DECLINED", "PENDING_CHECKS"
    reasons: List[str]
    pendingRequirements: List[str]
    canDisburse: bool


class ReviewerDecisionRequest(BaseModel):
    decisionType: str = Field(..., description="FINAL_APPROVAL, DECLINE, OVERRIDE, REQUEST_INFO")
    reason: str = Field(..., min_length=5)
    comments: Optional[str] = ""


# --- Disbursement Schemas ---
class DisbursementRequest(BaseModel):
    applicationId: str
    idempotencyKey: str = Field(..., min_length=10)
    accountNumber: Optional[str] = None
    ifscCode: Optional[str] = None


class DisbursementResponse(BaseModel):
    success: bool
    mode: str  # "DEMO" or "REAL"
    status: str  # "SIMULATED", "INITIATED", "SUCCESS", "FAILED"
    transactionReference: str
    amount: float
    tenureMonths: int
    interestRate: float
    emiAmount: float
    simulatedBanner: str = "SIMULATED DISBURSEMENT — NO REAL MONEY TRANSFERRED"
    timestamp: datetime
    message: str
