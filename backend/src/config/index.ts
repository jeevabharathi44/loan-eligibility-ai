import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-jwt-key-loan-ai-2026-production-change-me',
  databaseUrl: process.env.DATABASE_URL || 'mysql://root:password123@localhost:3306/loan_ai_db',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  creditProvider: {
    mode: (process.env.CREDIT_PROVIDER_MODE || 'mock').toLowerCase(),
    url: process.env.CREDIT_PROVIDER_URL || '',
    apiKey: process.env.CREDIT_PROVIDER_API_KEY || '',
  },
  corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:5173'],
};
