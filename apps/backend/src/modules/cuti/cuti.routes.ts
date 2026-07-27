
import { Router } from 'express';
import CutiController from './cuti.controller';
import multer from 'multer';
import path from 'path';

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/documents/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const router = Router();

router.get('/', CutiController.getAllPermintaanCuti);
router.get('/batch-sisa-cuti', CutiController.getBatchSisaCuti);
router.get('/cuti-bersama', CutiController.getCutiBersama);
router.get('/employee/:employeeId', CutiController.getPermintaanCutiByEmployeeId);
router.get('/sisa-cuti/:employeeId', CutiController.getSisaCuti);
router.get('/:id', CutiController.getPermintaanCutiById);
router.post('/', upload.single('supportingDocument'), CutiController.submitPermintaanCuti);
router.put('/:id', upload.single('supportingDocument'), CutiController.updatePermintaanCuti);
router.put('/:id/status', CutiController.updateStatusCuti);
router.delete('/:id', CutiController.deletePermintaanCuti);

export default router;
