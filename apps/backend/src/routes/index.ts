import { Router } from 'express';
import authRoutes from '../modules/pengguna/auth.pengguna.routes';
import employeeRoutes from '../modules/pegawai/pegawai.routes';
import leaveRoutes from '../modules/cuti/cuti.routes';
import attendanceRoutes from '../modules/absensi/absensi.routes';
import performanceRoutes from '../modules/kinerja/kinerja.routes';
import payrollRoutes from '../modules/penggajian/penggajian.routes';
import dataChangeRequestRoutes from '../modules/permintaanPerubahanData/permintaanPerubahanData.routes';
import recruitmentRoutes from '../modules/perekrutan/perekrutan.routes';
import onboardingRoutes from '../modules/orientasi/orientasi.routes';
import notificationRoutes from '../modules/notifikasi/notifikasi.routes';
import contractRoutes from '../modules/kontrak/kontrak.routes';
import pelatihanRoutes from '../modules/pelatihan/pelatihan.routes';
import reportRoutes from '../modules/laporan/laporan.routes';
import dashboardRoutes from '../modules/dashboard/dashboard.routes';
import uploadRoutes from './upload';

const router = Router();

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/leave-requests', leaveRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/performance-reviews', performanceRoutes);
router.use('/payrolls', payrollRoutes);
router.use('/data-change-requests', dataChangeRequestRoutes);
router.use('/recruitment', recruitmentRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/notifikasi', notificationRoutes);
router.use('/contracts', contractRoutes);
router.use('/pelatihan', pelatihanRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/', uploadRoutes);

export default router;
