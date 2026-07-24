import { Router } from 'express';
import LaporanKepatuhanController from './laporan-kepatuhan.controller';
import { authenticateToken, restrictTo } from '../../middleware/authMiddleware';
import { uploadDocument } from '../../middleware/uploadMiddleware';

const router = Router();

// Public Template (No Auth required for simple Excel template download via window.open)
router.get('/template', LaporanKepatuhanController.downloadTemplate);

// Protect all routes
router.use(authenticateToken);

// Employee routes
router.get('/my-reports', LaporanKepatuhanController.getMyReports);

// Public (with controller logic for roles)
router.get('/', LaporanKepatuhanController.getAll);

// Import

router.post('/import', restrictTo('admin', 'pimpinan'), uploadDocument.single('file'), LaporanKepatuhanController.importExcel);

// Admin/Pimpinan/Supervisor routes
router.post('/', restrictTo('admin', 'pimpinan'), LaporanKepatuhanController.create);
router.get('/:id', LaporanKepatuhanController.getById);
router.put('/:id', uploadDocument.single('lampiran'), LaporanKepatuhanController.update);
router.delete('/:id', restrictTo('admin', 'pimpinan'), LaporanKepatuhanController.delete);

export default router;
