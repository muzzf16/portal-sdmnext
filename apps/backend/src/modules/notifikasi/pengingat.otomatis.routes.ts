import { Router } from 'express';
import PengingatOtomatisController from './pengingat.otomatis.controller';

const router = Router();

router.post('/contracts/expiring', PengingatOtomatisController.sendContractExpirationReminders);
router.post('/leave/approvals', PengingatOtomatisController.sendLeaveApprovalNotifications);
router.post('/payroll/releases', PengingatOtomatisController.sendPayrollReleaseNotifications);
router.post('/performance/reviews', PengingatOtomatisController.sendPerformanceReviewReminders);
router.post('/birthdays', PengingatOtomatisController.sendBirthdayReminders);
router.post('/all', PengingatOtomatisController.sendAllAutomatedReminders);

export default router;