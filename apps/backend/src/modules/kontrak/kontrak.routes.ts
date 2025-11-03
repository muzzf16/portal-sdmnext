
import { Router } from 'express';
import KontrakController from './kontrak.controller';
import { uploadDocument } from '../../middleware/uploadMiddleware';

const router = Router();

router.get('/', KontrakController.getAllContracts);
router.get('/:id', KontrakController.getContractById);
router.get('/employee/:employeeId', KontrakController.getContractsByEmployeeId);
router.get('/expiring', KontrakController.getExpiringContracts);
router.post('/', uploadDocument.single('contractFile'), KontrakController.createContract);
router.put('/:id', uploadDocument.single('contractFile'), KontrakController.updateContract);
router.delete('/:id', KontrakController.deleteContract);

// Job History Routes (Riwayat Jabatan)
router.get('/job-history/employee/:id', KontrakController.getRiwayatJabatan);
router.post('/job-history/employee/:id', KontrakController.addRiwayatJabatan);

export default router;
