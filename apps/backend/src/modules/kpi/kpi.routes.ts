import { Router } from 'express';
import KpiController from './kpi.controller';

const router = Router();

router.get('/', KpiController.getAll);
router.get('/employee/:employeeId', KpiController.getByEmployeeId);
router.get('/:id', KpiController.getById);
router.post('/', KpiController.create);
router.post('/generate-from-abk', KpiController.generateFromAbk);
router.put('/:id', KpiController.update);
router.put('/:id/actual', KpiController.updateActualValue);
router.delete('/:id', KpiController.delete);

export default router;
