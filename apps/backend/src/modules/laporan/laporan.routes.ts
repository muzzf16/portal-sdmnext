
import { Router } from 'express';
import LaporanController from './laporan.controller';

const router = Router();

router.get('/employees', LaporanController.getLaporanPegawai);
router.get('/attendance', LaporanController.getLaporanAbsensi);
router.get('/payroll', LaporanController.getLaporanPenggajian);
router.get('/leave', LaporanController.getLaporanCuti);
router.get('/performance', LaporanController.getLaporanKinerja);

export default router;
