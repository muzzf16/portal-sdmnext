import { Router } from 'express';
import { getEmployeesForIntegration, getAttendancesForIntegration, getLeavesForIntegration } from './integration.controller';
import { apiKeyMiddleware } from '../../middleware/apiKeyMiddleware';

const router = Router();

// Endpoint integrasi untuk mendapatkan daftar pegawai
router.get('/employees', apiKeyMiddleware, getEmployeesForIntegration);

// Endpoint integrasi untuk mendapatkan daftar absensi
router.get('/attendance', apiKeyMiddleware, getAttendancesForIntegration);

// Endpoint integrasi untuk mendapatkan daftar pengajuan cuti
router.get('/leaves', apiKeyMiddleware, getLeavesForIntegration);

export default router;
