import { Router } from 'express';
import { KreditBerkasController } from './kredit-berkas.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/', KreditBerkasController.create);
router.get('/', KreditBerkasController.getAll);
router.get('/pending', KreditBerkasController.getPending);
router.get('/monitoring', KreditBerkasController.getMonitoring);
router.get('/:id', KreditBerkasController.getById);
router.put('/:id/process', KreditBerkasController.processStage);

export default router;
