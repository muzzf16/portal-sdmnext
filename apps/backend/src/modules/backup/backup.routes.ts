
import { Router } from 'express';
import * as controller from './backup.controller';

const router = Router();

router.post('/backup', controller.backup);
router.post('/restore', controller.restore);

export default router;
