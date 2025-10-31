
import { Router } from 'express';
import CutiController from './cuti.controller';

const router = Router();

router.get('/', CutiController.getAllPermintaanCuti);
router.get('/employee/:employeeId', CutiController.getPermintaanCutiByEmployeeId);
router.get('/:id', CutiController.getPermintaanCutiById);
router.post('/', CutiController.submitPermintaanCuti);
router.put('/:id/status', CutiController.updateStatusCuti);
router.delete('/:id', CutiController.deletePermintaanCuti);

export default router;
