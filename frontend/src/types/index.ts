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
