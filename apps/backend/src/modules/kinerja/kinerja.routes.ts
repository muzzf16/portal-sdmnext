
import { Router } from 'express';
import KinerjaController from './kinerja.controller';

const router = Router();

router.get('/', KinerjaController.getAllPenilaianKinerja);
router.get('/employee/:id', KinerjaController.getPenilaianKinerjaByEmployeeId);
router.get('/:id', KinerjaController.getPenilaianKinerjaById);
router.post('/', KinerjaController.createPenilaianKinerja);
router.put('/:id', KinerjaController.updatePenilaianKinerja);
router.put('/:id/feedback', KinerjaController.addFeedbackKinerja);
router.delete('/:id', KinerjaController.deletePenilaianKinerja);

export default router;
