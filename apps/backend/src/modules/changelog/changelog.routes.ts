import { Router } from 'express';
import ChangelogController from './changelog.controller';
import { authenticateToken, restrictTo } from '../../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.get('/', restrictTo('admin', 'pimpinan'), ChangelogController.getAll);
router.post('/', restrictTo('admin', 'pimpinan'), ChangelogController.create);

export default router;
