import { Router } from 'express';
import ActivityLibraryController from './activity-library.controller';

const router = Router();

router.get('/', ActivityLibraryController.getAll);
router.get('/positions', ActivityLibraryController.getPositions);
router.get('/position/:position', ActivityLibraryController.getByPosition);
router.get('/:id', ActivityLibraryController.getById);
router.post('/', ActivityLibraryController.create);
router.put('/:id', ActivityLibraryController.update);
router.delete('/:id', ActivityLibraryController.delete);

export default router;
