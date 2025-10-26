"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const permintaanPerubahanData_controller_1 = __importDefault(require("./permintaanPerubahanData.controller"));
const router = (0, express_1.Router)();
router.get('/', permintaanPerubahanData_controller_1.default.getAllPermintaanPerubahanData);
router.get('/:id', permintaanPerubahanData_controller_1.default.getPermintaanPerubahanDataById);
router.get('/employee/:id', permintaanPerubahanData_controller_1.default.getPermintaanPerubahanDataByEmployeeId);
router.get('/pending', permintaanPerubahanData_controller_1.default.getPendingPermintaanPerubahanData);
router.post('/', permintaanPerubahanData_controller_1.default.createPermintaanPerubahanData);
router.put('/:id/status', permintaanPerubahanData_controller_1.default.updatePermintaanPerubahanDataStatus);
router.delete('/:id', permintaanPerubahanData_controller_1.default.deletePermintaanPerubahanData);
exports.default = router;
//# sourceMappingURL=permintaanPerubahanData.routes.js.map