import axios from 'axios';
import { config } from '../config';

export interface MLPredictionInput {
  name?: string;
  age: number;
  employment_type: string;
  income: number;
  dependents: number;
  existing_loans: number;
  monthly_obligations: number;
  loan_amount: number;
  loan_tenure: number;
  loan_purpose: string;
  cibil_score: number;
  payment_history: number;
  credit_utilization: number;
  credit_history_years: number;
  recent_enquiries: number;
}

export interface MLPredictionFactor {
  feature: string;
  feature_label: string;
  value: any;
  contribution: number;
  direction: 'positive' | 'negative';
  explanation: string;
}

export interface MLPredictionResponse {
  predicted_class: 'Approved' | 'Needs Review' | 'Declined';
  probability: number;
  probability_percentage: number;
  risk_level: 'Low' | 'Moderate' | 'High';
  model_version: string;
  model_name: string;
  positive_factors: MLPredictionFactor[];
  negative_factors: MLPredictionFactor[];
  all_factors: MLPredictionFactor[];
  derived_features: {
    estimated_emi: number;
    debt_to_income_ratio: number;
    loan_to_income_ratio: number;
    loan_amount_inr: number;
  };
  disclaimer: string;
}

export class MLServiceClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.mlServiceUrl;
  }

  public async getPrediction(payload: MLPredictionInput): Promise<MLPredictionResponse> {
    try {
      const response = await axios.post<MLPredictionResponse>(
        `${this.baseUrl}/predict`,
        payload,
        { timeout: 10000 }
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`ML Service responded with error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        throw new Error(`ML Service is unreachable at ${this.baseUrl}. Please check that the ML FastAPI service is running.`);
      }
      throw new Error(`ML prediction error: ${error.message}`);
    }
  }

  public async getMetrics(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/metrics`, { timeout: 5000 });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch model metrics: ${error.message}`);
    }
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, { timeout: 3000 });
      return response.status === 200 && response.data.status === 'healthy';
    } catch {
      return false;
    }
  }
}

export const mlClient = new MLServiceClient();
