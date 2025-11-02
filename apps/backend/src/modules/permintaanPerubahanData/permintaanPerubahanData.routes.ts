import { Router } from 'express';
import * as controller from './permintaanPerubahanData.controller';
import { authenticateToken, restrictTo } from '../../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.route('/')
  .post(restrictTo('employee'), controller.submitRequest)
  .get(restrictTo('admin'), controller.getRequests);

router.route('/:id/handle')
    .patch(restrictTo('admin'), controller.handleRequest);

export default router;