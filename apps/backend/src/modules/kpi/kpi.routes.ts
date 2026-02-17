import { Router } from 'express';
import KpiController from './kpi.controller';
import { authenticateToken, restrictTo } from '../../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', KpiController.getAll);
router.get('/employee/:employeeId', KpiController.getByEmployeeId);
router.get('/:id', KpiController.getById);
router.post('/', restrictTo('admin', 'pimpinan', 'supervisor'), KpiController.create);
router.post('/generate-from-abk', restrictTo('admin', 'pimpinan', 'supervisor'), KpiController.generateFromAbk);
router.put('/:id', restrictTo('admin', 'pimpinan', 'supervisor'), KpiController.update);
router.put('/:id/actual', restrictTo('admin', 'pimpinan', 'supervisor'), KpiController.updateActualValue);
router.delete('/:id', restrictTo('admin', 'pimpinan', 'supervisor'), KpiController.delete);

export default router;
