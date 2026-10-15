export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'NEEDS_REVIEW' | 'DECLINED';
export type VerificationStatus = 'DEMO_UNVERIFIED' | 'VERIFIED' | 'REJECTED';
export type FactorDirection = 'POSITIVE' | 'NEGATIVE';

export interface CreditProfile {
  id: string;
  applicationId: string;
  cibilScore: number;
  paymentHistory: number;
  creditUtilization: number;
  creditHistoryYears: number;
  recentEnquiries: number;
  verificationStatus: VerificationStatus;
  provider: string;
  consentTimestamp: string;
}

export interface PredictionFactor {
  id?: string;
  predictionId?: string;
  feature: string;
  feature_label?: string;
  value?: any;
  contribution: number;
  direction: FactorDirection | 'positive' | 'negative';
  explanation: string;
}

export interface Prediction {
  id: string;
  applicationId: string;
  predictedClass: 'Approved' | 'Needs Review' | 'Declined';
  probability: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  modelVersion: string;
  createdAt: string;
  factors: PredictionFactor[];
}

export interface AuditLog {
  id: string;
  userId?: string;
  applicationId?: string;
  action: string;
  metadata?: string;
  timestamp: string;
}

export interface LoanApplication {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  income: number;
  employmentType: 'salaried' | 'self_employed' | 'not_employed';
  age: number;
  dependents: number;
  loanAmount: number;
  loanTenure: number;
  loanPurpose: string;
  existingLoans: number;
  monthlyObligations: number;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  creditProfile?: CreditProfile | null;
  predictions?: Prediction[];
  auditLogs?: AuditLog[];
}

export interface ModelMetrics {
  ebm: {
    model_name: string;
    model_version: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    confusion_matrix: number[][];
  };
  baseline: {
    model_name: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    confusion_matrix: number[][];
  };
  feature_importances: Array<{
    feature: string;
    importance: number;
  }>;
  training_metadata: {
    train_samples: number;
    test_samples: number;
    features_used: string[];
    target: string;
  };
}

export interface DashboardStats {
  totalApplications: number;
  approvedCount: number;
  reviewCount: number;
  declinedCount: number;
  pendingCount: number;
  averageCibil: number;
  mlServiceHealthy: boolean;
  recentApplications: LoanApplication[];
}

export interface AdminStats {
  totalUsers: number;
  totalApplications: number;
  approvalRate: number;
  statusBreakdown: Record<string, number>;
  riskBreakdown: Record<string, number>;
  modelMetrics?: ModelMetrics;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    timestamp: string;
    user?: { name: string; email: string };
    metadata?: string;
  }>;
}

export interface DigiLockerDocument {
  docId: string;
  documentType: string;
  issuerName: string;
  isIssuerAuthenticated: boolean;
  verificationStatus: string;
  labelTag: string;
  fields: Record<string, any>;
}

export interface FaceVerificationResult {
  success: boolean;
  mode: string;
  status: 'PASSED' | 'FAILED' | 'INCONCLUSIVE' | 'MANUAL_REVIEW_REQUIRED';
  livenessScore: number;
  faceMatchScore: number;
  isDemoSynthetic: boolean;
  message: string;
  verifiedAt: string;
}

export interface BankAccountVerification {
  id?: string;
  applicationId: string;
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
  accountHolderName: string;
  nameSimilarityScore: number;
  verificationStatus: 'VERIFIED' | 'FAILED' | 'MANUAL_REVIEW';
  verificationReference?: string;
  isDemo: boolean;
}

export interface ConsistencyReport {
  passed: boolean;
  missingDocuments: string[];
  nameMismatchDetected: boolean;
  nameMismatchDetails?: string;
  expiredDocuments: string[];
  incomeConflictDetected: boolean;
  incomeConflictDetails?: string;
  findings: string[];
  overallRisk: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface DecisionEvaluation {
  applicationId: string;
  currentStage: string;
  decision: string;
  reasons: string[];
  pendingRequirements: string[];
  canDisburse: boolean;
}

export interface DisbursementInfo {
  success: boolean;
  mode: 'DEMO' | 'REAL';
  status: 'SIMULATED' | 'INITIATED' | 'SUCCESS' | 'FAILED';
  transactionReference: string;
  amount: number;
  tenureMonths: number;
  interestRate: number;
  emiAmount: number;
  simulatedBanner: string;
  timestamp: string;
  message: string;
}

export interface UserUploadedDocument {
  id: string;
  documentType: 'AADHAAR' | 'PAN' | 'SALARY' | 'BANK_STATEMENT';
  fileName: string;
  fileSize: string;
  uploadTimestamp: string;
  extractedData: Record<string, any>;
  digiLockerMatched: boolean;
  digiLockerMatchScore: number;
  digiLockerRecordId?: string;
  status: 'PENDING' | 'MATCHING' | 'VERIFIED' | 'MISMATCH';
}

export interface DocumentItemState {
  file: File | null;
  fileName: string;
  fileSize: string;
  previewUrl: string | null;
  uploadStatus: 'NOT_UPLOADED' | 'UPLOADED' | 'PROCESSING' | 'FAILED';
  ocrStatus: 'NOT_PROCESSED' | 'PROCESSING' | 'EXTRACTED' | 'FAILED';
  verificationStatus: 'NOT_VERIFIED' | 'NEEDS_REVIEW' | 'VERIFIED' | 'FAILED';
  extractedFields: Record<string, any>;
  errorMessage?: string;
}

export interface BiometricCrossCheckResult {
  aadharPhotoMatchedPanPhoto: boolean;
  aadharPanSimilarityScore: number;
  liveFaceMatchedDocuments: boolean;
  liveFaceSimilarityScore: number;
  liveAadharSimilarityScore?: number;
  livePanSimilarityScore?: number;
  livenessVerified: boolean;
  livenessScore?: number;
  isMismatchSimulated: boolean;
  status: 'VERIFIED' | 'MISMATCH_DETECTED' | 'PENDING' | 'FAILED' | 'NEEDS_REVIEW';
  message: string;
  aadharPhotoUrl?: string;
  panPhotoUrl?: string;
  liveSnapshotUrl?: string;
}

export interface OcrFieldMatch {
  fieldName: string;
  declaredValue: string;
  extractedValue: string;
  isMatch: boolean;
  confidence: number;
  status: 'MATCHED' | 'MISMATCH' | 'VERIFIED';
}

export interface OcrProfileCrossCheckResponse {
  success: boolean;
  overallMatchStatus: 'EXACT_MATCH' | 'HIGH_CONFIDENCE_MATCH' | 'MISMATCH';
  overallConfidenceScore: number;
  fieldMatches: OcrFieldMatch[];
  aadhaarExtracted: Record<string, any>;
  panExtracted: Record<string, any>;
  message: string;
}


