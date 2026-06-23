import type { AuditAction } from '@prisma/client';
import { auditRepository } from '../repositories/audit.repository';

export type AuditActorInfo = {
  id: string;
  email: string;
  name: string;
};

export function formatAuditActor(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}): AuditActorInfo {
  return {
    id: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`.trim(),
  };
}

export function mapAuditLog(log: {
  action: AuditAction;
  createdAt: Date;
  user: { id: string; firstName: string; lastName: string; email: string } | null;
}) {
  return {
    action: log.action,
    at: log.createdAt,
    by: log.user
      ? {
          id: log.user.id,
          name: `${log.user.firstName} ${log.user.lastName}`.trim(),
          email: log.user.email,
        }
      : null,
  };
}

export class AuditService {
  async log(params: {
    companyId: string;
    userId?: string;
    action: AuditAction;
    entityType: string;
    entityId?: string;
    oldValues?: unknown;
    newValues?: unknown;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return auditRepository.create({
      ...params,
      oldValues: params.oldValues as never,
      newValues: params.newValues as never,
    });
  }

  async list(
    companyId: string,
    query: { entityType?: string; entityId?: string; limit?: number }
  ) {
    const logs = await auditRepository.findMany(companyId, query);
    return logs.map(mapAuditLog);
  }

  async getLatestForEntities(companyId: string, entityType: string, entityIds: string[]) {
    const map = await auditRepository.findLatestByEntities(companyId, entityType, entityIds);
    const result = new Map<string, ReturnType<typeof mapAuditLog>>();
    for (const [id, log] of map.entries()) {
      result.set(id, mapAuditLog(log));
    }
    return result;
  }
}

export const auditService = new AuditService();
