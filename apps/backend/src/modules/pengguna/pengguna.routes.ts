
import { Router } from 'express';
import PenggunaController from './pengguna.controller';

const router = Router();

router.get('/', PenggunaController.getAllPengguna);
router.get('/:id', PenggunaController.getPenggunaById);
router.put('/:id', PenggunaController.updatePengguna);
router.delete('/:id', PenggunaController.deletePengguna);

export default router;
