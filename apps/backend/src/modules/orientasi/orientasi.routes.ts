
import { Router } from 'express';
import OrientasiController from './orientasi.controller';

const router = Router();

router.get('/employee/:employeeId/tasks', OrientasiController.getTugasOrientasiByEmployeeId);
router.post('/employee/:employeeId/tasks', OrientasiController.createTugasOrientasi);
router.put('/tasks/:taskId', OrientasiController.updateTugasOrientasi);
router.delete('/tasks/:taskId', OrientasiController.deleteTugasOrientasi);

export default router;
