import axios from 'axios';
import { JEEVA_AADHAAR_B64, JEEVA_PAN_B64 } from './photo_constants';
import {
  LoanApplication,
  DashboardStats,
  AdminStats,
  ModelMetrics,
  CreditProfile,
  Prediction,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const isStaticDeployment = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return (
    host.includes('github.io') ||
    host.includes('surge.sh') ||
    host.includes('netlify.app') ||
    host.includes('vercel.app') ||
    (!host.includes('localhost') && !host.includes('127.0.0.1'))
  );
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('loan_xai_token') || localStorage.getItem('loan_ai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================================
// 1-CLICK BENCHMARK PERSONA DEFINITIONS (RBI COMPLIANT TEST MATRIX)
// ============================================================================
export const MOCK_PERSONAS = [
  {
    id: 'jeeva_bharathi',
    tag: 'Prime Tier (Instant Approval)',
    badge_color: 'green',
    name: 'Jeeva Bharathi M',
    pan_name: 'JEEVA BHARATHI M',
    aadhaar_name: 'Jeeva Bharathi M',
    father_name: 'MAHALINGAM',
    mobile: '+91 98765 43210',
    mobile_raw: '9876543210',
    email: 'jeeva.bharathi@fintech.gov.in',
    dob: '2006-02-25',
    gender: 'M',
    pan_number: 'DELPJ9476P',
    aadhaar_masked: 'XXXX-XXXX-2450',
    aadhaar_raw: '2235 1313 2450',
    aadhaar_vid: '9184 5431 5321 6352',
    address: 'No. 42, Anna Salai, Guindy Industrial Estate, Chennai, Tamil Nadu - 600025',
    age: 20,
    employment_type: 'salaried',
    income: 95000,
    dependents: 1,
    existing_loans: 1,
    monthly_obligations: 8000,
    loan_amount: 500000,
    loan_tenure: 36,
    loan_purpose: 'personal',
    cibil_score: 785,
    payment_history: 98.5,
    credit_utilization: 18.0,
    credit_history_years: 4.0,
    recent_enquiries: 1,
    expected_decision: 'APPROVED',
    expected_dti: '25.5%',
    expected_probability: '94.2%',
    story: 'Senior AI & Full-Stack Engineer with verified Government e-KYC (Aadhaar 2235 1313 2450, PAN DELPJ9476P) and 98.6% tri-biometric face match.',
    aadhaar_photo: JEEVA_AADHAAR_B64,
    pan_photo: JEEVA_PAN_B64,
    live_photo: JEEVA_PAN_B64,
    biometric_similarity: 98.6,
    name_similarity: 100.0,
    cross_field_status: 'MATCH',
  },
  {
    id: 'jeeva_b',
    tag: 'Near-Prime / Risk Advisory (Underwriter Review)',
    badge_color: 'amber',
    name: 'Jeeva B',
    pan_name: 'JEEVA B',
    aadhaar_name: 'Jeeva Bharathi M',
    father_name: 'MAHALINGAM',
    mobile: '+91 98765 43211',
    mobile_raw: '9876543211',
    email: 'jeeva.consulting@enterprise.in',
    dob: '2006-02-25',
    gender: 'M',
    pan_number: 'DELPJ9476P',
    aadhaar_masked: 'XXXX-XXXX-2450',
    aadhaar_raw: '2235 1313 2450',
    aadhaar_vid: '9184 5431 5321 6352',
    address: 'No. 42, Anna Salai, Guindy, Chennai, Tamil Nadu - 600025',
    age: 20,
    employment_type: 'salaried',
    income: 60000,
    dependents: 2,
    existing_loans: 2,
    monthly_obligations: 14000,
    loan_amount: 400000,
    loan_tenure: 36,
    loan_purpose: 'business',
    cibil_score: 680,
    payment_history: 88.0,
    credit_utilization: 42.0,
    credit_history_years: 2.5,
    recent_enquiries: 3,
    expected_decision: 'NEEDS_REVIEW',
    expected_dti: '46.5%',
    expected_probability: '56.4%',
    story: 'IT Consultant with minor PAN initials disparity (Jeeva B vs Jeeva Bharathi M) and moderate debt burden requiring institutional underwriter sign-off.',
    aadhaar_photo: JEEVA_AADHAAR_B64,
    pan_photo: JEEVA_PAN_B64,
    live_photo: JEEVA_PAN_B64,
    biometric_similarity: 96.4,
    name_similarity: 68.0,
    cross_field_status: 'DISCREPANCY_FLAG',
  },
  {
    id: 'karthik_raman',
    tag: 'Subprime / High Risk (Adverse Action Notice)',
    badge_color: 'red',
    name: 'Karthik Raman',
    pan_name: 'KARTHIK R',
    aadhaar_name: 'Karthik Raman',
    father_name: 'RAMANATHAN',
    mobile: '+91 98765 43212',
    mobile_raw: '9876543212',
    email: 'karthik.raman@startup.in',
    dob: '1998-07-14',
    gender: 'M',
    pan_number: 'ABCPR8471Q',
    aadhaar_masked: 'XXXX-XXXX-9134',
    aadhaar_raw: '6543 9876 9134',
    aadhaar_vid: '9871 2345 6789 1234',
    address: 'Flat 4B, Shanthi Heights, T. Nagar, Chennai - 600017',
    age: 28,
    employment_type: 'self_employed',
    income: 32000,
    dependents: 3,
    existing_loans: 4,
    monthly_obligations: 22000,
    loan_amount: 800000,
    loan_tenure: 36,
    loan_purpose: 'personal',
    cibil_score: 540,
    payment_history: 64.0,
    credit_utilization: 78.0,
    credit_history_years: 1.2,
    recent_enquiries: 6,
    expected_decision: 'DECLINED',
    expected_dti: '117.2%',
    expected_probability: '5.0%',
    story: 'Self-employed applicant exceeding RBI 55% DTI prudential threshold with multiple past-due delinquencies, triggering glassbox adverse action notice.',
    aadhaar_photo: JEEVA_AADHAAR_B64,
    pan_photo: JEEVA_PAN_B64,
    live_photo: JEEVA_PAN_B64,
    biometric_similarity: 54.0,
    name_similarity: 50.0,
    cross_field_status: 'MISMATCH',
  },
];

// ============================================================================
// INITIAL SEED APPLICATIONS (STORED & PERSISTED IN LOCALSTORAGE)
// ============================================================================
export const INITIAL_MOCK_APPLICATIONS: LoanApplication[] = [
  {
    id: 'APP-2026-0841',
    userId: 'usr-jeeva-prime',
    user: {
      id: 'usr-jeeva-prime',
      name: 'Jeeva Bharathi M',
      email: 'jeeva.bharathi@fintech.gov.in',
    },
    income: 95000,
    employmentType: 'salaried',
    age: 20,
    dependents: 1,
    loanAmount: 500000,
    loanTenure: 36,
    loanPurpose: 'personal',
    existingLoans: 1,
    monthlyObligations: 8000,
    status: 'APPROVED',
    createdAt: '2026-10-29T10:30:00Z',
    updatedAt: '2026-10-29T10:32:15Z',
    creditProfile: {
      id: 'CRD-1001',
      applicationId: 'APP-2026-0841',
      cibilScore: 785,
      paymentHistory: 98.5,
      creditUtilization: 18.0,
      creditHistoryYears: 4.0,
      recentEnquiries: 1,
      verificationStatus: 'VERIFIED',
      provider: 'CIBIL_TRANSUNION',
      consentTimestamp: '2026-10-29T10:30:15Z',
    },
    predictions: [
      {
        id: 'PRD-1001',
        applicationId: 'APP-2026-0841',
        predictedClass: 'Approved',
        probability: 0.942,
        riskLevel: 'Low',
        modelVersion: 'v2.1.0-ebm',
        createdAt: '2026-10-29T10:31:00Z',
        factors: [
          { feature: 'Payment History (98.5%)', contribution: 0.45, direction: 'POSITIVE', explanation: 'Flawless on-time payment track record adds positive credit stability' },
          { feature: 'CIBIL Score (785)', contribution: 0.41, direction: 'POSITIVE', explanation: 'Prime CIBIL band demonstrates disciplined debt repayment history' },
          { feature: 'Credit Utilization (18%)', contribution: 0.32, direction: 'POSITIVE', explanation: 'Revolving card usage below 20% indicates low leverage risk' },
          { feature: 'Debt-to-Income (25.5%)', contribution: 0.28, direction: 'POSITIVE', explanation: 'Healthy debt-to-income margin with ample disposable income surplus' },
          { feature: 'Tri-Biometric Match (98.6%)', contribution: 0.20, direction: 'POSITIVE', explanation: '3-way Aadhaar-PAN-Webcam facial vector validation passed' },
        ],
      },
    ],
    auditLogs: [
      { id: 'aud-1', action: 'DIGILOCKER_AUTHENTICATED', timestamp: '2026-10-29T10:30:00Z', metadata: 'e-Aadhaar & ITD PAN retrieved' },
      { id: 'aud-2', action: 'TRI_BIOMETRIC_PASSED', timestamp: '2026-10-29T10:30:45Z', metadata: 'Composite similarity 98.6%' },
      { id: 'aud-3', action: 'EBM_PREDICTION_APPROVED', timestamp: '2026-10-29T10:31:00Z', metadata: 'Calibrated approval probability 94.2%' },
      { id: 'aud-4', action: 'NPCI_MANDATE_REGISTERED', timestamp: '2026-10-29T10:32:00Z', metadata: 'UMRN-2026-NACH-914827 active' },
      { id: 'aud-5', action: 'IMPS_DISBURSED', timestamp: '2026-10-29T10:32:15Z', metadata: '₹5,00,000 credited to SBI XXXXXXXX4419' },
    ],
  },
  {
    id: 'APP-2026-0792',
    userId: 'usr-jeeva-review',
    user: {
      id: 'usr-jeeva-review',
      name: 'Jeeva B',
      email: 'jeeva.consulting@enterprise.in',
    },
    income: 60000,
    employmentType: 'salaried',
    age: 20,
    dependents: 2,
    loanAmount: 400000,
    loanTenure: 36,
    loanPurpose: 'business',
    existingLoans: 2,
    monthlyObligations: 14000,
    status: 'NEEDS_REVIEW',
    createdAt: '2026-10-28T14:20:00Z',
    updatedAt: '2026-10-28T14:25:00Z',
    creditProfile: {
      id: 'CRD-1002',
      applicationId: 'APP-2026-0792',
      cibilScore: 680,
      paymentHistory: 88.0,
      creditUtilization: 42.0,
      creditHistoryYears: 2.5,
      recentEnquiries: 3,
      verificationStatus: 'VERIFIED',
      provider: 'CIBIL_TRANSUNION',
      consentTimestamp: '2026-10-28T14:20:30Z',
    },
    predictions: [
      {
        id: 'PRD-1002',
        applicationId: 'APP-2026-0792',
        predictedClass: 'Needs Review',
        probability: 0.564,
        riskLevel: 'Moderate',
        modelVersion: 'v2.1.0-ebm',
        createdAt: '2026-10-28T14:22:00Z',
        factors: [
          { feature: 'Debt-to-Income (46.5%)', contribution: -0.22, direction: 'NEGATIVE', explanation: 'DTI approaches the 50% prudence ceiling' },
          { feature: 'CIBIL Score (680)', contribution: 0.12, direction: 'POSITIVE', explanation: 'Near-prime credit history requires exception justification' },
          { feature: 'Name Discrepancy (Jeeva B)', contribution: -0.15, direction: 'NEGATIVE', explanation: 'Minor name variation between Aadhaar and PAN' },
        ],
      },
    ],
    auditLogs: [
      { id: 'aud-21', action: 'APPLICATION_CREATED', timestamp: '2026-10-28T14:20:00Z', metadata: 'Submitted loan request ₹4,00,000' },
      { id: 'aud-22', action: 'FLAG_DISCREPANCY', timestamp: '2026-10-28T14:21:00Z', metadata: 'Name abbreviation discrepancy flagged' },
      { id: 'aud-23', action: 'QUEUED_FOR_OFFICER_REVIEW', timestamp: '2026-10-28T14:22:00Z', metadata: 'Sent to Dr. Arulmozhi Varman cockpit' },
    ],
  },
  {
    id: 'APP-2026-0648',
    userId: 'usr-karthik',
    user: {
      id: 'usr-karthik',
      name: 'Karthik Raman',
      email: 'karthik.raman@startup.in',
    },
    income: 32000,
    employmentType: 'self_employed',
    age: 28,
    dependents: 3,
    loanAmount: 800000,
    loanTenure: 36,
    loanPurpose: 'personal',
    existingLoans: 4,
    monthlyObligations: 22000,
    status: 'DECLINED',
    createdAt: '2026-10-27T09:15:00Z',
    updatedAt: '2026-10-27T09:18:00Z',
    creditProfile: {
      id: 'CRD-1003',
      applicationId: 'APP-2026-0648',
      cibilScore: 540,
      paymentHistory: 64.0,
      creditUtilization: 78.0,
      creditHistoryYears: 1.2,
      recentEnquiries: 6,
      verificationStatus: 'REJECTED',
      provider: 'CIBIL_TRANSUNION',
      consentTimestamp: '2026-10-27T09:15:30Z',
    },
    predictions: [
      {
        id: 'PRD-1003',
        applicationId: 'APP-2026-0648',
        predictedClass: 'Declined',
        probability: 0.050,
        riskLevel: 'High',
        modelVersion: 'v2.1.0-ebm',
        createdAt: '2026-10-27T09:16:30Z',
        factors: [
          { feature: 'Debt-to-Income (117.2%)', contribution: -0.74, direction: 'NEGATIVE', explanation: 'DTI severely breaches RBI 55% cap' },
          { feature: 'CIBIL Score (540)', contribution: -0.58, direction: 'NEGATIVE', explanation: 'Subprime score band with repeated defaults' },
          { feature: 'Credit Utilization (78%)', contribution: -0.42, direction: 'NEGATIVE', explanation: 'High revolving balance on cards' },
        ],
      },
    ],
    auditLogs: [
      { id: 'aud-31', action: 'APPLICATION_CREATED', timestamp: '2026-10-27T09:15:00Z', metadata: 'Submitted loan request ₹8,00,000' },
      { id: 'aud-32', action: 'ADVERSE_ACTION_GENERATED', timestamp: '2026-10-27T09:16:30Z', metadata: 'Policy rejection: DTI and CIBIL breach' },
    ],
  },
];

const getStoredApplications = (): LoanApplication[] => {
  try {
    const raw = localStorage.getItem('loan_xai_applications');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading stored applications:', e);
  }
  localStorage.setItem('loan_xai_applications', JSON.stringify(INITIAL_MOCK_APPLICATIONS));
  return INITIAL_MOCK_APPLICATIONS;
};

const saveStoredApplications = (apps: LoanApplication[]) => {
  try {
    localStorage.setItem('loan_xai_applications', JSON.stringify(apps));
  } catch (e) {
    console.warn('Error saving applications:', e);
  }
};

// ============================================================================
// DIGILOCKER / MERI PEHCHAAN SSO APIS
// ============================================================================
export const requestMobileOtpApi = async (mobile: string) => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.post('/auth/digilocker/mobile-otp', { mobile });
      return res.data;
    } catch (e) {
      console.warn('API /auth/digilocker/mobile-otp failed, using client fallback');
    }
  }
  return {
    success: true,
    message: `6-digit OTP dispatched to ${mobile}`,
    expires_in_seconds: 300,
    demo_otp: '123456',
  };
};

export const verifyMobileOtpApi = async (mobile: string, otp: string) => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.post('/auth/digilocker/verify-otp', { mobile, otp });
      return res.data;
    } catch (e) {
      console.warn('API /auth/digilocker/verify-otp failed, using client fallback');
    }
  }
  return {
    success: true,
    access_token: 'dgl-jwt-' + Math.random().toString(36).substring(2, 12),
    user: {
      id: 'usr-jeeva-prime',
      full_name: 'Jeeva Bharathi M',
      name: 'Jeeva Bharathi M',
      email: 'jeeva.bharathi@fintech.gov.in',
      role: 'APPLICANT',
    },
  };
};

export const signinUsernamePinApi = async (username: string, pin: string) => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.post('/auth/digilocker/username-pin', { username, pin });
      return res.data;
    } catch (e) {
      console.warn('API /auth/digilocker/username-pin failed, using client fallback');
    }
  }
  const isOfficer = username.toLowerCase().includes('admin') || username.toLowerCase().includes('officer') || username.toLowerCase().includes('90421');
  return {
    success: true,
    access_token: 'dgl-jwt-pin-' + Math.random().toString(36).substring(2, 12),
    user: {
      id: isOfficer ? 'EMP-90421' : 'usr-jeeva-prime',
      full_name: isOfficer ? 'Dr. Arulmozhi Varman' : 'Jeeva Bharathi M',
      name: isOfficer ? 'Dr. Arulmozhi Varman' : 'Jeeva Bharathi M',
      email: isOfficer ? 'officer.varman@rbi.gov.in' : 'jeeva.bharathi@fintech.gov.in',
      role: isOfficer ? 'CHIEF_UNDERWRITER' : 'APPLICANT',
    },
  };
};

export const signinOtherIdApi = async (idType: string, idNumber: string) => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.post('/auth/digilocker/other-id', {
        id_type: idType,
        id_number: idNumber,
        consent_given: true,
      });
      return res.data;
    } catch (e) {
      console.warn('API /auth/digilocker/other-id failed, using client fallback');
    }
  }
  return {
    success: true,
    access_token: 'dgl-jwt-id-' + Math.random().toString(36).substring(2, 12),
    user: {
      id: 'usr-jeeva-prime',
      full_name: 'Jeeva Bharathi M',
      name: 'Jeeva Bharathi M',
      email: 'jeeva.bharathi@fintech.gov.in',
      role: 'APPLICANT',
    },
  };
};

// ============================================================================
// PERSONAS & KYC APIS
// ============================================================================
export const getDemoPersonasApi = async () => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.get('/personas');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (e) {
      console.warn('API /personas failed, using client fallback');
    }
  }
  return MOCK_PERSONAS;
};

export const getPersonaKycApi = async (personaId: string) => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.get(`/kyc/persona-kyc/${personaId}`);
      return res.data;
    } catch (e) {
      console.warn('API /kyc/persona-kyc failed, using client fallback');
    }
  }
  const persona = MOCK_PERSONAS.find((p) => p.id === personaId) || MOCK_PERSONAS[0];
  return {
    persona_id: persona.id,
    aadhaar: {
      aadhaar_number: persona.aadhaar_masked,
      name: persona.aadhaar_name,
      dob: persona.dob,
      gender: persona.gender,
      address: persona.address,
      xml_digital_signature: {
        verified: true,
        issuer: 'DS UNIQUE IDENTIFICATION AUTHORITY OF INDIA 04',
        timestamp: new Date().toISOString(),
      },
      photo_b64: persona.aadhaar_photo,
    },
    pan: {
      pan_number: persona.pan_number,
      name: persona.pan_name,
      father_name: persona.father_name,
      dob: persona.dob,
      status: 'OPERATIVE_AADHAAR_LINKED',
      digital_verification: {
        verified: true,
        source: 'INCOME TAX DEPARTMENT NSDL / UTIITSL MASTER DATABASE',
        timestamp: new Date().toISOString(),
      },
      photo_b64: persona.pan_photo,
    },
  };
};

export const checkOcrConsistencyApi = async (data: {
  aadhaar_name: string;
  pan_name: string;
  declared_name: string;
  aadhaar_dob: string;
  pan_dob: string;
  declared_dob: string;
  pan_number: string;
}) => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.post('/kyc/ocr-cross-check', data);
      return res.data;
    } catch (e) {
      console.warn('API /kyc/ocr-cross-check failed, using client fallback');
    }
  }

  const name1 = (data.aadhaar_name || '').trim().toLowerCase();
  const name2 = (data.pan_name || '').trim().toLowerCase();
  const isMatch = name1 === name2;
  const isDiscrepancy = !isMatch && (name1.includes(name2) || name2.includes(name1) || (name1.length > 5 && name2.length > 5 && name1[0] === name2[0]));

  const status = isMatch ? 'MATCH' : isDiscrepancy ? 'DISCREPANCY_FLAG' : 'MISMATCH';
  const sim = isMatch ? 100.0 : isDiscrepancy ? 68.0 : 42.0;

  return {
    status,
    name_similarity: sim,
    panStatusVerified: true,
    aadhaarXmlSignatureValid: true,
    discrepancy_count: isMatch ? 0 : 1,
    fields: [
      {
        field: 'Legal Name',
        aadhaar_value: data.aadhaar_name,
        pan_value: data.pan_name,
        match_score: sim,
        status: status,
      },
      {
        field: 'Date of Birth',
        aadhaar_value: data.aadhaar_dob,
        pan_value: data.pan_dob,
        match_score: 100.0,
        status: 'MATCH',
      },
      {
        field: 'PAN Document Format',
        aadhaar_value: 'N/A',
        pan_value: data.pan_number,
        match_score: 100.0,
        status: 'MATCH',
      },
    ],
  };
};

// ============================================================================
// BIOMETRICS APIS
// ============================================================================
export const getLivenessChallengeApi = async () => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.get('/biometrics/liveness-challenge');
      return res.data;
    } catch (e) {
      console.warn('API /biometrics/liveness-challenge failed, using client fallback');
    }
  }
  return {
    challenge_type: 'BLINK_EYES',
    instruction: 'Please look directly at camera and blink naturally',
    challenge_token: 'CHLG-' + Math.floor(1000 + Math.random() * 9000),
    expires_in_seconds: 60,
  };
};

export const verifyTriBiometricApi = async (payload: {
  persona_id?: string;
  live_webcam_image_b64?: string;
  force_spoof_simulation?: boolean;
}) => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.post('/biometrics/verify-tri-biometric', payload);
      return res.data;
    } catch (e) {
      console.warn('API /biometrics/verify-tri-biometric failed, using client fallback');
    }
  }

  const persona = MOCK_PERSONAS.find((p) => p.id === payload.persona_id) || MOCK_PERSONAS[0];

  if (payload.force_spoof_simulation || persona.id === 'karthik_raman') {
    return {
      passed: false,
      compositeSimilarity: 42.5,
      aadhaarPanSimilarity: 54.0,
      aadhaarLiveSimilarity: 41.2,
      panLiveSimilarity: 43.8,
      livenessScore: 32.1,
      status: 'SECURITY_DENIAL',
      reason: 'Anti-Spoofing Gate Triggered: Synthetic / Screen artifact detected',
      aadhaar_photo_b64: persona.aadhaar_photo,
      pan_photo_b64: persona.pan_photo,
      live_photo_b64: payload.live_webcam_image_b64 || persona.live_photo,
    };
  }

  return {
    passed: true,
    compositeSimilarity: persona.biometric_similarity,
    aadhaarPanSimilarity: 99.3,
    aadhaarLiveSimilarity: 97.8,
    panLiveSimilarity: 98.9,
    livenessScore: 98.4,
    status: 'PASSED',
    reason: 'Tri-Biometric 3-way vector similarity exceeded 75.0% compliance threshold',
    aadhaar_photo_b64: persona.aadhaar_photo,
    pan_photo_b64: persona.pan_photo,
    live_photo_b64: payload.live_webcam_image_b64 || persona.live_photo,
  };
};

// ============================================================================
// UNDERWRITING & EBM EVALUATION APIS
// ============================================================================
export const evaluateUnderwritingApi = async (payload: any) => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.post('/underwriting/evaluate', payload);
      return res.data;
    } catch (e) {
      console.warn('API /underwriting/evaluate failed, using client fallback');
    }
  }

  const inc = payload.income || 60000;
  const P = payload.loan_amount || 400000;
  const n = payload.loan_tenure || 36;
  const ob = payload.monthly_obligations || 5000;
  const cibil = payload.cibil_score || 750;

  const r = 0.105 / 12.0;
  const factor = Math.pow(1 + r, n);
  const emi = n > 0 && P > 0 ? (P * r * factor) / (factor - 1) : 0;
  const dti = ((ob + emi) / inc) * 100;
  const lti = P / (inc * 12);

  let decision: 'APPROVED' | 'NEEDS_REVIEW' | 'DECLINED' = 'APPROVED';
  let riskTier: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
  let prob = 0.942;
  let summary = 'Strong credit profile with prime CIBIL band, low debt obligations, and flawless verified e-KYC credentials.';
  const reasons: string[] = [];

  if (cibil < 600 || dti > 65 || payload.cross_field_status === 'MISMATCH') {
    decision = 'DECLINED';
    riskTier = 'HIGH';
    prob = 0.050;
    summary = 'Loan policy declined due to debt-to-income capacity limits and elevated credit default risk.';
    reasons.push(`Debt-to-Income (DTI) of ${dti.toFixed(1)}% exceeds RBI prudential cap (55.0%)`);
    reasons.push(`CIBIL score of ${cibil} falls into subprime credit risk tier`);
    if (payload.cross_field_status === 'MISMATCH') reasons.push('Critical identity cross-field verification mismatch');
  } else if (cibil < 720 || dti > 45 || payload.cross_field_status === 'DISCREPANCY_FLAG') {
    decision = 'NEEDS_REVIEW';
    riskTier = 'MODERATE';
    prob = 0.564;
    summary = 'Near-prime application requiring institutional chief underwriter exception review.';
    if (dti > 45) reasons.push(`Elevated Debt-to-Income (DTI) ratio at ${dti.toFixed(1)}%`);
    if (payload.cross_field_status === 'DISCREPANCY_FLAG') reasons.push('Minor name variation detected between Aadhaar XML and PAN Master');
    reasons.push('Score falls within near-prime exception approval policy band');
  } else {
    decision = 'APPROVED';
    riskTier = 'LOW';
    prob = 0.942;
    summary = 'Prime tier pre-approved with instant auto-sanction and immediate IMPS disbursement facility.';
    reasons.push(`Prime CIBIL credit score of ${cibil}`);
    reasons.push(`Low revolving credit utilization at ${payload.credit_utilization || 18}%`);
    reasons.push(`Comfortable Debt-to-Income buffer at ${dti.toFixed(1)}% (Limit: 50%)`);
  }

  const intercept = 0.15;
  const waterfallBars = [
    { feature: 'Base Population Intercept', score: intercept, label: 'Base Intercept', cumulative: intercept },
    { feature: 'CIBIL Credit Score', score: cibil >= 750 ? 0.42 : cibil >= 650 ? 0.12 : -0.58, label: `CIBIL: ${cibil}`, cumulative: intercept + 0.35 },
    { feature: 'Debt-to-Income (DTI)', score: dti <= 40 ? 0.38 : dti <= 55 ? -0.15 : -0.72, label: `DTI: ${dti.toFixed(1)}%`, cumulative: intercept + 0.55 },
    { feature: 'Payment History', score: 0.28, label: `${payload.payment_history || 98}% On-Time`, cumulative: intercept + 0.75 },
    { feature: 'Credit Utilization', score: 0.18, label: `${payload.credit_utilization || 20}% Revolving`, cumulative: intercept + 0.90 },
    { feature: 'Tri-Biometric Match', score: 0.14, label: `${payload.biometric_similarity || 98}% Verified`, cumulative: intercept + 1.04 },
  ];

  return {
    system_decision: decision,
    risk_tier: riskTier,
    probability_percentage: (prob * 100).toFixed(1),
    decision_summary: summary,
    decision_reasons: reasons,
    intercept,
    waterfall_bars: waterfallBars,
    positive_factors: waterfallBars.filter((b) => b.score > 0),
    negative_factors: waterfallBars.filter((b) => b.score < 0),
    all_factors: waterfallBars,
    application_id: 'APP-2026-' + Math.floor(1000 + Math.random() * 9000),
    application_no: 'APP-2026-' + Math.floor(1000 + Math.random() * 9000),
  };
};

export const submitApplicationApi = async (payload: any) => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.post('/applications', payload);
      return res.data;
    } catch (e) {
      console.warn('API /applications failed, using client fallback');
    }
  }

  const evalResult = await evaluateUnderwritingApi(payload);
  const appId = evalResult.application_id;

  const newApp: LoanApplication = {
    id: appId,
    userId: 'usr-jeeva-prime',
    user: {
      id: 'usr-jeeva-prime',
      name: payload.name || 'Jeeva Bharathi M',
      email: 'jeeva.bharathi@fintech.gov.in',
    },
    income: payload.income,
    employmentType: payload.employment_type || 'salaried',
    age: payload.age || 20,
    dependents: payload.dependents || 1,
    loanAmount: payload.loan_amount,
    loanTenure: payload.loan_tenure,
    loanPurpose: payload.loan_purpose || 'personal',
    existingLoans: payload.existing_loans || 1,
    monthlyObligations: payload.monthly_obligations || 8000,
    status: evalResult.system_decision as any,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creditProfile: {
      id: 'CRD-' + Math.floor(1000 + Math.random() * 9000),
      applicationId: appId,
      cibilScore: payload.cibil_score || 785,
      paymentHistory: payload.payment_history || 98.5,
      creditUtilization: payload.credit_utilization || 18.0,
      creditHistoryYears: payload.credit_history_years || 4.0,
      recentEnquiries: payload.recent_enquiries || 1,
      verificationStatus: 'VERIFIED',
      provider: 'CIBIL_TRANSUNION',
      consentTimestamp: new Date().toISOString(),
    },
    predictions: [
      {
        id: 'PRD-' + Math.floor(1000 + Math.random() * 9000),
        applicationId: appId,
        predictedClass: evalResult.system_decision === 'APPROVED' ? 'Approved' : evalResult.system_decision === 'NEEDS_REVIEW' ? 'Needs Review' : 'Declined',
        probability: parseFloat(evalResult.probability_percentage) / 100,
        riskLevel: evalResult.risk_tier === 'LOW' ? 'Low' : evalResult.risk_tier === 'MODERATE' ? 'Moderate' : 'High',
        modelVersion: 'v2.1.0-ebm',
        createdAt: new Date().toISOString(),
        factors: evalResult.waterfall_bars.map((b: any, idx: number) => ({
          id: `f-${idx}`,
          feature: b.feature,
          contribution: b.score,
          direction: b.score >= 0 ? 'POSITIVE' : 'NEGATIVE',
          explanation: b.label,
        })),
      },
    ],
    auditLogs: [
      { id: 'aud-1', action: 'APPLICATION_CREATED', timestamp: new Date().toISOString(), metadata: `Submitted loan request ₹${payload.loan_amount}` },
      { id: 'aud-2', action: 'EBM_PREDICTION_GENERATED', timestamp: new Date().toISOString(), metadata: `Decision: ${evalResult.system_decision}` },
    ],
  };

  const currentApps = getStoredApplications();
  const updatedApps = [newApp, ...currentApps.filter((a) => a.id !== appId)];
  saveStoredApplications(updatedApps);

  return {
    ...evalResult,
    application_id: appId,
    application_no: appId,
  };
};

export const getApplicationsListApi = async (status?: string) => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.get('/applications', {
        params: status && status !== 'ALL' ? { status } : {},
      });
      if (res.data && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (e) {
      console.warn('API /applications failed, using client fallback');
    }
  }

  const apps = getStoredApplications();
  if (status && status !== 'ALL') {
    return apps.filter((a) => a.status === status);
  }
  return apps;
};

export const getApplicationDetailApi = async (id: string) => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.get(`/applications/${id}`);
      return res.data;
    } catch (e) {
      console.warn(`API /applications/${id} failed, using client fallback`);
    }
  }

  const apps = getStoredApplications();
  const app = apps.find((a) => a.id === id) || apps[0];
  return {
    application: app,
    audit_trail: app.auditLogs || [],
  };
};

// ============================================================================
// CHIEF UNDERWRITER & AUDIT COCKPIT APIS
// ============================================================================
export const getCockpitStatsApi = async () => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.get('/audit/cockpit-stats');
      return res.data;
    } catch (e) {
      console.warn('API /audit/cockpit-stats failed, using client fallback');
    }
  }

  const apps = getStoredApplications();
  const approved = apps.filter((a) => a.status === 'APPROVED');
  const needsReview = apps.filter((a) => a.status === 'NEEDS_REVIEW');
  const declined = apps.filter((a) => a.status === 'DECLINED');
  const totalDisbursed = approved.reduce((sum, a) => sum + (a.loanAmount || 0), 0);

  return {
    active_officer: {
      name: 'Dr. Arulmozhi Varman',
      id: 'EMP-90421',
      title: 'Chief Underwriting Officer & Regulatory Audit Lead',
      institution: 'FinTech Digital Lending Facility (RBI DLG-2022/2023)',
    },
    stats: {
      total_applications: apps.length,
      approved_count: approved.length,
      needs_review_count: needsReview.length,
      declined_count: declined.length,
      average_dti_percentage: 34.2,
      average_cibil: 742,
      total_disbursed_amount_inr: totalDisbursed,
    },
  };
};

export const submitOfficerOverrideApi = async (payload: {
  application_id: string;
  action: 'APPROVE' | 'REJECT' | 'REQUEST_DOCUMENTS';
  justification: string;
  officer_pin?: string;
}) => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.post('/audit/override', {
        ...payload,
        officer_id: 'EMP-90421',
        officer_name: 'Dr. Arulmozhi Varman',
      });
      return res.data;
    } catch (e) {
      console.warn('API /audit/override failed, using client fallback');
    }
  }

  const apps = getStoredApplications();
  const updated = apps.map((a) => {
    if (a.id === payload.application_id) {
      const newStatus = payload.action === 'APPROVE' ? 'APPROVED' : payload.action === 'REJECT' ? 'DECLINED' : 'NEEDS_REVIEW';
      return {
        ...a,
        status: newStatus as any,
        updatedAt: new Date().toISOString(),
        auditLogs: [
          ...(a.auditLogs || []),
          {
            id: 'aud-' + Date.now(),
            action: `MANUAL_OVERRIDE_${payload.action}`,
            timestamp: new Date().toISOString(),
            metadata: `Officer: Dr. Arulmozhi Varman (EMP-90421). Justification: ${payload.justification}`,
          },
        ],
      };
    }
    return a;
  });
  saveStoredApplications(updated);

  return {
    success: true,
    message: 'Institutional Underwriter Override recorded with immutable digital signature',
    application_id: payload.application_id,
    new_status: payload.action,
    audit_signature: 'ea8ce59137dc3cfbeef52beaf3555b45448c186c661d2ec5a8be20df934cc89b',
  };
};

export const getAuditTrailApi = async (applicationId: string) => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.get(`/audit/trail/${applicationId}`);
      return res.data;
    } catch (e) {
      console.warn('API /audit/trail failed, using client fallback');
    }
  }
  const apps = getStoredApplications();
  const app = apps.find((a) => a.id === applicationId);
  return app?.auditLogs || [];
};

// ============================================================================
// NPCI E-MANDATE & IMPS DISBURSEMENT APIS
// ============================================================================
export const executeDisbursementApi = async (payload: {
  application_id: string;
  bank_name?: string;
  bank_account_number?: string;
  ifsc_code?: string;
}) => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.post('/disbursement/execute', payload);
      return res.data;
    } catch (e) {
      console.warn('API /disbursement/execute failed, using client fallback');
    }
  }

  const apps = getStoredApplications();
  const app = apps.find((a) => a.id === payload.application_id) || apps[0];
  const disburseAmount = app.loanAmount || 500000;

  return {
    status: 'SUCCESS',
    application_id: payload.application_id,
    disbursement_amount: disburseAmount,
    nach_umrn: 'UMRN-2026-NACH-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    mandate_status: 'ACTIVE_REGISTERED',
    imps_rrn: '2026' + Math.floor(10000000 + Math.random() * 90000000),
    imps_utr: 'RBILEND' + Date.now().toString().slice(-10),
    bank_name: payload.bank_name || 'State Bank of India (SBI)',
    bank_account_masked: 'XXXXXXXX4419',
    timestamp: new Date().toISOString(),
  };
};

export const getKfsStatementApi = async (applicationId: string) => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.get(`/disbursement/kfs/${applicationId}`);
      return res.data;
    } catch (e) {
      console.warn('API /disbursement/kfs failed, using client fallback');
    }
  }
  return {
    loan_id: applicationId,
    sanction_date: new Date().toISOString().split('T')[0],
    annual_percentage_rate: 10.5,
    cooling_off_period_days: 3,
    penal_charges_policy: 'Zero penal charge within cooling-off period (100% principal refund)',
    regulated_entity: 'FinTech Digital Lending Facility (Regulated by RBI DLG Guidelines 2022/2023)',
  };
};

// ============================================================================
// MODEL PERFORMANCE & METRICS APIS
// ============================================================================
export const getEbmMetricsApi = async (): Promise<ModelMetrics> => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.get('/underwriting/metrics');
      return res.data;
    } catch (e) {
      console.warn('API /underwriting/metrics failed, using client fallback');
    }
  }
  return {
    ebm: {
      model_name: 'Microsoft InterpretML Explainable Boosting Machine (GA²M)',
      model_version: 'v2.1.0-ebm',
      accuracy: 0.8537,
      precision: 0.8317,
      recall: 0.9882,
      f1_score: 0.9032,
      roc_auc: 0.7520,
      confusion_matrix: [[21, 17], [1, 84]],
    },
    baseline: {
      model_name: 'Logistic Regression Baseline',
      accuracy: 0.7480,
      precision: 0.7850,
      recall: 0.8353,
      f1_score: 0.8208,
      roc_auc: 0.7120,
      confusion_matrix: [[18, 20], [14, 71]],
    },
    feature_importances: [
      { feature: 'Debt-to-Income Ratio (DTI)', importance: 0.412 },
      { feature: 'CIBIL TransUnion Credit Score', importance: 0.385 },
      { feature: '36-Month Payment History Percentage', importance: 0.348 },
      { feature: 'Loan-to-Income Multiplier (LTI)', importance: 0.291 },
      { feature: 'Revolving Credit Card Utilization', importance: 0.256 },
      { feature: 'Monthly Gross Certified Income', importance: 0.224 },
      { feature: 'Reducing Balance Estimated EMI', importance: 0.195 },
      { feature: 'Active Bureau Loan Facilities Count', importance: 0.142 },
    ],
    training_metadata: {
      train_samples: 491,
      test_samples: 123,
      features_used: ['dti_ratio', 'cibil_score', 'payment_history', 'credit_utilization', 'lti_ratio'],
      target: 'approved',
    },
  };
};

export const seedPersonaApi = async (personaId: string) => {
  return { success: true, personaId };
};

// ============================================================================
// COMPATIBILITY ALIASES FOR LEGACY VIEWS & TESTS
// ============================================================================
export const getAdminStatsApi = async (): Promise<any> => {
  const stats = await getCockpitStatsApi();
  return {
    totalApplications: stats.stats.total_applications,
    approvedCount: stats.stats.approved_count,
    needsReviewCount: stats.stats.needs_review_count,
    declinedCount: stats.stats.declined_count,
    averageDti: stats.stats.average_dti_percentage,
    averageCibil: stats.stats.average_cibil,
    totalDisbursed: stats.stats.total_disbursed_amount_inr,
  };
};

export const getAllApplicationsApi = async (page = 1, limit = 20, status?: string) => {
  const list = await getApplicationsListApi(status);
  return {
    applications: list,
    pagination: { total: list.length, page, limit, pages: 1 },
  };
};

export const updateApplicationStatusApi = async (id: string, status: string, reason?: string) => {
  const act = status.toUpperCase().includes('APPROV') ? 'APPROVE' : status.toUpperCase().includes('REJ') || status.toUpperCase().includes('DECLIN') ? 'REJECT' : 'REQUEST_DOCUMENTS';
  return submitOfficerOverrideApi({
    application_id: id,
    action: act as any,
    justification: reason || 'Manual status transition by loan officer',
  });
};

export const getApplicationByIdApi = async (id: string) => {
  const detail = await getApplicationDetailApi(id);
  return detail.application;
};

export const getApplicationsApi = async () => {
  return getApplicationsListApi();
};

export const getDashboardStatsApi = async (): Promise<DashboardStats> => {
  const stats = await getCockpitStatsApi();
  const apps = getStoredApplications();
  return {
    totalApplications: stats.stats.total_applications,
    approvedCount: stats.stats.approved_count,
    reviewCount: stats.stats.needs_review_count,
    declinedCount: stats.stats.declined_count,
    pendingCount: 0,
    averageCibil: stats.stats.average_cibil,
    mlServiceHealthy: true,
    recentApplications: apps,
  };
};

export const getModelMetricsApi = async (): Promise<ModelMetrics> => {
  return getEbmMetricsApi();
};
