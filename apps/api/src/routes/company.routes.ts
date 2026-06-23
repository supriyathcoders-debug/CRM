import { Router, Request, Response, NextFunction } from 'express';
import { PERMISSIONS } from '@crm/shared';
import { authenticate } from '../middleware/auth.middleware';
import { requireAnyPermission } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { uploadLogoMiddleware } from '../middleware/upload.middleware';
import { companyController } from '../controllers/company.controller';
import { updateCompanyBrandingSchema } from '../validators/company.validator';

const router = Router();

router.use(authenticate);

router.get('/branding', (req, res, next) =>
  companyController.getBranding(req, res).catch(next)
);

router.patch(
  '/branding',
  requireAnyPermission(PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.COMPANY_SETTINGS),
  validate(updateCompanyBrandingSchema),
  (req, res, next) => companyController.updateBranding(req, res).catch(next)
);

router.post(
  '/logo',
  requireAnyPermission(PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.COMPANY_SETTINGS),
  (req: Request, res: Response, next: NextFunction) => {
    uploadLogoMiddleware(req, res, (err) => {
      if (err) return next(err);
      return companyController.uploadLogo(req as never, res, next);
    });
  }
);

router.delete(
  '/logo',
  requireAnyPermission(PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.COMPANY_SETTINGS),
  (req, res, next) => companyController.removeLogo(req, res).catch(next)
);

export default router;
