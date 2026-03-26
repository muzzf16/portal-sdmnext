import { Router } from 'express';
import AuditLogController from './audit-log.controller';
import { authenticateToken, restrictTo } from '../../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.get('/', restrictTo('admin', 'pimpinan'), AuditLogController.getAll);
router.post('/', restrictTo('admin', 'pimpinan'), AuditLogController.create);

export default router;
