import { Response } from 'express';
import { sendSuccess } from '../utils/response';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { auditService } from '../services/audit.service';

export class AuditController {
  async list(req: AuthenticatedRequest, res: Response) {
    const { entityType, entityId, limit } = req.query as {
      entityType?: string;
      entityId?: string;
      limit?: string;
    };
    const data = await auditService.list(req.user!.companyId, {
      entityType,
      entityId,
      limit: limit ? Number(limit) : undefined,
    });
    return sendSuccess(res, data);
  }
}

export const auditController = new AuditController();
