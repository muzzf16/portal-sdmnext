
import { Router } from 'express';
import * as controller from './company-settings.controller';
import { uploadLogo } from '../../middleware/uploadMiddleware';

const router = Router();

router.get('/', controller.getSettings);
router.put('/', uploadLogo.single('logo'), controller.updateSettings);

export default router;
