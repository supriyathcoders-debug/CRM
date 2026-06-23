import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAnyPermission } from '../middleware/rbac.middleware';
import { PERMISSIONS } from '@crm/shared';

const router = Router();

router.use(authenticate);
router.use(requireAnyPermission(PERMISSIONS.EMPLOYEES_READ, PERMISSIONS.USERS_READ));

router.get('/', (req, res, next) => auditController.list(req, res).catch(next));

export default router;
