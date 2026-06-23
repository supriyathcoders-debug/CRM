import { Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { companyService } from '../services/company.service';
import { ValidationError } from '../utils/errors';

export class CompanyController {
  async getBranding(req: AuthenticatedRequest, res: Response) {
    const data = await companyService.getBranding(req.user!.companyId);
    return sendSuccess(res, data);
  }

  async updateBranding(req: AuthenticatedRequest, res: Response) {
    const data = await companyService.updateBranding(req.user!, req.body);
    return sendSuccess(res, data, 'Company branding updated');
  }

  async uploadLogo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.file) {
      return next(new ValidationError('Logo file is required'));
    }
    const data = await companyService.uploadLogo(req.user!, req.file);
    return sendSuccess(res, data, 'Company logo uploaded');
  }

  async removeLogo(req: AuthenticatedRequest, res: Response) {
    const data = await companyService.removeLogo(req.user!);
    return sendSuccess(res, data, 'Company logo removed');
  }
}

export const companyController = new CompanyController();
