import { Router } from 'express';
import { authenticateToken, restrictTo } from '../../../middleware/authMiddleware';
import PerformanceCycleController from './performance-cycle.controller';

const router = Router();

router.use(authenticateToken);
router.use(restrictTo('admin', 'pimpinan', 'supervisor'));

router.post('/open', PerformanceCycleController.openPeriod);
router.post('/sync-kpi', PerformanceCycleController.syncApprovedWlaToKpi);
router.post('/create-reviews', PerformanceCycleController.createReviewBatch);
router.post('/finalize', PerformanceCycleController.finalizePeriod);

export default router;
