import { Router } from 'express';
import DashboardController from './dashboard.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();


router.get('/admin', DashboardController.getAdminDashboardData);
router.get('/supervisor', authenticateToken, DashboardController.getSupervisorDashboardData);
router.get('/employee/:employeeId', DashboardController.getEmployeeDashboardData);
router.get('/recent-activity', DashboardController.getRecentActivity);

export default router;