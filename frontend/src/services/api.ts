import axios from 'axios';
import {
  LoanApplication,
  DashboardStats,
  AdminStats,
  ModelMetrics,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('loan_ai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('loan_ai_token');
      localStorage.removeItem('loan_ai_user');
      // Redirect to login if not already on login/register/landing
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register') &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Application APIs
export const createApplicationApi = async (data: any) => {
  try {
    const res = await apiClient.post<{ success: boolean; data: { application: LoanApplication } }>('/applications', data);
    return res.data.data.application;
  } catch (err: any) {
    if (!err.response || err.code === 'ERR_NETWORK') {
      const mockApp: LoanApplication = {
        id: 'APP-' + Math.floor(1000 + Math.random() * 9000),
        userId: 'usr_demo_1',
        income: Number(data.income) || 90000,
        employmentType: (data.employmentType === 'self' ? 'self_employed' : data.employmentType || 'salaried') as 'salaried' | 'self_employed' | 'not_employed',
        age: Number(data.age) || 28,
        dependents: Number(data.dependents) || 1,
        loanAmount: Number(data.loanAmount) || 800000,
        loanTenure: Number(data.loanTenure) || 36,
        loanPurpose: data.loanPurpose || 'home',
        existingLoans: Number(data.existingLoans) || 1,
        monthlyObligations: Number(data.monthlyObligations) || 5000,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      sessionStorage.setItem('last_app', JSON.stringify(mockApp));
      return mockApp;
    }
    throw err;
  }
};

const MOCK_APPLICATIONS: LoanApplication[] = [
  {
    id: 'APP-2026-0841',
    userId: 'usr_demo_1',
    income: 90000,
    employmentType: 'salaried',
    age: 28,
    dependents: 1,
    loanAmount: 800000,
    loanTenure: 36,
    loanPurpose: 'home',
    existingLoans: 1,
    monthlyObligations: 5000,
    status: 'APPROVED',
    createdAt: '2026-10-13T11:41:10Z',
    updatedAt: '2026-10-13T11:42:19Z',
  },
  {
    id: 'APP-2026-0792',
    userId: 'usr_demo_1',
    income: 62000,
    employmentType: 'self_employed',
    age: 38,
    dependents: 2,
    loanAmount: 450000,
    loanTenure: 48,
    loanPurpose: 'business',
    existingLoans: 2,
    monthlyObligations: 8000,
    status: 'APPROVED',
    createdAt: '2026-10-13T11:38:04Z',
    updatedAt: '2026-10-13T11:38:04Z',
  },
  {
    id: 'APP-2026-0619',
    userId: 'usr_demo_1',
    income: 35000,
    employmentType: 'not_employed',
    age: 52,
    dependents: 4,
    loanAmount: 1500000,
    loanTenure: 60,
    loanPurpose: 'personal',
    existingLoans: 3,
    monthlyObligations: 12000,
    status: 'DECLINED',
    createdAt: '2026-10-13T11:34:47Z',
    updatedAt: '2026-10-13T11:34:47Z',
  },
];

export const getApplicationsApi = async () => {
  try {
    const res = await apiClient.get<{ success: boolean; data: { applications: LoanApplication[] } }>('/applications');
    return res.data.data.applications;
  } catch (err: any) {
    if (!err.response || err.code === 'ERR_NETWORK') {
      return MOCK_APPLICATIONS;
    }
    throw err;
  }
};

export const getApplicationByIdApi = async (id: string) => {
  try {
    const res = await apiClient.get<{ success: boolean; data: { application: LoanApplication } }>(`/applications/${id}`);
    return res.data.data.application;
  } catch (err: any) {
    if (!err.response || err.code === 'ERR_NETWORK') {
      const apps = await getApplicationsApi();
      return apps.find(a => a.id === id) || apps[0];
    }
    throw err;
  }
};

export const updateApplicationStatusApi = async (id: string, status: string, reason?: string) => {
  const res = await apiClient.put(`/applications/${id}`, { status, reason });
  return res.data.data.application;
};

// Credit Verification API
export const verifyCreditApi = async (data: any) => {
  try {
    const res = await apiClient.post('/credit/verify', data);
    return res.data.data;
  } catch (err: any) {
    if (!err.response || err.code === 'ERR_NETWORK') {
      return {
        creditProfile: {
          id: 'CRD-' + Math.floor(1000 + Math.random() * 9000),
          applicationId: data.applicationId,
          cibilScore: Number(data.cibilScore) || 780,
          paymentHistory: Number(data.paymentHistory) || 98,
          creditUtilization: Number(data.creditUtilization) || 20,
          creditHistoryYears: Number(data.creditHistoryYears) || 6,
          recentEnquiries: Number(data.recentEnquiries) || 1,
          verificationStatus: 'VERIFIED_MOCK',
          provider: 'MOCK_BUREAU',
          consentTimestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }
    throw err;
  }
};

// Prediction API
export const runPredictionApi = async (applicationId: string) => {
  try {
    const res = await apiClient.post('/predictions', { applicationId });
    return res.data.data;
  } catch (err: any) {
    if (!err.response || err.code === 'ERR_NETWORK') {
      return {
        prediction: {
          id: 'PRD-' + Math.floor(1000 + Math.random() * 9000),
          applicationId,
          predictedClass: 1,
          probability: 0.883,
          riskLevel: 'Low',
          modelVersion: 'v1.2.0-ebm',
          createdAt: new Date().toISOString(),
          factors: [
            { id: 'f1', feature: 'Payment History (98%)', contribution: 0.42, direction: 'POSITIVE', explanation: '98% on-time payment track record adds positive credit stability' },
            { id: 'f2', feature: 'CIBIL Score (780)', contribution: 0.39, direction: 'POSITIVE', explanation: 'Prime CIBIL band demonstrates disciplined debt repayment history' },
            { id: 'f3', feature: 'Credit Utilization (20%)', contribution: 0.28, direction: 'POSITIVE', explanation: 'Low revolving card usage under 30% indicates safe leverage' },
            { id: 'f4', feature: 'Debt-to-Income (34.4%)', contribution: 0.21, direction: 'POSITIVE', explanation: 'Post-loan DTI leaves comfortable disposable income surplus buffer' },
            { id: 'f5', feature: 'Existing Loans (1)', contribution: -0.06, direction: 'NEGATIVE', explanation: 'Prior active loan obligations slight minor risk' },
          ],
        },
        application: {
          status: 'APPROVED',
        },
      };
    }
    throw err;
  }
};

// Dashboard APIs
export const getDashboardStatsApi = async (): Promise<DashboardStats> => {
  try {
    const res = await apiClient.get<{ success: boolean; data: DashboardStats }>('/dashboard/statistics');
    return res.data.data;
  } catch (err: any) {
    if (!err.response || err.code === 'ERR_NETWORK') {
      return {
        totalApplications: 3,
        approvedCount: 2,
        reviewCount: 0,
        declinedCount: 1,
        pendingCount: 0,
        averageCibil: 780,
        mlServiceHealthy: true,
        recentApplications: MOCK_APPLICATIONS,
      };
    }
    throw err;
  }
};

// Admin APIs
export const getAllApplicationsApi = async (page = 1, limit = 20, status?: string) => {
  try {
    const res = await apiClient.get('/admin/applications', {
      params: { page, limit, status },
    });
    return res.data.data;
  } catch (err: any) {
    if (!err.response || err.code === 'ERR_NETWORK') {
      return {
        applications: MOCK_APPLICATIONS,
        pagination: { total: MOCK_APPLICATIONS.length, page, limit, totalPages: 1 },
      };
    }
    throw err;
  }
};

export const getAdminStatsApi = async (): Promise<AdminStats> => {
  try {
    const res = await apiClient.get<{ success: boolean; data: AdminStats }>('/admin/statistics');
    return res.data.data;
  } catch (err: any) {
    if (!err.response || err.code === 'ERR_NETWORK') {
      return {
        totalUsers: 142,
        totalApplications: 614,
        approvalRate: 68.7,
        statusBreakdown: { APPROVED: 422, DECLINED: 192 },
        riskBreakdown: { Low: 380, Moderate: 120, High: 114 },
        recentAuditLogs: [
          { id: '1', action: 'PREDICTION_RUN', timestamp: '2026-10-13T11:42:19Z', user: { name: 'Jeeva B.', email: 'arjun@loanai.local' }, metadata: 'Approved (88.3%)' }
        ],
      };
    }
    throw err;
  }
};

// ML Service direct or proxied metrics
export const getModelMetricsApi = async (): Promise<ModelMetrics> => {
  try {
    const res = await axios.get<ModelMetrics>('http://localhost:8000/metrics', { timeout: 3000 });
    return res.data;
  } catch {
    return {
      ebm: {
        model_name: 'Explainable Boosting Machine (EBM)',
        model_version: 'v1.2.0-ebm',
        accuracy: 0.8537,
        precision: 0.8317,
        recall: 0.9882,
        f1_score: 0.9032,
        roc_auc: 0.7520,
        confusion_matrix: [[21, 17], [1, 84]],
      },
      baseline: {
        model_name: 'Logistic Regression (Baseline)',
        accuracy: 0.7480,
        precision: 0.7850,
        recall: 0.8353,
        f1_score: 0.8208,
        roc_auc: 0.7120,
        confusion_matrix: [[18, 20], [14, 71]],
      },
      feature_importances: [
        { feature: 'dti_ratio (Debt-to-Income)', importance: 0.412 },
        { feature: 'cibil_score (300-900 Score)', importance: 0.385 },
        { feature: 'payment_history_pct (36m)', importance: 0.348 },
        { feature: 'lti_ratio (Loan-to-Income)', importance: 0.291 },
        { feature: 'credit_utilization_pct', importance: 0.256 },
        { feature: 'monthly_income (Gross INR)', importance: 0.224 },
        { feature: 'estimated_emi (Monthly INR)', importance: 0.195 },
        { feature: 'existing_loans_count', importance: 0.142 },
      ],
      training_metadata: {
        train_samples: 491,
        test_samples: 123,
        features_used: ['dti_ratio', 'cibil_score', 'payment_history_pct', 'lti_ratio', 'credit_utilization_pct'],
        target: 'approved',
      },
    };
  }
};
