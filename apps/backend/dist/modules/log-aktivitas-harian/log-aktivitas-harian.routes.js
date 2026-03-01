"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const log_aktivitas_harian_controller_1 = __importDefault(require("./log-aktivitas-harian.controller"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken);
router.post('/bulk', log_aktivitas_harian_controller_1.default.uploadAny, log_aktivitas_harian_controller_1.default.createBulkLog);
router.post('/', log_aktivitas_harian_controller_1.default.uploadAny, log_aktivitas_harian_controller_1.default.createLog);
router.get('/my-logs', log_aktivitas_harian_controller_1.default.getMyLogs);
router.get('/summary', log_aktivitas_harian_controller_1.default.getSummary);
router.get('/admin/summary', (0, authMiddleware_1.restrictTo)('admin', 'pimpinan', 'supervisor'), log_aktivitas_harian_controller_1.default.getAdminSummary);
router.get('/admin/logs', (0, authMiddleware_1.restrictTo)('admin', 'pimpinan', 'supervisor'), log_aktivitas_harian_controller_1.default.getAdminLogs);
router.put('/:id/status', (0, authMiddleware_1.restrictTo)('admin', 'pimpinan', 'supervisor'), log_aktivitas_harian_controller_1.default.updateStatus);
exports.default = router;
//# sourceMappingURL=log-aktivitas-harian.routes.js.map