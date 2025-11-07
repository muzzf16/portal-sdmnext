"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const laporan_service_1 = __importDefault(require("./laporan.service"));
class LaporanController {
    static async getLaporanPegawai(req, res, next) {
        try {
            const report = await laporan_service_1.default.generateLaporanPegawai();
            return res.status(200).json({
                success: true,
                data: report
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async getLaporanAbsensi(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const report = await laporan_service_1.default.generateLaporanAbsensi(startDate, endDate);
            return res.status(200).json({
                success: true,
                data: report
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async getLaporanPenggajian(req, res, next) {
        try {
            const { month, year } = req.query;
            const report = await laporan_service_1.default.generateLaporanPenggajian(month, year);
            return res.status(200).json({
                success: true,
                data: report
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async getLaporanCuti(req, res, next) {
        try {
            const { month, year } = req.query;
            const report = await laporan_service_1.default.generateLaporanCuti(month, year);
            return res.status(200).json({
                success: true,
                data: report
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async getLaporanKinerja(req, res, next) {
        try {
            const { month, year } = req.query;
            const report = await laporan_service_1.default.generateLaporanKinerja(month, year);
            return res.status(200).json({
                success: true,
                data: report
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async getLaporanTurnover(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'startDate and endDate are required'
                });
            }
            const report = await laporan_service_1.default.generateLaporanTurnover(startDate, endDate);
            return res.status(200).json({
                success: true,
                data: report
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async getLaporanDemografi(req, res, next) {
        try {
            const report = await laporan_service_1.default.generateLaporanDemografi();
            return res.status(200).json({
                success: true,
                data: report
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async getLaporanPegawaiKomprehensif(req, res, next) {
        try {
            const report = await laporan_service_1.default.generateLaporanPegawaiKomprehensif();
            return res.status(200).json({
                success: true,
                data: report
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async getLaporanAbsensiAnalitik(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'startDate and endDate are required'
                });
            }
            const report = await laporan_service_1.default.generateLaporanAbsensiAnalitik(startDate, endDate);
            return res.status(200).json({
                success: true,
                data: report
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async getLaporanPenggajianAnalitik(req, res, next) {
        try {
            const { month, year } = req.query;
            if (!month || !year) {
                return res.status(400).json({
                    success: false,
                    message: 'month and year are required'
                });
            }
            const report = await laporan_service_1.default.generateLaporanPenggajianAnalitik(month, year);
            return res.status(200).json({
                success: true,
                data: report
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async exportLaporanPegawai(req, res, next) {
        try {
            const report = await laporan_service_1.default.generateLaporanPegawai();
            const formattedData = laporan_service_1.default.formatForExport(report, 'pegawai');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=laporan-pegawai.xlsx');
            return res.status(200).json({
                success: true,
                data: formattedData,
                metadata: {
                    reportType: 'pegawai',
                    exportFormat: 'xlsx',
                    timestamp: new Date().toISOString()
                }
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async exportLaporanAbsensi(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'startDate and endDate are required'
                });
            }
            const report = await laporan_service_1.default.generateLaporanAbsensi(startDate, endDate);
            const formattedData = laporan_service_1.default.formatForExport(report, 'absensi');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=laporan-absensi.xlsx');
            return res.status(200).json({
                success: true,
                data: formattedData,
                metadata: {
                    reportType: 'absensi',
                    exportFormat: 'xlsx',
                    timestamp: new Date().toISOString(),
                    filters: { startDate, endDate }
                }
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async exportLaporanPenggajian(req, res, next) {
        try {
            const { month, year } = req.query;
            if (!month || !year) {
                return res.status(400).json({
                    success: false,
                    message: 'month and year are required'
                });
            }
            const report = await laporan_service_1.default.generateLaporanPenggajian(month, year);
            const formattedData = laporan_service_1.default.formatForExport(report, 'penggajian');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=laporan-penggajian.xlsx');
            return res.status(200).json({
                success: true,
                data: formattedData,
                metadata: {
                    reportType: 'penggajian',
                    exportFormat: 'xlsx',
                    timestamp: new Date().toISOString(),
                    filters: { month, year }
                }
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async exportLaporanCuti(req, res, next) {
        try {
            const { month, year } = req.query;
            if (!month || !year) {
                return res.status(400).json({
                    success: false,
                    message: 'month and year are required'
                });
            }
            const report = await laporan_service_1.default.generateLaporanCuti(month, year);
            const formattedData = laporan_service_1.default.formatForExport(report, 'cuti');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=laporan-cuti.xlsx');
            return res.status(200).json({
                success: true,
                data: formattedData,
                metadata: {
                    reportType: 'cuti',
                    exportFormat: 'xlsx',
                    timestamp: new Date().toISOString(),
                    filters: { month, year }
                }
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async exportLaporanKinerja(req, res, next) {
        try {
            const { month, year } = req.query;
            if (!month || !year) {
                return res.status(400).json({
                    success: false,
                    message: 'month and year are required'
                });
            }
            const report = await laporan_service_1.default.generateLaporanKinerja(month, year);
            const formattedData = laporan_service_1.default.formatForExport(report, 'kinerja');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=laporan-kinerja.xlsx');
            return res.status(200).json({
                success: true,
                data: formattedData,
                metadata: {
                    reportType: 'kinerja',
                    exportFormat: 'xlsx',
                    timestamp: new Date().toISOString(),
                    filters: { month, year }
                }
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
}
exports.default = LaporanController;
//# sourceMappingURL=laporan.controller.js.map