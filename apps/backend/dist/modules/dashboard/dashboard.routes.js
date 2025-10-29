"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = __importDefault(require("./dashboard.controller"));
const router = (0, express_1.Router)();
router.get('/admin', dashboard_controller_1.default.getAdminDashboardData);
router.get('/employee/:employeeId', dashboard_controller_1.default.getEmployeeDashboardData);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map