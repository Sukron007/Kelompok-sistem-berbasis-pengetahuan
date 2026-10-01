import { prisma } from '../config/database.ts';

export const logAuditEvent = async (options: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: options.userId,
        action: options.action,
        entity: options.entity,
        entity_id: options.entityId,
        details: options.details ? options.details.slice(0, 500) : undefined,
        ip_address: options.ipAddress,
      },
    });
  } catch (error) {
    console.error('Audit log write failed:', error);
  }
};
