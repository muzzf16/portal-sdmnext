// src/modules/arsip-dokumen/arsip-dokumen.routes.ts
import { Router } from 'express';
import { authenticateToken, restrictTo } from '../../middleware/authMiddleware';
import { uploadDocument } from '../../middleware/uploadMiddleware';
import { ArsipDokumenController } from './arsip-dokumen.controller';

const router = Router();

// Semua route membutuhkan autentikasi
router.use(authenticateToken);

// ─── Read (semua role) ───────────────────────────────────────────
router.get('/stats', ArsipDokumenController.getStats);
router.get('/expiring', ArsipDokumenController.getExpiring);
router.get('/', ArsipDokumenController.getAll);
router.get('/:id', ArsipDokumenController.getById);

// ─── Write (admin, pimpinan, supervisor) ────────────────────────
router.post(
  '/',
  restrictTo('admin', 'pimpinan', 'supervisor'),
  uploadDocument.single('file'),
  ArsipDokumenController.create,
);

router.put(
  '/:id',
  restrictTo('admin', 'pimpinan', 'supervisor'),
  uploadDocument.single('file'),
  ArsipDokumenController.update,
);

router.delete(
  '/:id',
  restrictTo('admin', 'pimpinan', 'supervisor'),
  ArsipDokumenController.delete,
);

export default router;
