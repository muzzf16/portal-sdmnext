
import { Router } from 'express';
import PenggunaController from './pengguna.controller';
import { uploadAvatar } from '../../middleware/uploadMiddleware';

const router = Router();

router.get('/', PenggunaController.getAllPengguna);
router.get('/:id', PenggunaController.getPenggunaById);
router.put('/:id', PenggunaController.updatePengguna);
router.put('/:id/password', PenggunaController.changePassword);
router.put('/:id/reset-password', PenggunaController.resetPassword);
router.post('/:id/avatar', uploadAvatar.single('avatar'), PenggunaController.uploadAvatar);
router.delete('/:id', PenggunaController.deletePengguna);

export default router;
