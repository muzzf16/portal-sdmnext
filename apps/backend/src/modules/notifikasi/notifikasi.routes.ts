
import { Router } from 'express';
import NotifikasiController from './notifikasi.controller';

const router = Router();

router.get('/employee/:employeeId', NotifikasiController.getNotifikasiByEmployeeId);
router.get('/employee/:employeeId/unread', NotifikasiController.getUnreadNotifikasiByEmployeeId);
router.post('/employee/:employeeId', NotifikasiController.createNotifikasi);
router.put('/:notificationId/read', NotifikasiController.markNotifikasiAsRead);
router.get('/scheduled', NotifikasiController.getScheduledNotifikasi);

export default router;
