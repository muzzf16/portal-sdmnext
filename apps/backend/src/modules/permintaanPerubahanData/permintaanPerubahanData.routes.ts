
import { Router } from 'express';
import PermintaanPerubahanDataController from './permintaanPerubahanData.controller';

const router = Router();

router.get('/', PermintaanPerubahanDataController.getAllPermintaanPerubahanData);
router.get('/:id', PermintaanPerubahanDataController.getPermintaanPerubahanDataById);
router.get('/employee/:id', PermintaanPerubahanDataController.getPermintaanPerubahanDataByEmployeeId);
router.get('/pending', PermintaanPerubahanDataController.getPendingPermintaanPerubahanData);
router.post('/', PermintaanPerubahanDataController.createPermintaanPerubahanData);
router.put('/:id/status', PermintaanPerubahanDataController.updatePermintaanPerubahanDataStatus);
router.delete('/:id', PermintaanPerubahanDataController.deletePermintaanPerubahanData);

export default router;
