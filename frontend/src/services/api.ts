import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('loan_xai_token') || localStorage.getItem('loan_ai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// DigiLocker / Meri Pehchaan SSO APIs
export const requestMobileOtpApi = async (mobile: string) => {
  const res = await apiClient.post('/auth/digilocker/mobile-otp', { mobile });
  return res.data;
};

export const verifyMobileOtpApi = async (mobile: string, otp: string) => {
  const res = await apiClient.post('/auth/digilocker/verify-otp', { mobile, otp });
  return res.data;
};

export const signinUsernamePinApi = async (username: string, pin: string) => {
  const res = await apiClient.post('/auth/digilocker/username-pin', { username, pin });
  return res.data;
};

export const signinOtherIdApi = async (idType: string, idNumber: string) => {
  const res = await apiClient.post('/auth/digilocker/other-id', {
    id_type: idType,
    id_number: idNumber,
    consent_given: true,
  });
  return res.data;
};

// KYC & Document Consistency APIs
export const getPersonaKycApi = async (personaId: string) => {
  const res = await apiClient.get(`/kyc/persona-kyc/${personaId}`);
  return res.data;
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
  const res = await apiClient.post('/kyc/ocr-cross-check', data);
  return res.data;
};

// Biometric APIs
export const getLivenessChallengeApi = async () => {
  const res = await apiClient.get('/biometrics/liveness-challenge');
  return res.data;
};

export const verifyTriBiometricApi = async (payload: {
  persona_id?: string;
  live_webcam_image_b64?: string;
  force_spoof_simulation?: boolean;
}) => {
  const res = await apiClient.post('/biometrics/verify-tri-biometric', payload);
  return res.data;
};

// Underwriting & EBM APIs
export const evaluateUnderwritingApi = async (payload: any) => {
  const res = await apiClient.post('/underwriting/evaluate', payload);
  return res.data;
};

export const getEbmMetricsApi = async () => {
  const res = await apiClient.get('/underwriting/metrics');
  return res.data;
};

// Application APIs
export const submitApplicationApi = async (payload: any) => {
  const res = await apiClient.post('/applications', payload);
  return res.data;
};

export const getApplicationsListApi = async (status?: string) => {
  const res = await apiClient.get('/applications', {
    params: status && status !== 'ALL' ? { status } : {},
  });
  return res.data;
};

export const getApplicationDetailApi = async (id: string) => {
  const res = await apiClient.get(`/applications/${id}`);
  return res.data;
};

// Chief Underwriter & Auditor Cockpit APIs
export const getCockpitStatsApi = async () => {
  const res = await apiClient.get('/audit/cockpit-stats');
  return res.data;
};

export const submitOfficerOverrideApi = async (payload: {
  application_id: string;
  action: 'APPROVE' | 'REJECT' | 'REQUEST_DOCUMENTS';
  justification: string;
  officer_pin?: string;
}) => {
  const res = await apiClient.post('/audit/override', {
    ...payload,
    officer_id: 'EMP-90421',
    officer_name: 'Dr. Arulmozhi Varman',
  });
  return res.data;
};

export const getAuditTrailApi = async (applicationId: string) => {
  const res = await apiClient.get(`/audit/trail/${applicationId}`);
  return res.data;
};

// NPCI e-Mandate & IMPS Disbursement APIs
export const executeDisbursementApi = async (payload: {
  application_id: string;
  bank_name?: string;
  bank_account_number?: string;
  ifsc_code?: string;
}) => {
  const res = await apiClient.post('/disbursement/execute', payload);
  return res.data;
};

export const getKfsStatementApi = async (applicationId: string) => {
  const res = await apiClient.get(`/disbursement/kfs/${applicationId}`);
  return res.data;
};

// Personas APIs
export const getDemoPersonasApi = async () => {
  const res = await apiClient.get('/personas');
  return res.data;
};

export const seedPersonaApi = async (personaId: string) => {
  const res = await apiClient.post(`/personas/${personaId}/seed`);
  return res.data;
};


// Compatibility aliases for legacy views
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

export const getDashboardStatsApi = async (): Promise<any> => {
  const stats = await getCockpitStatsApi();
  return {
    totalApplications: stats.stats.total_applications,
    approvedCount: stats.stats.approved_count,
    needsReviewCount: stats.stats.needs_review_count,
    declinedCount: stats.stats.declined_count,
    activeFacilityAmount: stats.stats.total_disbursed_amount_inr,
  };
};

export const getModelMetricsApi = async (): Promise<any> => {
  return getEbmMetricsApi();
};
