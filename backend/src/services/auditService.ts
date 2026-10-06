import { prisma } from '../utils/prisma';

export async function logAudit(
  action: string,
  userId?: string | null,
  applicationId?: string | null,
  metadata?: any
) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId: userId || null,
        applicationId: applicationId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
