import { Router } from 'express';
import PelatihanController from './pelatihan.controller';
import { uploadDocument } from '../../middleware/uploadMiddleware';

const router = Router();

const uploadFields = uploadDocument.fields([
  { name: 'certificate', maxCount: 1 },
  { name: 'surat_jalan', maxCount: 1 },
  { name: 'sppd', maxCount: 1 },
  { name: 'surat_penawaran', maxCount: 1 },
]);

router.get('/', PelatihanController.getAllPelatihan);
router.get('/employee/:id', PelatihanController.getPelatihanByEmployeeId);
router.post('/employee/:id', uploadFields, PelatihanController.addPelatihan);
router.post('/', uploadFields, PelatihanController.addPelatihan);
router.put('/:id', uploadFields, PelatihanController.updatePelatihan);
router.delete('/:id', PelatihanController.deletePelatihan);

export default router;
