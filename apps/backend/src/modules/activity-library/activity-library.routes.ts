import { Router } from 'express';
import ActivityLibraryController from './activity-library.controller';
import { authenticateToken, restrictTo } from '../../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', ActivityLibraryController.getAll);
router.get('/positions', ActivityLibraryController.getPositions);
router.get('/position/:position', ActivityLibraryController.getByPosition);
router.get('/:id', ActivityLibraryController.getById);
router.post('/', restrictTo('admin', 'pimpinan'), ActivityLibraryController.create);
router.put('/:id', restrictTo('admin', 'pimpinan'), ActivityLibraryController.update);
router.delete('/:id', restrictTo('admin', 'pimpinan'), ActivityLibraryController.delete);

export default router;
