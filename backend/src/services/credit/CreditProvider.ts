export interface CreditVerificationInput {
  applicationId: string;
  cibilScore: number;
  paymentHistory?: number;
  creditUtilization?: number;
  creditHistoryYears?: number;
  recentEnquiries?: number;
  consentGiven: boolean;
  panNumber?: string;
  applicantName?: string;
}

export interface CreditVerificationResult {
  applicationId: string;
  cibilScore: number;
  paymentHistory: number;
  creditUtilization: number;
  creditHistoryYears: number;
  recentEnquiries: number;
  verificationStatus: 'DEMO_UNVERIFIED' | 'VERIFIED' | 'REJECTED';
  provider: string;
  consentTimestamp: Date;
  consistencyScore?: number;
  notes?: string;
}

export interface ICreditProvider {
  name: string;
  verifyCreditProfile(input: CreditVerificationInput): Promise<CreditVerificationResult>;
}
