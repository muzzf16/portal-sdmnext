import { Router } from 'express';
import LogAktivitasHarianController from './log-aktivitas-harian.controller';
import { authenticateToken, restrictTo } from '../../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

// Employee endpoints
router.post('/bulk', LogAktivitasHarianController.createBulkLog);
router.post('/', LogAktivitasHarianController.createLog);
router.get('/my-logs', LogAktivitasHarianController.getMyLogs);
router.get('/summary', LogAktivitasHarianController.getSummary);

// Admin / Supervisor endpoints
router.get('/admin/summary', restrictTo('admin', 'pimpinan', 'supervisor'), LogAktivitasHarianController.getAdminSummary);
router.get('/admin/logs', restrictTo('admin', 'pimpinan', 'supervisor'), LogAktivitasHarianController.getAdminLogs);
router.put('/:id/status', restrictTo('admin', 'pimpinan', 'supervisor'), LogAktivitasHarianController.updateStatus);

export default router;
