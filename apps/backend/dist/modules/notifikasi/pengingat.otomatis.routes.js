"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pengingat_otomatis_controller_1 = __importDefault(require("./pengingat.otomatis.controller"));
const router = (0, express_1.Router)();
router.post('/contracts/expiring', pengingat_otomatis_controller_1.default.sendContractExpirationReminders);
router.post('/leave/approvals', pengingat_otomatis_controller_1.default.sendLeaveApprovalNotifications);
router.post('/payroll/releases', pengingat_otomatis_controller_1.default.sendPayrollReleaseNotifications);
router.post('/performance/reviews', pengingat_otomatis_controller_1.default.sendPerformanceReviewReminders);
router.post('/birthdays', pengingat_otomatis_controller_1.default.sendBirthdayReminders);
router.post('/all', pengingat_otomatis_controller_1.default.sendAllAutomatedReminders);
exports.default = router;
//# sourceMappingURL=pengingat.otomatis.routes.js.map