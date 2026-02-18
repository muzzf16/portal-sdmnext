"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pegawai_repository_1 = require("../pegawai/pegawai.repository");
const absensi_repository_1 = require("../absensi/absensi.repository");
const permintaanCuti_repository_1 = require("../cuti/permintaanCuti.repository");
const penggajian_repository_1 = require("../penggajian/penggajian.repository");
const penilaianKinerja_repository_1 = require("../kinerja/penilaianKinerja.repository");
const kontrak_repository_1 = require("../kontrak/kontrak.repository");
const errors_1 = require("../../utils/errors");
const dashboard_service_1 = __importDefault(require("./dashboard.service"));
class DashboardController {
    static async getRecentActivity(req, res, next) {
        try {
            const activities = await dashboard_service_1.default.getRecentActivity();
            res.status(200).json({
                success: true,
                data: activities,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAdminDashboardData(req, res, next) {
        try {
            const [employeeStats, attendanceStats, leaveStats, payrollStats, performanceStats, contractStats, genderDistribution, educationDistribution] = await Promise.all([
                DashboardController.getEmployeeStats(),
                DashboardController.getAttendanceStats(),
                DashboardController.getLeaveStats(),
                DashboardController.getPayrollStats(),
                DashboardController.getPerformanceStats(),
                DashboardController.getContractStats(),
                pegawai_repository_1.PegawaiRepository.getGenderDistribution(),
                pegawai_repository_1.PegawaiRepository.getEducationDistribution()
            ]);
            return res.status(200).json({
                success: true,
                data: {
                    employeeStats,
                    attendanceStats,
                    leaveStats,
                    payrollStats,
                    performanceStats,
                    contractStats,
                    genderDistribution,
                    educationDistribution
                }
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async getEmployeeDashboardData(req, res, next) {
        try {
            const { employeeId } = req.params;
            if (!employeeId) {
                return res.status(400).json({
                    success: false,
                    message: 'Employee ID is required'
                });
            }
            const [attendanceSummary, leaveSummary, payrollSummary, performanceSummary] = await Promise.all([
                DashboardController.getEmployeeAttendanceSummary(employeeId),
                DashboardController.getEmployeeLeaveSummary(employeeId),
                DashboardController.getEmployeePayrollSummary(employeeId),
                DashboardController.getEmployeePerformanceSummary(employeeId)
            ]);
            return res.status(200).json({
                success: true,
                data: {
                    attendanceSummary,
                    leaveSummary,
                    payrollSummary,
                    performanceSummary
                }
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async getSupervisorDashboardData(req, res, next) {
        try {
            const user = req.user;
            if (!user || !user.employeeId) {
                throw new errors_1.AppError('User not authenticated or not linked to an employee', 401);
            }
            const supervisorId = user.employeeId;
            const [stats, subordinates] = await Promise.all([
                pegawai_repository_1.PegawaiRepository.getSupervisorStats(supervisorId),
                pegawai_repository_1.PegawaiRepository.findByAtasanId(supervisorId)
            ]);
            return res.status(200).json({
                success: true,
                data: {
                    stats,
                    subordinates
                }
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async getEmployeeStats() {
        const db = await pegawai_repository_1.PegawaiRepository['findAll']();
        const dbInstance = db.constructor;
        const totalEmployees = await dbInstance.get('SELECT COUNT(*) as count FROM pegawai');
        const activeEmployees = await dbInstance.get('SELECT COUNT(*) as count FROM pegawai WHERE isActive = 1');
        const inactiveEmployees = await dbInstance.get('SELECT COUNT(*) as count FROM pegawai WHERE isActive = 0');
        return {
            total: totalEmployees.count,
            active: activeEmployees.count,
            inactive: inactiveEmployees.count
        };
    }
    static async getAttendanceStats() {
        const db = await absensi_repository_1.AbsensiRepository['findAll']();
        const dbInstance = db.constructor;
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = await dbInstance.get('SELECT COUNT(*) as count FROM absensi WHERE date = ? AND status = "hadir"', today);
        return {
            todayPresent: todayAttendance.count,
            todayAbsent: 0
        };
    }
    static async getLeaveStats() {
        const db = await permintaanCuti_repository_1.PermintaanCutiRepository['findAll']();
        const dbInstance = db.constructor;
        const pendingLeaves = await dbInstance.get('SELECT COUNT(*) as count FROM permintaan_cuti WHERE status = "menunggu"');
        const approvedLeaves = await dbInstance.get('SELECT COUNT(*) as count FROM permintaan_cuti WHERE status = "disetujui"');
        return {
            pending: pendingLeaves.count,
            approved: approvedLeaves.count
        };
    }
    static async getPayrollStats() {
        const db = await penggajian_repository_1.PenggajianRepository['findAll']();
        const dbInstance = db.constructor;
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyPayroll = await dbInstance.get('SELECT COUNT(*) as count FROM penggajian WHERE period LIKE ?', `${currentMonth}%`);
        return {
            processedThisMonth: monthlyPayroll.count
        };
    }
    static async getPerformanceStats() {
        const db = await penilaianKinerja_repository_1.PenilaianKinerjaRepository['findAll']();
        const dbInstance = db.constructor;
        const completedReviews = await dbInstance.get('SELECT COUNT(*) as count FROM penilaian_kinerja WHERE status = "Completed"');
        return {
            completedReviews: completedReviews.count
        };
    }
    static async getContractStats() {
        const db = await kontrak_repository_1.KontrakRepository['findAll']();
        const dbInstance = db.constructor;
        const activeContracts = await dbInstance.get('SELECT COUNT(*) as count FROM kontrak WHERE status = "active"');
        const expiringContracts = await dbInstance.get('SELECT COUNT(*) as count FROM kontrak WHERE status = "expiring"');
        return {
            active: activeContracts.count,
            expiring: expiringContracts.count
        };
    }
    static async getEmployeeAttendanceSummary(employeeId) {
        const db = await absensi_repository_1.AbsensiRepository['findAll']();
        const dbInstance = db.constructor;
        const summary = await dbInstance.get(`SELECT 
        COUNT(*) as totalDays,
        SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END) as presentDays,
        SUM(CASE WHEN status IN ('izin', 'sakit', 'cuti') THEN 1 ELSE 0 END) as leaveDays
      FROM absensi 
      WHERE employeeId = ?`, employeeId);
        return {
            totalDays: summary.totalDays || 0,
            presentDays: summary.presentDays || 0,
            leaveDays: summary.leaveDays || 0,
            attendanceRate: summary.totalDays > 0
                ? Math.round((summary.presentDays / summary.totalDays) * 100)
                : 0
        };
    }
    static async getEmployeeLeaveSummary(employeeId) {
        const db = await permintaanCuti_repository_1.PermintaanCutiRepository['findAll']();
        const dbInstance = db.constructor;
        const summary = await dbInstance.get(`SELECT 
        COUNT(*) as totalRequests,
        SUM(CASE WHEN status = 'disetujui' THEN 1 ELSE 0 END) as approvedRequests
      FROM permintaan_cuti 
      WHERE employeeId = ?`, employeeId);
        return {
            totalRequests: summary.totalRequests || 0,
            approvedRequests: summary.approvedRequests || 0
        };
    }
    static async getEmployeePayrollSummary(employeeId) {
        const db = await penggajian_repository_1.PenggajianRepository['findAll']();
        const dbInstance = db.constructor;
        const latestPayroll = await dbInstance.get(`SELECT *
      FROM penggajian 
      WHERE employeeId = ?
      ORDER BY period DESC
      LIMIT 1`, employeeId);
        return latestPayroll || null;
    }
    static async getEmployeePerformanceSummary(employeeId) {
        const db = await penilaianKinerja_repository_1.PenilaianKinerjaRepository['findAll']();
        const dbInstance = db.constructor;
        const latestReview = await dbInstance.get(`SELECT *
      FROM penilaian_kinerja 
      WHERE employeeId = ?
      ORDER BY reviewDate DESC
      LIMIT 1`, employeeId);
        return latestReview || null;
    }
}
exports.default = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map