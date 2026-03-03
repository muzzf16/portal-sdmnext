"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const integration_controller_1 = require("./integration.controller");
const apiKeyMiddleware_1 = require("../../middleware/apiKeyMiddleware");
const router = (0, express_1.Router)();
router.get('/employees', apiKeyMiddleware_1.apiKeyMiddleware, integration_controller_1.getEmployeesForIntegration);
router.get('/attendance', apiKeyMiddleware_1.apiKeyMiddleware, integration_controller_1.getAttendancesForIntegration);
router.get('/leaves', apiKeyMiddleware_1.apiKeyMiddleware, integration_controller_1.getLeavesForIntegration);
router.post('/attendance', apiKeyMiddleware_1.apiKeyMiddleware, integration_controller_1.createAttendanceFromIntegration);
router.post('/daily-activities', apiKeyMiddleware_1.apiKeyMiddleware, integration_controller_1.createActivityLogFromIntegration);
exports.default = router;
//# sourceMappingURL=integration.routes.js.map