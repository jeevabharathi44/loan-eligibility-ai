import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { app } from '../index';
import { prisma } from '../utils/prisma';
import { mlClient } from '../services/mlClient';
import { config } from '../config';

// Mock dependencies
jest.mock('../utils/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    loanApplication: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    creditProfile: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    prediction: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

jest.mock('../services/mlClient', () => ({
  mlClient: {
    getPrediction: jest.fn(),
    getMetrics: jest.fn(),
    checkHealth: jest.fn(),
  },
}));

describe('Loan Eligibility AI - Backend API Test Suite', () => {
  const testUser = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Arjun Sharma',
    email: 'arjun@example.com',
    role: 'USER',
    passwordHash: '',
    createdAt: new Date(),
  };

  const adminUser = {
    id: '99999999-9999-9999-9999-999999999999',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN',
    passwordHash: '',
    createdAt: new Date(),
  };

  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    testUser.passwordHash = await bcrypt.hash('Password@123', 10);
    adminUser.passwordHash = await bcrypt.hash('Admin@123', 10);
    userToken = jwt.sign({ id: testUser.id, email: testUser.email, role: testUser.role }, config.jwtSecret);
    adminToken = jwt.sign({ id: adminUser.id, email: adminUser.email, role: adminUser.role }, config.jwtSecret);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      if (typeof callback === 'function') {
        return callback(prisma);
      }
      return Promise.resolve(callback);
    });
  });

  describe('Health Endpoint', () => {
    it('GET /health should return 200 and healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('Authentication Routes', () => {
    it('POST /api/auth/register should register a new user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'new-user-id',
        name: 'New User',
        email: 'new@example.com',
        role: 'USER',
        createdAt: new Date(),
      });

      const res = await request(app).post('/api/auth/register').send({
        name: 'New User',
        email: 'new@example.com',
        password: 'SecurePassword123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('POST /api/auth/register should fail on duplicate email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(testUser);

      const res = await request(app).post('/api/auth/register').send({
        name: 'Duplicate User',
        email: testUser.email,
        password: 'Password@123',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('POST /api/auth/login should authenticate valid user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(testUser);

      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'Password@123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('POST /api/auth/login should reject invalid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(testUser);

      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'WrongPassword999',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me should return current user info when authenticated', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: testUser.id,
        name: testUser.name,
        email: testUser.email,
        role: testUser.role,
        createdAt: testUser.createdAt,
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('GET /api/auth/me should return 401 when missing token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('Loan Applications & Authorization', () => {
    it('POST /api/applications should create loan application', async () => {
      const appData = {
        income: 85000,
        employmentType: 'salaried',
        age: 32,
        dependents: 1,
        loanAmount: 800000,
        loanTenure: 36,
        loanPurpose: 'personal',
        existingLoans: 0,
        monthlyObligations: 4000,
      };

      (prisma.loanApplication.create as jest.Mock).mockResolvedValue({
        id: 'app-uuid-1234',
        userId: testUser.id,
        ...appData,
        status: 'PENDING',
      });

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${userToken}`)
        .send(appData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.application.id).toBe('app-uuid-1234');
    });

    it('POST /api/applications should reject invalid age (< 18)', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          income: 50000,
          employmentType: 'salaried',
          age: 16, // Invalid
          loanAmount: 200000,
          loanTenure: 24,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/applications/:id should enforce ownership check (403 for other user)', async () => {
      (prisma.loanApplication.findUnique as jest.Mock).mockResolvedValue({
        id: 'other-app-id',
        userId: 'different-user-uuid', // Not testUser.id
        income: 50000,
      });

      const res = await request(app)
        .get('/api/applications/other-app-id')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Access denied');
    });

    it('GET /api/applications/:id should permit admin to view any application', async () => {
      (prisma.loanApplication.findUnique as jest.Mock).mockResolvedValue({
        id: 'target-app-id',
        userId: 'different-user-uuid',
        income: 50000,
      });

      const res = await request(app)
        .get('/api/applications/target-app-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('Credit Verification', () => {
    it('POST /api/credit/verify should validate realistic CIBIL ranges (300-900)', async () => {
      const res = await request(app)
        .post('/api/credit/verify')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          applicationId: '11111111-2222-3333-4444-555555555555',
          cibilScore: 999, // Invalid score > 900
          consentGiven: true,
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].message).toContain('cannot exceed 900');
    });

    it('POST /api/credit/verify should reject when consent is not given', async () => {
      const res = await request(app)
        .post('/api/credit/verify')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          applicationId: '11111111-2222-3333-4444-555555555555',
          cibilScore: 750,
          consentGiven: false, // Disallowed
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].message).toContain('Explicit consent is legally required');
    });
  });

  describe('ML Predictions & Fault Tolerance', () => {
    it('POST /api/predictions should execute prediction and record factors', async () => {
      const appId = '11111111-2222-3333-4444-555555555555';
      (prisma.loanApplication.findUnique as jest.Mock).mockResolvedValue({
        id: appId,
        userId: testUser.id,
        user: testUser,
        income: 90000,
        age: 30,
        employmentType: 'salaried',
        dependents: 1,
        loanAmount: 800000,
        loanTenure: 36,
        loanPurpose: 'home',
        existingLoans: 1,
        monthlyObligations: 5000,
        creditProfile: {
          cibilScore: 780,
          paymentHistory: 98,
          creditUtilization: 20,
          creditHistoryYears: 8,
          recentEnquiries: 1,
        },
      });

      (mlClient.getPrediction as jest.Mock).mockResolvedValue({
        predicted_class: 'Approved',
        probability: 0.98,
        probability_percentage: 98.0,
        risk_level: 'Low',
        model_version: 'v1.2.0-ebm',
        model_name: 'Explainable Boosting Machine (EBM)',
        positive_factors: [
          { feature: 'cibil_score', feature_label: 'Cibil Score', value: 780, contribution: 1.8, direction: 'positive', explanation: 'Prime CIBIL score' }
        ],
        negative_factors: [],
        all_factors: [
          { feature: 'cibil_score', feature_label: 'Cibil Score', value: 780, contribution: 1.8, direction: 'positive', explanation: 'Prime CIBIL score' }
        ],
        derived_features: { estimated_emi: 26000, debt_to_income_ratio: 0.34, loan_to_income_ratio: 0.74, loan_amount_inr: 800000 },
        disclaimer: 'Demonstration only',
      });

      (prisma.prediction.create as jest.Mock).mockResolvedValue({
        id: 'pred-1234',
        applicationId: appId,
        predictedClass: 'Approved',
        probability: 0.98,
        riskLevel: 'Low',
        createdAt: new Date(),
      });

      const res = await request(app)
        .post('/api/predictions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ applicationId: appId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.predictedClass).toBe('Approved');
      expect(res.body.data.riskLevel).toBe('Low');
    });

    it('POST /api/predictions should handle ML service unavailability gracefully', async () => {
      const appId = '11111111-2222-3333-4444-555555555555';
      (prisma.loanApplication.findUnique as jest.Mock).mockResolvedValue({
        id: appId,
        userId: testUser.id,
        user: testUser,
        income: 90000,
        age: 30,
        employmentType: 'salaried',
        dependents: 1,
        loanAmount: 800000,
        loanTenure: 36,
        loanPurpose: 'home',
        existingLoans: 1,
        monthlyObligations: 5000,
        creditProfile: {
          cibilScore: 780,
          paymentHistory: 98,
          creditUtilization: 20,
          creditHistoryYears: 8,
          recentEnquiries: 1,
        },
      });

      (mlClient.getPrediction as jest.Mock).mockRejectedValue(
        new Error('ML Service is unreachable at http://localhost:8000')
      );

      const res = await request(app)
        .post('/api/predictions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ applicationId: appId });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('ML Service is unreachable');
    });
  });
});
