
import { Router } from 'express';
import AbsensiController from './absensi.controller';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', AbsensiController.getAllAttendanceRecords);
router.get('/:id', AbsensiController.getAttendanceRecordById);
router.post('/clock-in', AbsensiController.clockIn);
router.post('/clock-out', AbsensiController.clockOut);
router.get('/employee/:id', AbsensiController.getAttendanceByEmployeeId);
router.post('/upload', upload.single('file'), AbsensiController.uploadLog);
router.post('/', AbsensiController.createAttendanceRecord);
router.put('/:id', AbsensiController.updateAttendanceRecord);
router.delete('/:id', AbsensiController.deleteAttendanceRecord);

export default router;
