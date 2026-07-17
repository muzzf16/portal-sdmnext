
import { Router } from 'express';
import * as controller from './backup.controller';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

router.get('/list', controller.list);
router.post('/backup', controller.backup);
router.post('/restore', controller.restore);
router.get('/download/:filename', controller.download);

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'backups', 'temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `upload_${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const uploadBackup = multer({
  storage: uploadStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.originalname.toLowerCase().endsWith('.sqlite')) {
      cb(null, true);
    } else {
      cb(new Error('Only .sqlite backup files are allowed!'));
    }
  }
});

router.post('/restore-upload', uploadBackup.single('backup'), controller.restoreFromUpload);

export default router;
