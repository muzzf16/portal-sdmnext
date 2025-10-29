
import { Router } from 'express';
import LaporanController from './laporan.controller';
import CustomReportRoutes from './custom-report.routes';

const router = Router();

// Standard report endpoints
router.get('/employees', LaporanController.getLaporanPegawai);
router.get('/attendance', LaporanController.getLaporanAbsensi);
router.get('/payroll', LaporanController.getLaporanPenggajian);
router.get('/leave', LaporanController.getLaporanCuti);
router.get('/performance', LaporanController.getLaporanKinerja);
router.get('/turnover', LaporanController.getLaporanTurnover);
router.get('/demographics', LaporanController.getLaporanDemografi);

// Enhanced analytics endpoints
router.get('/employees/comprehensive', LaporanController.getLaporanPegawaiKomprehensif);
router.get('/attendance/analytics', LaporanController.getLaporanAbsensiAnalitik);
router.get('/payroll/analytics', LaporanController.getLaporanPenggajianAnalitik);

// Export endpoints
router.get('/employees/export', LaporanController.exportLaporanPegawai);
router.get('/attendance/export', LaporanController.exportLaporanAbsensi);
router.get('/payroll/export', LaporanController.exportLaporanPenggajian);
router.get('/leave/export', LaporanController.exportLaporanCuti);
router.get('/performance/export', LaporanController.exportLaporanKinerja);

// Custom report builder
router.use('/custom', CustomReportRoutes);

export default router;
