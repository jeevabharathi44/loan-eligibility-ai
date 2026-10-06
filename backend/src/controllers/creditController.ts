import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { getCreditProvider } from '../services/credit';
import { logAudit } from '../services/auditService';

export const verifyCreditSchema = z.object({
  applicationId: z.string().uuid('Invalid application ID'),
  cibilScore: z.number().int().min(300, 'CIBIL score must be at least 300').max(900, 'CIBIL score cannot exceed 900'),
  paymentHistory: z.number().min(0).max(100).default(85),
  creditUtilization: z.number().min(0).max(100).default(30),
  creditHistoryYears: z.number().min(0).max(50).default(5),
  recentEnquiries: z.number().int().min(0).max(20).default(1),
  consentGiven: z.boolean().refine((val) => val === true, {
    message: 'Explicit consent is legally required to record or verify credit information',
  }),
  providerMode: z.enum(['mock', 'verified']).optional().default('mock'),
});

export const verifyCredit = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const {
    applicationId,
    cibilScore,
    paymentHistory,
    creditUtilization,
    creditHistoryYears,
    recentEnquiries,
    consentGiven,
    providerMode,
  } = req.body;

  // Verify application exists and ownership
  const application = await prisma.loanApplication.findUnique({
    where: { id: applicationId },
    include: { user: true },
  });

  if (!application) {
    res.status(404).json({ success: false, message: 'Application not found' });
    return;
  }

  if (application.userId !== req.user.id && req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Access denied: You cannot verify credit for this application',
    });
    return;
  }

  const provider = getCreditProvider(providerMode);
  const verificationResult = await provider.verifyCreditProfile({
    applicationId,
    cibilScore,
    paymentHistory,
    creditUtilization,
    creditHistoryYears,
    recentEnquiries,
    consentGiven,
    applicantName: application.user.name,
  });

  // Upsert credit profile record
  const creditProfile = await prisma.creditProfile.upsert({
    where: { applicationId },
    update: {
      cibilScore: verificationResult.cibilScore,
      paymentHistory: verificationResult.paymentHistory,
      creditUtilization: verificationResult.creditUtilization,
      creditHistoryYears: verificationResult.creditHistoryYears,
      recentEnquiries: verificationResult.recentEnquiries,
      verificationStatus: verificationResult.verificationStatus,
      provider: verificationResult.provider,
      consentTimestamp: verificationResult.consentTimestamp,
    },
    create: {
      applicationId,
      cibilScore: verificationResult.cibilScore,
      paymentHistory: verificationResult.paymentHistory,
      creditUtilization: verificationResult.creditUtilization,
      creditHistoryYears: verificationResult.creditHistoryYears,
      recentEnquiries: verificationResult.recentEnquiries,
      verificationStatus: verificationResult.verificationStatus,
      provider: verificationResult.provider,
      consentTimestamp: verificationResult.consentTimestamp,
    },
  });

  await logAudit('CREDIT_PROFILE_VERIFIED', req.user.id, applicationId, {
    cibilScore,
    verificationStatus: verificationResult.verificationStatus,
    provider: verificationResult.provider,
  });

  const displayNotice =
    creditProfile.verificationStatus === 'DEMO_UNVERIFIED'
      ? 'Demo credit information – not verified'
      : 'Credit information verified via Authorized Provider';

  res.status(200).json({
    success: true,
    message: 'Credit profile processed successfully',
    data: {
      creditProfile,
      displayNotice,
      notes: verificationResult.notes,
    },
  });
};

export const getCreditProfile = async (req: AuthRequest, res: Response): Promise<void> => {
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

  const creditProfile = await prisma.creditProfile.findUnique({
    where: { applicationId },
  });

  if (!creditProfile) {
    res.status(404).json({ success: false, message: 'Credit profile not found for this application' });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      creditProfile,
      displayNotice:
        creditProfile.verificationStatus === 'DEMO_UNVERIFIED'
          ? 'Demo credit information – not verified'
          : 'Credit information verified via Authorized Provider',
    },
  });
};
