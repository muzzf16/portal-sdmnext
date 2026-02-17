
import { Router } from 'express';
import WorkloadController from './workload.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/:employeeId', WorkloadController.getAnalysis);
router.post('/', WorkloadController.saveAnalysis);

export default router;
