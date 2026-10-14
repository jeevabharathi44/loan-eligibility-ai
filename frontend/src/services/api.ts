import axios from 'axios';
import {
  LoanApplication,
  DashboardStats,
  AdminStats,
  ModelMetrics,
  CreditProfile,
  Prediction,
  VerificationStatus,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const isStaticDeployment = () => {
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

export const shouldUseMock = (err?: any) => {
  if (isStaticDeployment()) return true;
  if (!err) return false;
  if (!err.response || err.code === 'ERR_NETWORK') return true;
  if (err.response?.status === 404 || err.response?.status === 405) return true;
  return false;
};

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
    // Only redirect if non-static and authentic 401
    if (error.response?.status === 401 && !isStaticDeployment()) {
      localStorage.removeItem('loan_ai_token');
      localStorage.removeItem('loan_ai_user');
      if (
        !window.location.hash.includes('/login') &&
        !window.location.hash.includes('/register') &&
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(error);
  }
);

export const INITIAL_MOCK_APPLICATIONS: LoanApplication[] = [
  {
    id: 'APP-2026-0841',
    userId: 'usr_demo_1',
    user: {
      id: 'usr_demo_1',
      name: 'Arjun Sharma',
      email: 'arjun@loanai.local',
    },
    income: 90000,
    employmentType: 'salaried',
    age: 30,
    dependents: 1,
    loanAmount: 800000,
    loanTenure: 36,
    loanPurpose: 'home',
    existingLoans: 1,
    monthlyObligations: 5000,
    status: 'APPROVED',
    createdAt: '2026-10-13T11:41:10Z',
    updatedAt: '2026-10-13T11:42:19Z',
    creditProfile: {
      id: 'CRD-1001',
      applicationId: 'APP-2026-0841',
      cibilScore: 780,
      paymentHistory: 98,
      creditUtilization: 20,
      creditHistoryYears: 8,
      recentEnquiries: 1,
      verificationStatus: 'VERIFIED',
      provider: 'CIBIL_TRANSUNION',
      consentTimestamp: '2026-10-13T11:41:20Z',
    },
    predictions: [
      {
        id: 'PRD-1001',
        applicationId: 'APP-2026-0841',
        predictedClass: 'Approved',
        probability: 0.883,
        riskLevel: 'Low',
        modelVersion: 'v1.2.0-ebm',
        createdAt: '2026-10-13T11:42:19Z',
        factors: [
          { id: 'f1', feature: 'Payment History (98%)', contribution: 0.42, direction: 'POSITIVE', explanation: '98% on-time payment track record adds positive credit stability' },
          { id: 'f2', feature: 'CIBIL Score (780)', contribution: 0.39, direction: 'POSITIVE', explanation: 'Prime CIBIL band demonstrates disciplined debt repayment history' },
          { id: 'f3', feature: 'Credit Utilization (20%)', contribution: 0.28, direction: 'POSITIVE', explanation: 'Low revolving card usage under 30% indicates safe leverage' },
          { id: 'f4', feature: 'Debt-to-Income (34.4%)', contribution: 0.21, direction: 'POSITIVE', explanation: 'Post-loan DTI leaves comfortable disposable income surplus buffer' },
          { id: 'f5', feature: 'Existing Loans (1)', contribution: -0.06, direction: 'NEGATIVE', explanation: 'Prior active loan obligations slight minor risk' },
        ],
      },
    ],
    auditLogs: [
      { id: 'aud-1', action: 'APPLICATION_CREATED', timestamp: '2026-10-13T11:41:10Z', metadata: 'Applied for ₹8,00,000 home loan' },
      { id: 'aud-2', action: 'CREDIT_VERIFIED', timestamp: '2026-10-13T11:41:20Z', metadata: 'TransUnion score 780 verified' },
      { id: 'aud-3', action: 'PREDICTION_GENERATED', timestamp: '2026-10-13T11:42:19Z', metadata: 'Model v1.2.0-ebm: Approved (88.3%)' },
    ],
  },
  {
    id: 'APP-2026-0792',
    userId: 'usr_demo_1',
    user: {
      id: 'usr_demo_2',
      name: 'Meena Patel',
      email: 'meena@loanai.local',
    },
    income: 45000,
    employmentType: 'self_employed',
    age: 42,
    dependents: 2,
    loanAmount: 1200000,
    loanTenure: 48,
    loanPurpose: 'business',
    existingLoans: 2,
    monthlyObligations: 8000,
    status: 'NEEDS_REVIEW',
    createdAt: '2026-10-13T11:38:04Z',
    updatedAt: '2026-10-13T11:38:04Z',
    creditProfile: {
      id: 'CRD-1002',
      applicationId: 'APP-2026-0792',
      cibilScore: 690,
      paymentHistory: 88,
      creditUtilization: 55,
      creditHistoryYears: 5,
      recentEnquiries: 3,
      verificationStatus: 'VERIFIED',
      provider: 'CIBIL_TRANSUNION',
      consentTimestamp: '2026-10-13T11:38:10Z',
    },
    predictions: [
      {
        id: 'PRD-1002',
        applicationId: 'APP-2026-0792',
        predictedClass: 'Needs Review',
        probability: 0.621,
        riskLevel: 'Moderate',
        modelVersion: 'v1.2.0-ebm',
        createdAt: '2026-10-13T11:38:04Z',
        factors: [
          { id: 'f1', feature: 'Payment History (88%)', contribution: 0.18, direction: 'POSITIVE', explanation: 'Fair payment track record with minor delay instances' },
          { id: 'f2', feature: 'Credit Utilization (55%)', contribution: -0.24, direction: 'NEGATIVE', explanation: 'Credit card utilization above 50% lowers score buffer' },
          { id: 'f3', feature: 'Debt-to-Income (54.2%)', contribution: -0.19, direction: 'NEGATIVE', explanation: 'High combined debt servicing to net business earnings' },
        ],
      },
    ],
    auditLogs: [
      { id: 'aud-4', action: 'APPLICATION_CREATED', timestamp: '2026-10-13T11:38:04Z', metadata: 'Applied for ₹12,00,000 business loan' },
      { id: 'aud-5', action: 'PREDICTION_GENERATED', timestamp: '2026-10-13T11:38:04Z', metadata: 'EBM model flagged for underwriter review' },
    ],
  },
  {
    id: 'APP-2026-0619',
    userId: 'usr_demo_1',
    user: {
      id: 'usr_demo_3',
      name: 'Rajan Verma',
      email: 'rajan@loanai.local',
    },
    income: 25000,
    employmentType: 'not_employed',
    age: 55,
    dependents: 4,
    loanAmount: 3000000,
    loanTenure: 60,
    loanPurpose: 'personal',
    existingLoans: 3,
    monthlyObligations: 12000,
    status: 'DECLINED',
    createdAt: '2026-10-13T11:34:47Z',
    updatedAt: '2026-10-13T11:34:47Z',
    creditProfile: {
      id: 'CRD-1003',
      applicationId: 'APP-2026-0619',
      cibilScore: 520,
      paymentHistory: 60,
      creditUtilization: 90,
      creditHistoryYears: 2,
      recentEnquiries: 6,
      verificationStatus: 'VERIFIED',
      provider: 'CIBIL_TRANSUNION',
      consentTimestamp: '2026-10-13T11:34:50Z',
    },
    predictions: [
      {
        id: 'PRD-1003',
        applicationId: 'APP-2026-0619',
        predictedClass: 'Declined',
        probability: 0.194,
        riskLevel: 'High',
        modelVersion: 'v1.2.0-ebm',
        createdAt: '2026-10-13T11:34:47Z',
        factors: [
          { id: 'f1', feature: 'CIBIL Score (520)', contribution: -0.58, direction: 'NEGATIVE', explanation: 'Score below 600 indicates severe delinquency risk' },
          { id: 'f2', feature: 'Credit Utilization (90%)', contribution: -0.38, direction: 'NEGATIVE', explanation: 'Maxed-out credit facilities suggest acute liquidity strain' },
          { id: 'f3', feature: 'Debt-to-Income (128%)', contribution: -0.44, direction: 'NEGATIVE', explanation: 'Proposed loan servicing exceeds monthly reported income' },
        ],
      },
    ],
    auditLogs: [
      { id: 'aud-6', action: 'APPLICATION_CREATED', timestamp: '2026-10-13T11:34:47Z', metadata: 'Applied for ₹30,00,000 personal loan' },
      { id: 'aud-7', action: 'PREDICTION_GENERATED', timestamp: '2026-10-13T11:34:47Z', metadata: 'High risk rating: automated rejection' },
    ],
  },
];

const getMockApps = (): LoanApplication[] => {
  try {
    const raw = localStorage.getItem('loan_ai_applications');
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_MOCK_APPLICATIONS;
};

const saveMockApps = (apps: LoanApplication[]) => {
  try {
    localStorage.setItem('loan_ai_applications', JSON.stringify(apps));
  } catch {}
};

// Application APIs
export const createApplicationApi = async (data: any): Promise<LoanApplication> => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.post<{ success: boolean; data: { application: LoanApplication } }>('/applications', data);
      return res.data.data.application;
    } catch (err: any) {
      if (!shouldUseMock(err)) throw err;
    }
  }

  const apps = getMockApps();
  let userName = 'Jeeva Bharathi M';
  let userEmail = 'arjun@loanai.local';
  try {
    const storedUser = localStorage.getItem('loan_ai_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.name) userName = parsed.name;
      if (parsed.email) userEmail = parsed.email;
    }
  } catch {}

  const mockApp: LoanApplication = {
    id: 'APP-' + Math.floor(1000 + Math.random() * 9000),
    userId: 'usr_demo_1',
    user: {
      id: 'usr_demo_1',
      name: userName,
      email: userEmail,
    },
    income: Number(data.income) || 90000,
    employmentType: (data.employmentType === 'self' ? 'self_employed' : data.employmentType || 'salaried') as 'salaried' | 'self_employed' | 'not_employed',
    age: Number(data.age) || 30,
    dependents: Number(data.dependents) || 1,
    loanAmount: Number(data.loanAmount) || 800000,
    loanTenure: Number(data.loanTenure) || 36,
    loanPurpose: data.loanPurpose || 'home',
    existingLoans: Number(data.existingLoans) || 1,
    monthlyObligations: Number(data.monthlyObligations) || 5000,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    auditLogs: [
      {
        id: 'aud-' + Date.now(),
        action: 'APPLICATION_CREATED',
        timestamp: new Date().toISOString(),
        metadata: `Submitted ₹${Number(data.loanAmount || 800000).toLocaleString('en-IN')} ${data.loanPurpose || 'home'} loan application`,
      },
    ],
  };

  saveMockApps([mockApp, ...apps]);
  sessionStorage.setItem('last_app', JSON.stringify(mockApp));
  return mockApp;
};

export const getApplicationsApi = async (): Promise<LoanApplication[]> => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.get<{ success: boolean; data: { applications: LoanApplication[] } }>('/applications');
      return res.data.data.applications;
    } catch (err: any) {
      if (!shouldUseMock(err)) throw err;
    }
  }
  return getMockApps();
};

export const getApplicationByIdApi = async (id: string): Promise<LoanApplication> => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.get<{ success: boolean; data: { application: LoanApplication } }>(`/applications/${id}`);
      return res.data.data.application;
    } catch (err: any) {
      if (!shouldUseMock(err)) throw err;
    }
  }
  const apps = getMockApps();
  return apps.find((a) => a.id === id) || apps[0];
};

export const updateApplicationStatusApi = async (id: string, status: string, reason?: string): Promise<LoanApplication | { id: string; status: string; updatedAt: string }> => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.put(`/applications/${id}`, { status, reason });
      return res.data.data.application;
    } catch (err: any) {
      if (!shouldUseMock(err)) throw err;
    }
  }

  const apps = getMockApps();
  const target = apps.find((a) => a.id === id);
  if (target) {
    target.status = status as any;
    target.updatedAt = new Date().toISOString();
    target.auditLogs = [
      ...(target.auditLogs || []),
      {
        id: 'aud-' + Date.now(),
        action: 'STATUS_OVERRIDDEN',
        timestamp: new Date().toISOString(),
        metadata: `Underwriter status change: ${status}. Reason: ${reason || 'Manual review'}`,
      },
    ];
    saveMockApps(apps);
    return target;
  }
  return { id, status, updatedAt: new Date().toISOString() };
};

// Credit Verification API
export const verifyCreditApi = async (data: any): Promise<{ creditProfile: CreditProfile }> => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.post('/credit/verify', data);
      return res.data.data;
    } catch (err: any) {
      if (!shouldUseMock(err)) throw err;
    }
  }

  const cp: CreditProfile = {
    id: 'CRD-' + Math.floor(1000 + Math.random() * 9000),
    applicationId: data.applicationId,
    cibilScore: Number(data.cibilScore) || 780,
    paymentHistory: Number(data.paymentHistory) || 98,
    creditUtilization: Number(data.creditUtilization) || 20,
    creditHistoryYears: Number(data.creditHistoryYears) || 6,
    recentEnquiries: Number(data.recentEnquiries) || 1,
    verificationStatus: 'VERIFIED' as VerificationStatus,
    provider: 'CIBIL_TRANSUNION',
    consentTimestamp: new Date().toISOString(),
  };

  const apps = getMockApps();
  const target = apps.find((a) => a.id === data.applicationId);
  if (target) {
    target.creditProfile = cp;
    target.auditLogs = [
      ...(target.auditLogs || []),
      {
        id: 'aud-' + Date.now(),
        action: 'CREDIT_VERIFIED',
        timestamp: new Date().toISOString(),
        metadata: `CIBIL ${cp.cibilScore} verified via bureau gateway`,
      },
    ];
    saveMockApps(apps);
  }

  return { creditProfile: cp };
};

// Prediction API
export const runPredictionApi = async (applicationId: string): Promise<any> => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.post('/predictions', { applicationId });
      return res.data.data;
    } catch (err: any) {
      if (!shouldUseMock(err)) throw err;
    }
  }

  const apps = getMockApps();
  const app = apps.find((a) => a.id === applicationId) || apps[0];
  const cp = app?.creditProfile;
  const score = cp ? cp.cibilScore : 780;
  const paymentHistory = cp ? cp.paymentHistory : 98;
  const util = cp ? cp.creditUtilization : 20;

  let predictedClass: 'Approved' | 'Needs Review' | 'Declined' = 'Approved';
  let probability = 0.883;
  let riskLevel: 'Low' | 'Moderate' | 'High' = 'Low';
  let newStatus: 'APPROVED' | 'NEEDS_REVIEW' | 'DECLINED' = 'APPROVED';

  if (score >= 740) {
    predictedClass = 'Approved';
    probability = 0.88 + Math.min(0.09, (score - 740) * 0.0006);
    riskLevel = 'Low';
    newStatus = 'APPROVED';
  } else if (score >= 640) {
    predictedClass = 'Needs Review';
    probability = 0.58 + (score - 640) * 0.001;
    riskLevel = 'Moderate';
    newStatus = 'NEEDS_REVIEW';
  } else {
    predictedClass = 'Declined';
    probability = 0.22 + Math.max(0, (score - 300) * 0.0004);
    riskLevel = 'High';
    newStatus = 'DECLINED';
  }

  const probPercent = Math.round(probability * 1000) / 10;

  const factors = [
    {
      id: 'f1',
      feature: `Payment History (${paymentHistory}%)`,
      contribution: paymentHistory >= 90 ? 0.42 : paymentHistory >= 75 ? 0.12 : -0.35,
      direction: paymentHistory >= 80 ? ('POSITIVE' as const) : ('NEGATIVE' as const),
      explanation:
        paymentHistory >= 90
          ? `${paymentHistory}% on-time payment track record adds positive credit stability`
          : 'Late repayment marks increase risk',
    },
    {
      id: 'f2',
      feature: `CIBIL Score (${score})`,
      contribution: score >= 750 ? 0.39 : score >= 650 ? 0.08 : -0.45,
      direction: score >= 700 ? ('POSITIVE' as const) : ('NEGATIVE' as const),
      explanation:
        score >= 750
          ? 'Prime CIBIL band demonstrates disciplined debt repayment history'
          : 'Score below prime band indicates credit risk',
    },
    {
      id: 'f3',
      feature: `Credit Utilization (${util}%)`,
      contribution: util <= 30 ? 0.28 : util <= 50 ? 0.05 : -0.32,
      direction: util <= 35 ? ('POSITIVE' as const) : ('NEGATIVE' as const),
      explanation:
        util <= 30
          ? 'Low revolving card usage under 30% indicates safe leverage'
          : 'High credit card utilization lowers score buffer',
    },
    {
      id: 'f4',
      feature: 'Debt-to-Income Ratio',
      contribution: 0.21,
      direction: 'POSITIVE' as const,
      explanation: 'Post-loan DTI leaves comfortable disposable income surplus buffer',
    },
    {
      id: 'f5',
      feature: 'Active Loans Vintage',
      contribution: -0.06,
      direction: 'NEGATIVE' as const,
      explanation: 'Prior active borrowing facilities slight minor risk',
    },
  ];

  const prediction: Prediction = {
    id: 'PRD-' + Math.floor(1000 + Math.random() * 9000),
    applicationId,
    predictedClass,
    probability,
    riskLevel,
    modelVersion: 'v1.2.0-ebm',
    createdAt: new Date().toISOString(),
    factors,
  };

  if (app) {
    app.status = newStatus;
    app.predictions = [prediction];
    app.auditLogs = [
      ...(app.auditLogs || []),
      {
        id: 'aud-' + Date.now(),
        action: 'PREDICTION_GENERATED',
        timestamp: new Date().toISOString(),
        metadata: `EBM Model v1.2.0-ebm: ${predictedClass} (${probPercent}%)`,
      },
    ];
    saveMockApps(apps);
  }

  return {
    predictionId: prediction.id,
    applicationId,
    predicted_class: predictedClass,
    predictedClass,
    probability,
    probabilityPercentage: probPercent,
    riskLevel,
    risk_level: riskLevel,
    modelVersion: 'v1.2.0-ebm',
    model_version: 'v1.2.0-ebm',
    modelName: 'Explainable Boosting Machine (EBM)',
    all_factors: factors,
    allFactors: factors,
    factors,
    disclaimer:
      'This assessment is an AI-assisted risk assessment for demonstration/research purposes and is not a guaranteed loan approval or denial.',
    prediction,
    application: {
      status: newStatus,
    },
  };
};

// Dashboard APIs
export const getDashboardStatsApi = async (): Promise<DashboardStats> => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.get<{ success: boolean; data: DashboardStats }>('/dashboard/statistics');
      return res.data.data;
    } catch (err: any) {
      if (!shouldUseMock(err)) throw err;
    }
  }

  const apps = getMockApps();
  const approved = apps.filter((a) => a.status === 'APPROVED').length;
  const review = apps.filter((a) => a.status === 'NEEDS_REVIEW').length;
  const declined = apps.filter((a) => a.status === 'DECLINED').length;
  const pending = apps.filter((a) => a.status === 'PENDING').length;

  const validCibils = apps.map((a) => a.creditProfile?.cibilScore).filter(Boolean) as number[];
  const avgCibil = validCibils.length
    ? Math.round(validCibils.reduce((a, b) => a + b, 0) / validCibils.length)
    : 765;

  return {
    totalApplications: apps.length,
    approvedCount: approved,
    reviewCount: review,
    declinedCount: declined,
    pendingCount: pending,
    averageCibil: avgCibil,
    mlServiceHealthy: true,
    recentApplications: apps,
  };
};

// Admin APIs
export const getAllApplicationsApi = async (page = 1, limit = 20, status?: string) => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.get('/admin/applications', {
        params: { page, limit, status },
      });
      return res.data.data;
    } catch (err: any) {
      if (!shouldUseMock(err)) throw err;
    }
  }
  const apps = getMockApps();
  const filtered = status ? apps.filter((a) => a.status === status) : apps;
  return {
    applications: filtered,
    pagination: { total: filtered.length, page, limit, totalPages: 1 },
  };
};

export const getAdminStatsApi = async (): Promise<AdminStats> => {
  if (!isStaticDeployment()) {
    try {
      const res = await apiClient.get<{ success: boolean; data: AdminStats }>('/admin/statistics');
      return res.data.data;
    } catch (err: any) {
      if (!shouldUseMock(err)) throw err;
    }
  }

  const apps = getMockApps();
  const approved = apps.filter((a) => a.status === 'APPROVED').length;
  const total = Math.max(apps.length, 1);
  const rate = Math.round((approved / total) * 1000) / 10;

  return {
    totalUsers: 142,
    totalApplications: 614,
    approvalRate: rate || 68.7,
    statusBreakdown: { APPROVED: 422, DECLINED: 192 },
    riskBreakdown: { Low: 380, Moderate: 120, High: 114 },
    recentAuditLogs: [
      {
        id: '1',
        action: 'PREDICTION_RUN',
        timestamp: '2026-10-13T11:42:19Z',
        user: { name: 'Jeeva Bharathi M', email: 'arjun@loanai.local' },
        metadata: 'Approved (88.3%)',
      },
    ],
  };
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
        roc_auc: 0.752,
        confusion_matrix: [
          [21, 17],
          [1, 84],
        ],
      },
      baseline: {
        model_name: 'Logistic Regression (Baseline)',
        accuracy: 0.748,
        precision: 0.785,
        recall: 0.8353,
        f1_score: 0.8208,
        roc_auc: 0.712,
        confusion_matrix: [
          [18, 20],
          [14, 71],
        ],
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
