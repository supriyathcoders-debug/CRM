import { prisma } from '../config/database';
import type { AuditAction, Prisma } from '@prisma/client';

export class AuditRepository {
  async create(data: {
    companyId: string;
    userId?: string;
    action: AuditAction;
    entityType: string;
    entityId?: string;
    oldValues?: Prisma.InputJsonValue;
    newValues?: Prisma.InputJsonValue;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.auditLog.create({ data });
  }

  async findByCompany(companyId: string, limit = 20) {
    return prisma.auditLog.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async findMany(
    companyId: string,
    query: { entityType?: string; entityId?: string; limit?: number }
  ) {
    return prisma.auditLog.findMany({
      where: {
        companyId,
        ...(query.entityType && { entityType: query.entityType }),
        ...(query.entityId && { entityId: query.entityId }),
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? 20,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async findLatestByEntities(companyId: string, entityType: string, entityIds: string[]) {
    if (!entityIds.length) return new Map<string, Awaited<ReturnType<typeof prisma.auditLog.findFirst>>>();

    const logs = await prisma.auditLog.findMany({
      where: {
        companyId,
        entityType,
        entityId: { in: entityIds },
        action: { in: ['CREATE', 'UPDATE', 'DELETE'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    const map = new Map<string, (typeof logs)[number]>();
    for (const log of logs) {
      if (log.entityId && !map.has(log.entityId)) {
        map.set(log.entityId, log);
      }
    }
    return map;
  }
}

export const auditRepository = new AuditRepository();
