
import { Router } from 'express';
import PenggajianController from './penggajian.controller';

const router = Router();

router.get('/', PenggajianController.getAllPenggajian);
router.get('/:id', PenggajianController.getPenggajianById);
router.get('/employee/:id', PenggajianController.getPenggajianByEmployeeId);
router.post('/', PenggajianController.createPenggajian);
router.put('/:id', PenggajianController.updatePenggajian);
router.delete('/:id', PenggajianController.deletePenggajian);
router.post('/:id/components', PenggajianController.addSalaryComponent);

export default router;
