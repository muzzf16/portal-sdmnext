"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const penggajian_controller_1 = __importDefault(require("./penggajian.controller"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', penggajian_controller_1.default.getAllPenggajian);
router.get('/:id', penggajian_controller_1.default.getPenggajianById);
router.get('/employee/:id', penggajian_controller_1.default.getPenggajianByEmployeeId);
router.post('/', penggajian_controller_1.default.createPenggajian);
router.put('/:id', penggajian_controller_1.default.updatePenggajian);
router.post('/run', penggajian_controller_1.default.runPayroll);
router.delete('/:id', penggajian_controller_1.default.deletePenggajian);
router.post('/:id/components', penggajian_controller_1.default.addSalaryComponent);
router.get('/:id/download', penggajian_controller_1.default.downloadPayslip);
router.patch('/:id/status', authMiddleware_1.authenticateToken, (0, authMiddleware_1.restrictTo)('admin'), penggajian_controller_1.default.updateStatus);
exports.default = router;
//# sourceMappingURL=penggajian.routes.js.map