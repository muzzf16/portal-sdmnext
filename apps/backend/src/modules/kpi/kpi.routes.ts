import { Router } from 'express';
import KpiController from './kpi.controller';
import { authenticateToken, restrictTo } from '../../middleware/authMiddleware';
import { uploadDocument } from '../../middleware/uploadMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', KpiController.getAll);
router.get('/employee/:employeeId', KpiController.getByEmployeeId);
router.get('/:id', KpiController.getById);
router.post('/', restrictTo('admin', 'pimpinan', 'supervisor'), KpiController.create);
router.post('/generate-from-abk', restrictTo('admin', 'pimpinan', 'supervisor'), KpiController.generateFromAbk);
router.post('/sync-wla', restrictTo('admin', 'pimpinan', 'supervisor'), KpiController.syncRealisasiFromWla);
router.put('/:id', restrictTo('admin', 'pimpinan', 'supervisor'), KpiController.update);
router.put('/:id/actual', restrictTo('admin', 'pimpinan', 'supervisor'), uploadDocument.single('evidence'), KpiController.updateActualValue);
router.post('/:id/evidence', restrictTo('admin', 'pimpinan', 'supervisor'), uploadDocument.single('evidence'), KpiController.uploadEvidence);
router.delete('/:id', restrictTo('admin', 'pimpinan', 'supervisor'), KpiController.delete);

export default router;
