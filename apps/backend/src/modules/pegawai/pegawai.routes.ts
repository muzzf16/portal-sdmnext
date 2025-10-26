
import { Router } from 'express';
import PegawaiController from './pegawai.controller';

const router = Router();

router.get('/', PegawaiController.getAllPegawai);
router.get('/:id', PegawaiController.getPegawaiById);
router.post('/', PegawaiController.createPegawai);
router.put('/:id', PegawaiController.updatePegawai);
router.delete('/:id', PegawaiController.deletePegawai);
router.put('/:id/payroll-info', PegawaiController.updatePegawaiPayrollInfo);

export default router;
