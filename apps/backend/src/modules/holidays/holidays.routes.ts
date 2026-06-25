import { Router } from 'express';
import * as controller from './holidays.controller';
import { authenticateToken, restrictTo } from '../../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', controller.getAllHolidays);
router.post('/', restrictTo('admin', 'pimpinan'), controller.createHoliday);
router.put('/:id', restrictTo('admin', 'pimpinan'), controller.updateHoliday);
router.delete('/:id', restrictTo('admin', 'pimpinan'), controller.deleteHoliday);

export default router;
