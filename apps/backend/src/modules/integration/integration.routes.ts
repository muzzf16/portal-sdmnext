import { Router } from 'express';
import {
    getEmployeesForIntegration,
    getAttendancesForIntegration,
    getLeavesForIntegration,
    createAttendanceFromIntegration,
    createActivityLogFromIntegration
} from './integration.controller';
import { apiKeyMiddleware } from '../../middleware/apiKeyMiddleware';

const router = Router();

// Endpoint integrasi (Inbound/Outbound) 
router.get('/employees', apiKeyMiddleware, getEmployeesForIntegration);
router.get('/attendance', apiKeyMiddleware, getAttendancesForIntegration);
router.get('/leaves', apiKeyMiddleware, getLeavesForIntegration);

router.post('/attendance', apiKeyMiddleware, createAttendanceFromIntegration);
router.post('/daily-activities', apiKeyMiddleware, createActivityLogFromIntegration);

export default router;
