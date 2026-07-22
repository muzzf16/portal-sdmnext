import { Router } from 'express';
import LaporanKepatuhanController from './laporan-kepatuhan.controller';
import { authenticateToken, restrictTo } from '../../middleware/authMiddleware';

const router = Router();

// Protect all routes
router.use(authenticateToken);

// Employee routes
router.get('/my-reports', LaporanKepatuhanController.getMyReports);

// Public (with controller logic for roles)
router.get('/', LaporanKepatuhanController.getAll);

// Admin/Pimpinan/Supervisor routes
router.post('/', restrictTo('admin', 'pimpinan'), LaporanKepatuhanController.create);
router.get('/:id', LaporanKepatuhanController.getById);
router.put('/:id', LaporanKepatuhanController.update);
router.delete('/:id', restrictTo('admin', 'pimpinan'), LaporanKepatuhanController.delete);

export default router;
