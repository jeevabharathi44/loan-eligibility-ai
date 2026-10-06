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
  const res = await apiClient.post<{ success: boolean; data: { application: LoanApplication } }>('/applications', data);
  return res.data.data.application;
};

export const getApplicationsApi = async () => {
  const res = await apiClient.get<{ success: boolean; data: { applications: LoanApplication[] } }>('/applications');
  return res.data.data.applications;
};

export const getApplicationByIdApi = async (id: string) => {
  const res = await apiClient.get<{ success: boolean; data: { application: LoanApplication } }>(`/applications/${id}`);
  return res.data.data.application;
};

export const updateApplicationStatusApi = async (id: string, status: string, reason?: string) => {
  const res = await apiClient.put(`/applications/${id}`, { status, reason });
  return res.data.data.application;
};

// Credit Verification API
export const verifyCreditApi = async (data: any) => {
  const res = await apiClient.post('/credit/verify', data);
  return res.data.data;
};

// Prediction API
export const runPredictionApi = async (applicationId: string) => {
  const res = await apiClient.post('/predictions', { applicationId });
  return res.data.data;
};

// Dashboard APIs
export const getDashboardStatsApi = async (): Promise<DashboardStats> => {
  const res = await apiClient.get<{ success: boolean; data: DashboardStats }>('/dashboard/statistics');
  return res.data.data;
};

// Admin APIs
export const getAllApplicationsApi = async (page = 1, limit = 20, status?: string) => {
  const res = await apiClient.get('/admin/applications', {
    params: { page, limit, status },
  });
  return res.data.data;
};

export const getAdminStatsApi = async (): Promise<AdminStats> => {
  const res = await apiClient.get<{ success: boolean; data: AdminStats }>('/admin/statistics');
  return res.data.data;
};

// ML Service direct or proxied metrics
export const getModelMetricsApi = async (): Promise<ModelMetrics> => {
  // Can be fetched from ML service directly or via backend admin stats
  try {
    const res = await axios.get<ModelMetrics>('http://localhost:8000/metrics', { timeout: 3000 });
    return res.data;
  } catch {
    const adminRes = await apiClient.get<{ success: boolean; data: AdminStats }>('/admin/statistics');
    if (adminRes.data.data.modelMetrics) {
      return adminRes.data.data.modelMetrics;
    }
    throw new Error('Unable to fetch model metrics');
  }
};
