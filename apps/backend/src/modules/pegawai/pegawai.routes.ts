
import { Router } from 'express';
import PegawaiController from './pegawai.controller';

const router = Router();

router.get('/', PegawaiController.getAllPegawai);
router.get('/:id', PegawaiController.getPegawaiById);
router.get('/charts/gender-distribution', PegawaiController.getGenderDistribution);
router.get('/charts/education-distribution', PegawaiController.getEducationDistribution);
router.post('/', PegawaiController.uploadAvatar, PegawaiController.createPegawai);
router.put('/:id', PegawaiController.uploadAvatar, PegawaiController.updatePegawai);
router.delete('/:id', PegawaiController.deletePegawai);
router.put('/:id/payroll-info', PegawaiController.updatePegawaiPayrollInfo);

export default router;
