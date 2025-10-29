import { Router } from 'express';
import DashboardController from './dashboard.controller';

const router = Router();

router.get('/admin', DashboardController.getAdminDashboardData);
router.get('/employee/:employeeId', DashboardController.getEmployeeDashboardData);

export default router;