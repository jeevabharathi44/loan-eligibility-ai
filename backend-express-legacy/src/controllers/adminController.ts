import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { mlClient } from '../services/mlClient';

export const getAllApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '20', 10);
  const statusFilter = req.query.status as string;

  const whereClause: any = {};
  if (statusFilter && ['PENDING', 'APPROVED', 'NEEDS_REVIEW', 'DECLINED'].includes(statusFilter)) {
    whereClause.status = statusFilter;
  }

  const [total, applications] = await Promise.all([
    prisma.loanApplication.count({ where: whereClause }),
    prisma.loanApplication.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        creditProfile: true,
        predictions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      applications,
    },
  });
};

export const getAdminStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
  const [totalUsers, totalApplications, statusGroups, predictions, auditLogs] = await Promise.all([
    prisma.user.count(),
    prisma.loanApplication.count(),
    prisma.loanApplication.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.prediction.findMany({
      select: { riskLevel: true, probability: true },
    }),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const statusCounts: Record<string, number> = {
    APPROVED: 0,
    NEEDS_REVIEW: 0,
    DECLINED: 0,
    PENDING: 0,
  };
  statusGroups.forEach((g) => {
    statusCounts[g.status] = g._count.status;
  });

  const riskCounts: Record<string, number> = {
    Low: 0,
    Moderate: 0,
    High: 0,
  };
  predictions.forEach((p) => {
    if (riskCounts[p.riskLevel] !== undefined) {
      riskCounts[p.riskLevel]++;
    }
  });

  const approvalRate =
    totalApplications > 0
      ? Math.round((statusCounts.APPROVED / totalApplications) * 100)
      : 0;

  // Attempt to fetch model metrics from ML service
  let modelMetrics = null;
  try {
    modelMetrics = await mlClient.getMetrics();
  } catch (error) {
    console.warn('Could not retrieve model metrics from ML service for admin stats');
  }

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalApplications,
      approvalRate,
      statusBreakdown: statusCounts,
      riskBreakdown: riskCounts,
      modelMetrics,
      recentAuditLogs: auditLogs,
    },
  });
};
