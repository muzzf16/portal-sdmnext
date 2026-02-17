import { Request, Response, NextFunction } from 'express';
import { PegawaiRepository } from '../pegawai/pegawai.repository';
import { AbsensiRepository } from '../absensi/absensi.repository';
import { PermintaanCutiRepository } from '../cuti/permintaanCuti.repository';
import { PenggajianRepository } from '../penggajian/penggajian.repository';
import { PenilaianKinerjaRepository } from '../kinerja/penilaianKinerja.repository';
import { KontrakRepository } from '../kontrak/kontrak.repository';
import { AppError } from '../../utils/errors';
import DashboardService from './dashboard.service';

class DashboardController {
  static async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const activities = await DashboardService.getRecentActivity();
      res.status(200).json({
        success: true,
        data: activities,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAdminDashboardData(req: Request, res: Response, next: NextFunction) {
    try {
      // Get all dashboard data in parallel
      const [
        employeeStats,
        attendanceStats,
        leaveStats,
        payrollStats,
        performanceStats,
        contractStats,
        genderDistribution,
        educationDistribution
      ] = await Promise.all([
        DashboardController.getEmployeeStats(),
        DashboardController.getAttendanceStats(),
        DashboardController.getLeaveStats(),
        DashboardController.getPayrollStats(),
        DashboardController.getPerformanceStats(),
        DashboardController.getContractStats(),
        PegawaiRepository.getGenderDistribution(),
        PegawaiRepository.getEducationDistribution()
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
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }

  static async getEmployeeDashboardData(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID is required'
        });
      }

      // Get employee dashboard data in parallel
      const [
        attendanceSummary,
        leaveSummary,
        payrollSummary,
        performanceSummary
      ] = await Promise.all([
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
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }

  static async getSupervisorDashboardData(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      if (!user || !user.employeeId) {
        throw new AppError('User not authenticated or not linked to an employee', 401);
      }

      const supervisorId = user.employeeId;

      const [stats, subordinates] = await Promise.all([
        PegawaiRepository.getSupervisorStats(supervisorId),
        PegawaiRepository.findByAtasanId(supervisorId)
      ]);

      return res.status(200).json({
        success: true,
        data: {
          stats,
          subordinates
        }
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  private static async getEmployeeStats() {
    const db = await PegawaiRepository['findAll'](); // Just to get db connection
    const dbInstance = (db as any).constructor; // Get db instance

    const totalEmployees = await dbInstance.get('SELECT COUNT(*) as count FROM pegawai');
    const activeEmployees = await dbInstance.get('SELECT COUNT(*) as count FROM pegawai WHERE isActive = 1');
    const inactiveEmployees = await dbInstance.get('SELECT COUNT(*) as count FROM pegawai WHERE isActive = 0');

    return {
      total: totalEmployees.count,
      active: activeEmployees.count,
      inactive: inactiveEmployees.count
    };
  }

  private static async getAttendanceStats() {
    const db = await AbsensiRepository['findAll'](); // Just to get db connection
    const dbInstance = (db as any).constructor; // Get db instance

    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await dbInstance.get(
      'SELECT COUNT(*) as count FROM absensi WHERE date = ? AND status = "hadir"',
      today
    );

    return {
      todayPresent: todayAttendance.count,
      todayAbsent: 0 // Would need more complex query to calculate this
    };
  }

  private static async getLeaveStats() {
    const db = await PermintaanCutiRepository['findAll'](); // Just to get db connection
    const dbInstance = (db as any).constructor; // Get db instance

    const pendingLeaves = await dbInstance.get(
      'SELECT COUNT(*) as count FROM permintaan_cuti WHERE status = "menunggu"'
    );

    const approvedLeaves = await dbInstance.get(
      'SELECT COUNT(*) as count FROM permintaan_cuti WHERE status = "disetujui"'
    );

    return {
      pending: pendingLeaves.count,
      approved: approvedLeaves.count
    };
  }

  private static async getPayrollStats() {
    const db = await PenggajianRepository['findAll'](); // Just to get db connection
    const dbInstance = (db as any).constructor; // Get db instance

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyPayroll = await dbInstance.get(
      'SELECT COUNT(*) as count FROM penggajian WHERE period LIKE ?',
      `${currentMonth}%`
    );

    return {
      processedThisMonth: monthlyPayroll.count
    };
  }

  private static async getPerformanceStats() {
    const db = await PenilaianKinerjaRepository['findAll'](); // Just to get db connection
    const dbInstance = (db as any).constructor; // Get db instance

    const completedReviews = await dbInstance.get(
      'SELECT COUNT(*) as count FROM penilaian_kinerja WHERE status = "Completed"'
    );

    return {
      completedReviews: completedReviews.count
    };
  }

  private static async getContractStats() {
    const db = await KontrakRepository['findAll'](); // Just to get db connection
    const dbInstance = (db as any).constructor; // Get db instance

    const activeContracts = await dbInstance.get(
      'SELECT COUNT(*) as count FROM kontrak WHERE status = "active"'
    );

    const expiringContracts = await dbInstance.get(
      'SELECT COUNT(*) as count FROM kontrak WHERE status = "expiring"'
    );

    return {
      active: activeContracts.count,
      expiring: expiringContracts.count
    };
  }

  private static async getEmployeeAttendanceSummary(employeeId: string) {
    const db = await AbsensiRepository['findAll'](); // Just to get db connection
    const dbInstance = (db as any).constructor; // Get db instance

    const summary = await dbInstance.get(
      `SELECT 
        COUNT(*) as totalDays,
        SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END) as presentDays,
        SUM(CASE WHEN status IN ('izin', 'sakit', 'cuti') THEN 1 ELSE 0 END) as leaveDays
      FROM absensi 
      WHERE employeeId = ?`,
      employeeId
    );

    return {
      totalDays: summary.totalDays || 0,
      presentDays: summary.presentDays || 0,
      leaveDays: summary.leaveDays || 0,
      attendanceRate: summary.totalDays > 0
        ? Math.round((summary.presentDays / summary.totalDays) * 100)
        : 0
    };
  }

  private static async getEmployeeLeaveSummary(employeeId: string) {
    const db = await PermintaanCutiRepository['findAll'](); // Just to get db connection
    const dbInstance = (db as any).constructor; // Get db instance

    const summary = await dbInstance.get(
      `SELECT 
        COUNT(*) as totalRequests,
        SUM(CASE WHEN status = 'disetujui' THEN 1 ELSE 0 END) as approvedRequests
      FROM permintaan_cuti 
      WHERE employeeId = ?`,
      employeeId
    );

    return {
      totalRequests: summary.totalRequests || 0,
      approvedRequests: summary.approvedRequests || 0
    };
  }

  private static async getEmployeePayrollSummary(employeeId: string) {
    const db = await PenggajianRepository['findAll'](); // Just to get db connection
    const dbInstance = (db as any).constructor; // Get db instance

    const latestPayroll = await dbInstance.get(
      `SELECT *
      FROM penggajian 
      WHERE employeeId = ?
      ORDER BY period DESC
      LIMIT 1`,
      employeeId
    );

    return latestPayroll || null;
  }

  private static async getEmployeePerformanceSummary(employeeId: string) {
    const db = await PenilaianKinerjaRepository['findAll'](); // Just to get db connection
    const dbInstance = (db as any).constructor; // Get db instance

    const latestReview = await dbInstance.get(
      `SELECT *
      FROM penilaian_kinerja 
      WHERE employeeId = ?
      ORDER BY reviewDate DESC
      LIMIT 1`,
      employeeId
    );

    return latestReview || null;
  }
}

export default DashboardController;