import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { mlClient } from '../services/mlClient';

export const getDashboardStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const userId = req.user.id;

  const applications = await prisma.loanApplication.findMany({
    where: { userId },
    include: {
      creditProfile: true,
      predictions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalApplications = applications.length;
  const approvedCount = applications.filter((a) => a.status === 'APPROVED').length;
  const reviewCount = applications.filter((a) => a.status === 'NEEDS_REVIEW').length;
  const declinedCount = applications.filter((a) => a.status === 'DECLINED').length;
  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;

  const validCibilScores = applications
    .map((a) => a.creditProfile?.cibilScore)
    .filter((s): s is number => typeof s === 'number');

  const averageCibil =
    validCibilScores.length > 0
      ? Math.round(validCibilScores.reduce((acc, curr) => acc + curr, 0) / validCibilScores.length)
      : 0;

  const mlHealthy = await mlClient.checkHealth();

  res.status(200).json({
    success: true,
    data: {
      totalApplications,
      approvedCount,
      reviewCount,
      declinedCount,
      pendingCount,
      averageCibil,
      mlServiceHealthy: mlHealthy,
      recentApplications: applications.slice(0, 5),
    },
  });
};
