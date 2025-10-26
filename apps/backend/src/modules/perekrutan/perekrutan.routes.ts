
import { Router } from 'express';
import PerekrutanController from './perekrutan.controller';

const router = Router();

router.get('/candidates', PerekrutanController.getAllKandidat);
router.get('/candidates/:id', PerekrutanController.getKandidatById);
router.post('/candidates', PerekrutanController.createKandidat);
router.put('/candidates/:id', PerekrutanController.updateKandidat);
router.delete('/candidates/:id', PerekrutanController.deleteKandidat);

export default router;
