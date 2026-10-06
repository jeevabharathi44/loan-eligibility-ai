import { PrismaClient, Role, ApplicationStatus, VerificationStatus, FactorDirection } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Database ---');

  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const userPassword = await bcrypt.hash('User@12345', 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@loanai.local' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@loanai.local',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`Admin created: ${admin.email}`);

  // 2. Create Demo Users
  const user1 = await prisma.user.upsert({
    where: { email: 'arjun@loanai.local' },
    update: {},
    create: {
      name: 'Arjun Sharma',
      email: 'arjun@loanai.local',
      passwordHash: userPassword,
      role: Role.USER,
    },
  });

  await prisma.user.upsert({
    where: { email: 'meena@loanai.local' },
    update: {},
    create: {
      name: 'Meena Patel',
      email: 'meena@loanai.local',
      passwordHash: userPassword,
      role: Role.USER,
    },
  });

  // 3. Create Sample Application for Arjun if not exists
  const existingApp = await prisma.loanApplication.findFirst({
    where: { userId: user1.id },
  });

  if (!existingApp) {
    const app1 = await prisma.loanApplication.create({
      data: {
        userId: user1.id,
        age: 30,
        employmentType: 'salaried',
        income: 90000,
        dependents: 1,
        loanAmount: 800000,
        loanTenure: 36,
        loanPurpose: 'home',
        existingLoans: 1,
        monthlyObligations: 5000,
        status: ApplicationStatus.APPROVED,
        creditProfile: {
          create: {
            cibilScore: 780,
            paymentHistory: 98.0,
            creditUtilization: 20.0,
            creditHistoryYears: 8.0,
            recentEnquiries: 1,
            verificationStatus: VerificationStatus.DEMO_UNVERIFIED,
            provider: 'MOCK_CREDIT_BUREAU',
            consentTimestamp: new Date(),
          },
        },
        predictions: {
          create: {
            predictedClass: 'Approved',
            probability: 0.985,
            riskLevel: 'Low',
            modelVersion: 'v1.2.0-ebm',
            factors: {
              create: [
                {
                  feature: 'cibil_score',
                  contribution: 1.82,
                  direction: FactorDirection.POSITIVE,
                  explanation: 'CIBIL score of 780 (Prime) significantly improved eligibility by demonstrating strong credit discipline.',
                },
                {
                  feature: 'debt_to_income_ratio',
                  contribution: 1.45,
                  direction: FactorDirection.POSITIVE,
                  explanation: 'Debt-to-Income (DTI) ratio of 28.9% is conservative and manageable, leaving healthy disposable income for loan service.',
                },
                {
                  feature: 'employment_type',
                  contribution: 0.92,
                  direction: FactorDirection.POSITIVE,
                  explanation: 'Salaried status offers predictable and verifiable income stability.',
                },
                {
                  feature: 'payment_history',
                  contribution: 0.74,
                  direction: FactorDirection.POSITIVE,
                  explanation: 'On-time payment track record of 98% establishes consistent repayment diligence.',
                },
              ],
            },
          },
        },
        auditLogs: {
          create: [
            {
              userId: user1.id,
              action: 'APPLICATION_CREATED',
              metadata: JSON.stringify({ source: 'WEB_WIZARD' }),
            },
            {
              userId: user1.id,
              action: 'PREDICTION_COMPLETED',
              metadata: JSON.stringify({ predictedClass: 'Approved', riskLevel: 'Low' }),
            },
          ],
        },
      },
    });
    console.log(`Sample application created for Arjun: ${app1.id}`);
  }

  console.log('--- Database Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
