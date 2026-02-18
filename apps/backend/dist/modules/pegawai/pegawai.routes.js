"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pegawai_controller_1 = __importDefault(require("./pegawai.controller"));
const pegawai_auth_controller_1 = __importDefault(require("./pegawai.auth.controller"));
const router = (0, express_1.Router)();
router.get('/charts/gender-distribution', pegawai_controller_1.default.getGenderDistribution);
router.get('/charts/education-distribution', pegawai_controller_1.default.getEducationDistribution);
router.get('/charts/department-distribution', pegawai_controller_1.default.getDepartmentDistribution);
router.get('/', pegawai_controller_1.default.getAllPegawai);
router.get('/:id', pegawai_controller_1.default.getPegawaiById);
router.post('/', pegawai_controller_1.default.uploadAvatar, pegawai_controller_1.default.createPegawai);
router.post('/with-user', pegawai_controller_1.default.uploadAvatar, pegawai_auth_controller_1.default.createEmployeeWithUser);
router.put('/:id', pegawai_controller_1.default.uploadAvatar, pegawai_controller_1.default.updatePegawai);
router.delete('/:id', pegawai_controller_1.default.deletePegawai);
router.put('/:id/payroll-info', pegawai_controller_1.default.updatePegawaiPayrollInfo);
exports.default = router;
//# sourceMappingURL=pegawai.routes.js.map