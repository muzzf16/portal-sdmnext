"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const kpi_controller_1 = __importDefault(require("./kpi.controller"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const uploadMiddleware_1 = require("../../middleware/uploadMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken);
router.get('/', kpi_controller_1.default.getAll);
router.get('/employee/:employeeId', kpi_controller_1.default.getByEmployeeId);
router.get('/:id', kpi_controller_1.default.getById);
router.post('/', (0, authMiddleware_1.restrictTo)('admin', 'pimpinan', 'supervisor'), kpi_controller_1.default.create);
router.post('/generate-from-abk', (0, authMiddleware_1.restrictTo)('admin', 'pimpinan', 'supervisor'), kpi_controller_1.default.generateFromAbk);
router.post('/sync-wla', (0, authMiddleware_1.restrictTo)('admin', 'pimpinan', 'supervisor'), kpi_controller_1.default.syncRealisasiFromWla);
router.put('/:id', (0, authMiddleware_1.restrictTo)('admin', 'pimpinan', 'supervisor'), kpi_controller_1.default.update);
router.put('/:id/actual', (0, authMiddleware_1.restrictTo)('admin', 'pimpinan', 'supervisor'), uploadMiddleware_1.uploadDocument.single('evidence'), kpi_controller_1.default.updateActualValue);
router.post('/:id/evidence', (0, authMiddleware_1.restrictTo)('admin', 'pimpinan', 'supervisor'), uploadMiddleware_1.uploadDocument.single('evidence'), kpi_controller_1.default.uploadEvidence);
router.delete('/:id', (0, authMiddleware_1.restrictTo)('admin', 'pimpinan', 'supervisor'), kpi_controller_1.default.delete);
exports.default = router;
//# sourceMappingURL=kpi.routes.js.map