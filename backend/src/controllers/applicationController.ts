import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../services/auditService';

export const createApplicationSchema = z.object({
  income: z.number().min(5000, 'Monthly income must be at least ₹5,000'),
  employmentType: z.enum(['salaried', 'self_employed', 'not_employed']),
  age: z.number().int().min(18, 'Age must be at least 18').max(75, 'Age cannot exceed 75'),
  dependents: z.number().int().min(0).max(10).default(0),
  loanAmount: z.number().min(50000, 'Minimum loan amount is ₹50,000').max(100000000, 'Maximum loan amount is ₹10 Crore'),
  loanTenure: z.number().int().min(6, 'Minimum tenure is 6 months').max(360, 'Maximum tenure is 360 months'),
  loanPurpose: z.enum(['personal', 'home', 'education', 'business', 'vehicle']).default('personal'),
  existingLoans: z.number().int().min(0).max(10).default(0),
  monthlyObligations: z.number().min(0).default(0),
});

export const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'NEEDS_REVIEW', 'DECLINED']),
  reason: z.string().optional(),
});

export const createApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const data = req.body;

  const application = await prisma.loanApplication.create({
    data: {
      userId: req.user.id,
      income: data.income,
      employmentType: data.employmentType,
      age: data.age,
      dependents: data.dependents,
      loanAmount: data.loanAmount,
      loanTenure: data.loanTenure,
      loanPurpose: data.loanPurpose,
      existingLoans: data.existingLoans,
      monthlyObligations: data.monthlyObligations,
      status: 'PENDING',
    },
  });

  await logAudit('APPLICATION_CREATED', req.user.id, application.id, {
    loanAmount: application.loanAmount,
    purpose: application.loanPurpose,
  });

  res.status(201).json({
    success: true,
    message: 'Loan application created successfully',
    data: { application },
  });
};

export const getUserApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const applications = await prisma.loanApplication.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      creditProfile: true,
      predictions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          factors: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    data: { applications },
  });
};

export const getApplicationById = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;

  const application = await prisma.loanApplication.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      creditProfile: true,
      predictions: {
        orderBy: { createdAt: 'desc' },
        include: {
          factors: true,
        },
      },
      auditLogs: {
        orderBy: { timestamp: 'desc' },
      },
    },
  });

  if (!application) {
    res.status(404).json({ success: false, message: 'Application not found' });
    return;
  }

  // Enforce strict ownership / authorization
  if (application.userId !== req.user.id && req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Access denied: You do not have permission to view this application',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { application },
  });
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const { status, reason } = req.body;

  const application = await prisma.loanApplication.findUnique({
    where: { id },
  });

  if (!application) {
    res.status(404).json({ success: false, message: 'Application not found' });
    return;
  }

  // Only admin can manually update application status
  if (req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Only administrators can manually update application status',
    });
    return;
  }

  const updatedApplication = await prisma.loanApplication.update({
    where: { id },
    data: { status },
  });

  await logAudit('APPLICATION_STATUS_UPDATED', req.user.id, id, {
    oldStatus: application.status,
    newStatus: status,
    reason,
  });

  res.status(200).json({
    success: true,
    message: `Application status updated to ${status}`,
    data: { application: updatedApplication },
  });
};
