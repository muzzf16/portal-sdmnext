
import { Router } from 'express';
import WorkloadController from './workload.controller';
// import { authenticate } from '../../middleware/authMiddleware';

const router = Router();

// router.use(authenticate); // Enable if auth is ready

router.get('/:employeeId', WorkloadController.getAnalysis);
router.post('/', WorkloadController.saveAnalysis);

export default router;
