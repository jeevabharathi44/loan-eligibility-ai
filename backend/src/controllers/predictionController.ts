import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { mlClient } from '../services/mlClient';
import { logAudit } from '../services/auditService';

export const createPredictionSchema = z.object({
  applicationId: z.string().uuid('Invalid application ID'),
});

export const runPrediction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { applicationId } = req.body;

  const application = await prisma.loanApplication.findUnique({
    where: { id: applicationId },
    include: {
      user: true,
      creditProfile: true,
    },
  });

  if (!application) {
    res.status(404).json({ success: false, message: 'Application not found' });
    return;
  }

  if (application.userId !== req.user.id && req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Access denied: You do not own this application' });
    return;
  }

  if (!application.creditProfile) {
    res.status(400).json({
      success: false,
      message: 'A credit profile must be verified or submitted before running AI risk prediction',
    });
    return;
  }

  const cp = application.creditProfile;

  // Prepare payload for ML service
  const mlPayload = {
    name: application.user.name,
    age: application.age,
    employment_type: application.employmentType,
    income: application.income,
    dependents: application.dependents,
    existing_loans: application.existingLoans,
    monthly_obligations: application.monthlyObligations,
    loan_amount: application.loanAmount,
    loan_tenure: application.loanTenure,
    loan_purpose: application.loanPurpose,
    cibil_score: cp.cibilScore,
    payment_history: cp.paymentHistory,
    credit_utilization: cp.creditUtilization,
    credit_history_years: cp.creditHistoryYears,
    recent_enquiries: cp.recentEnquiries,
  };

  const mlResult = await mlClient.getPrediction(mlPayload);

  // Map ML status to ApplicationStatus enum
  let newAppStatus: 'APPROVED' | 'NEEDS_REVIEW' | 'DECLINED' = 'NEEDS_REVIEW';
  if (mlResult.predicted_class === 'Approved') newAppStatus = 'APPROVED';
  else if (mlResult.predicted_class === 'Declined') newAppStatus = 'DECLINED';

  // Save prediction and factors in a transaction
  const prediction = await prisma.$transaction(async (tx) => {
    // 1. Update application status
    await tx.loanApplication.update({
      where: { id: applicationId },
      data: { status: newAppStatus },
    });

    // 2. Create prediction record with factors
    const pred = await tx.prediction.create({
      data: {
        applicationId,
        predictedClass: mlResult.predicted_class,
        probability: mlResult.probability,
        riskLevel: mlResult.risk_level,
        modelVersion: mlResult.model_version,
        factors: {
          create: mlResult.all_factors.map((f) => ({
            feature: f.feature,
            contribution: f.contribution,
            direction: f.direction === 'positive' ? 'POSITIVE' : 'NEGATIVE',
            explanation: f.explanation,
          })),
        },
      },
      include: {
        factors: true,
      },
    });

    return pred;
  });

  await logAudit('PREDICTION_GENERATED', req.user.id, applicationId, {
    predictedClass: mlResult.predicted_class,
    riskLevel: mlResult.risk_level,
    probability: mlResult.probability_percentage,
  });

  res.status(200).json({
    success: true,
    message: 'AI loan assessment completed',
    data: {
      predictionId: prediction.id,
      applicationId,
      predictedClass: mlResult.predicted_class,
      probability: mlResult.probability,
      probabilityPercentage: mlResult.probability_percentage,
      riskLevel: mlResult.risk_level,
      modelVersion: mlResult.model_version,
      modelName: mlResult.model_name,
      positiveFactors: mlResult.positive_factors,
      negativeFactors: mlResult.negative_factors,
      allFactors: mlResult.all_factors,
      derivedFeatures: mlResult.derived_features,
      disclaimer: mlResult.disclaimer,
      createdAt: prediction.createdAt,
    },
  });
  } catch (error) {
    next(error);
  }
};

export const getPredictionByApplicationId = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { applicationId } = req.params;

  const application = await prisma.loanApplication.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    res.status(404).json({ success: false, message: 'Application not found' });
    return;
  }

  if (application.userId !== req.user.id && req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Access denied' });
    return;
  }

  const prediction = await prisma.prediction.findFirst({
    where: { applicationId },
    orderBy: { createdAt: 'desc' },
    include: {
      factors: true,
    },
  });

  if (!prediction) {
    res.status(404).json({ success: false, message: 'No prediction found for this application' });
    return;
  }

  res.status(200).json({
    success: true,
    data: { prediction },
  });
};
