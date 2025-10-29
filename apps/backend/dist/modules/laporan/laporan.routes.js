"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const laporan_controller_1 = __importDefault(require("./laporan.controller"));
const custom_report_routes_1 = __importDefault(require("./custom-report.routes"));
const router = (0, express_1.Router)();
router.get('/employees', laporan_controller_1.default.getLaporanPegawai);
router.get('/attendance', laporan_controller_1.default.getLaporanAbsensi);
router.get('/payroll', laporan_controller_1.default.getLaporanPenggajian);
router.get('/leave', laporan_controller_1.default.getLaporanCuti);
router.get('/performance', laporan_controller_1.default.getLaporanKinerja);
router.get('/turnover', laporan_controller_1.default.getLaporanTurnover);
router.get('/demographics', laporan_controller_1.default.getLaporanDemografi);
router.get('/employees/comprehensive', laporan_controller_1.default.getLaporanPegawaiKomprehensif);
router.get('/attendance/analytics', laporan_controller_1.default.getLaporanAbsensiAnalitik);
router.get('/payroll/analytics', laporan_controller_1.default.getLaporanPenggajianAnalitik);
router.get('/employees/export', laporan_controller_1.default.exportLaporanPegawai);
router.get('/attendance/export', laporan_controller_1.default.exportLaporanAbsensi);
router.get('/payroll/export', laporan_controller_1.default.exportLaporanPenggajian);
router.get('/leave/export', laporan_controller_1.default.exportLaporanCuti);
router.get('/performance/export', laporan_controller_1.default.exportLaporanKinerja);
router.use('/custom', custom_report_routes_1.default);
exports.default = router;
//# sourceMappingURL=laporan.routes.js.map