
import { Router } from 'express';
import PelatihanController from './pelatihan.controller';
import { uploadDocument } from '../../middleware/uploadMiddleware';

const router = Router();

router.get('/', PelatihanController.getAllPelatihan);
router.get('/employee/:id', PelatihanController.getPelatihanByEmployeeId);
router.post('/employee/:id', uploadDocument.single('certificate'), PelatihanController.addPelatihan);

export default router;
