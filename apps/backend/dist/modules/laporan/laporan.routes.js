"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const laporan_controller_1 = __importDefault(require("./laporan.controller"));
const router = (0, express_1.Router)();
router.get('/employees', laporan_controller_1.default.getLaporanPegawai);
router.get('/attendance', laporan_controller_1.default.getLaporanAbsensi);
router.get('/payroll', laporan_controller_1.default.getLaporanPenggajian);
router.get('/leave', laporan_controller_1.default.getLaporanCuti);
router.get('/performance', laporan_controller_1.default.getLaporanKinerja);
exports.default = router;
//# sourceMappingURL=laporan.routes.js.map