import { Router } from 'express';
import CustomReportController from './custom-report.controller';

const router = Router();

router.get('/metadata', CustomReportController.getReportMetadata);
router.post('/generate', CustomReportController.generateCustomReport);
router.post('/export', CustomReportController.exportCustomReport);

export default router;