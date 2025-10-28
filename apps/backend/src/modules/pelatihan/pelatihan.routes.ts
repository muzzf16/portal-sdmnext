
import { Router } from 'express';
import PelatihanController from './pelatihan.controller';

const router = Router();

router.get('/', PelatihanController.getAllPelatihan);
router.get('/employee/:id', PelatihanController.getPelatihanByEmployeeId);
router.post('/employee/:id', PelatihanController.addPelatihan);

export default router;
