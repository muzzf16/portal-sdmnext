
import { Router } from 'express';
import WorkloadController from './workload.controller';
import { authenticateToken, restrictTo } from '../../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/:employeeId', WorkloadController.getAnalysis);
router.post('/', WorkloadController.saveAnalysis);
router.put('/:id/submit', restrictTo('admin', 'pimpinan', 'supervisor'), WorkloadController.submitAnalysis);
router.put('/:id/approve', restrictTo('admin', 'pimpinan', 'supervisor'), WorkloadController.approveAnalysis);

export default router;
