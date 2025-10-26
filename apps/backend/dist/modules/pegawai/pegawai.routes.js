"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pegawai_controller_1 = __importDefault(require("./pegawai.controller"));
const router = (0, express_1.Router)();
router.get('/', pegawai_controller_1.default.getAllPegawai);
router.get('/:id', pegawai_controller_1.default.getPegawaiById);
router.post('/', pegawai_controller_1.default.createPegawai);
router.put('/:id', pegawai_controller_1.default.updatePegawai);
router.delete('/:id', pegawai_controller_1.default.deletePegawai);
router.put('/:id/payroll-info', pegawai_controller_1.default.updatePegawaiPayrollInfo);
exports.default = router;
//# sourceMappingURL=pegawai.routes.js.map