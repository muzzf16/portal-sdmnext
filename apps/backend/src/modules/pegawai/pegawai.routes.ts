
import { Router } from 'express';
import PegawaiController from './pegawai.controller';
import PegawaiAuthController from './pegawai.auth.controller';

const router = Router();

// Specific routes MUST come before parametric /:id route
router.get('/charts/gender-distribution', PegawaiController.getGenderDistribution);
router.get('/charts/education-distribution', PegawaiController.getEducationDistribution);
router.get('/charts/department-distribution', PegawaiController.getDepartmentDistribution);

router.get('/', PegawaiController.getAllPegawai);
router.get('/:id', PegawaiController.getPegawaiById);

router.post('/', PegawaiController.uploadAvatar, PegawaiController.createPegawai);
router.post('/with-user', PegawaiController.uploadAvatar, PegawaiAuthController.createEmployeeWithUser);
router.put('/:id', PegawaiController.uploadAvatar, PegawaiController.updatePegawai);
router.delete('/:id', PegawaiController.deletePegawai);
router.put('/:id/payroll-info', PegawaiController.updatePegawaiPayrollInfo);

export default router;
