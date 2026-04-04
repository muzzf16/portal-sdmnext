import { Request, Response, NextFunction } from 'express';
import { openDb } from '../../config/db';
import { PegawaiRepository } from '../pegawai/pegawai.repository';
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
      const db = await openDb();

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
        DashboardController.getEmployeeStats(db),
        DashboardController.getAttendanceStats(db),
        DashboardController.getLeaveStats(db),
        DashboardController.getPayrollStats(db),
        DashboardController.getPerformanceStats(db),
        DashboardController.getContractStats(db),
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
      return;
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

      const db = await openDb();

      const [
        attendanceSummary,
        leaveSummary,
        payrollSummary,
        performanceSummary
      ] = await Promise.all([
        DashboardController.getEmployeeAttendanceSummary(db, employeeId),
        DashboardController.getEmployeeLeaveSummary(db, employeeId),
        DashboardController.getEmployeePayrollSummary(db, employeeId),
        DashboardController.getEmployeePerformanceSummary(db, employeeId)
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
      return;
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

  // ─── Private helpers using proper DB connection ───────────────

  private static async getEmployeeStats(db: any) {
    const totalEmployees = await db.get('SELECT COUNT(*) as count FROM pegawai');
    const activeEmployees = await db.get('SELECT COUNT(*) as count FROM pegawai WHERE isActive = 1');
    const inactiveEmployees = await db.get('SELECT COUNT(*) as count FROM pegawai WHERE isActive = 0');

    return {
      total: totalEmployees?.count || 0,
      active: activeEmployees?.count || 0,
      inactive: inactiveEmployees?.count || 0
    };
  }

  private static async getAttendanceStats(db: any) {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await db.get(
      "SELECT COUNT(DISTINCT employeeId) as count FROM absensi WHERE date = ? AND clockIn IS NOT NULL",
      today
    );

    return {
      todayPresent: todayAttendance?.count || 0
    };
  }

  private static async getLeaveStats(db: any) {
    const pendingLeaves = await db.get(
      "SELECT COUNT(*) as count FROM permintaan_cuti WHERE LOWER(status) = 'menunggu'"
    );
    const approvedLeaves = await db.get(
      "SELECT COUNT(*) as count FROM permintaan_cuti WHERE LOWER(status) = 'disetujui'"
    );

    return {
      pending: pendingLeaves?.count || 0,
      approved: approvedLeaves?.count || 0
    };
  }

  private static async getPayrollStats(db: any) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyPayroll = await db.get(
      'SELECT COUNT(*) as count FROM penggajian WHERE period LIKE ?',
      `${currentMonth}%`
    );

    return {
      processedThisMonth: monthlyPayroll?.count || 0
    };
  }

  private static async getPerformanceStats(db: any) {
    const completedReviews = await db.get(
      "SELECT COUNT(*) as count FROM penilaian_kinerja WHERE status = 'Completed'"
    );

    return {
      completedReviews: completedReviews?.count || 0
    };
  }

  private static async getContractStats(db: any) {
    const activeContracts = await db.get(
      "SELECT COUNT(*) as count FROM kontrak WHERE LOWER(status) = 'active'"
    );
    const expiringContracts = await db.get(
      `SELECT COUNT(*) as count FROM kontrak
       WHERE LOWER(status) = 'active'
       AND endDate IS NOT NULL
       AND date(endDate) <= date('now', '+90 days')
       AND date(endDate) >= date('now')`
    );

    return {
      active: activeContracts?.count || 0,
      expiring: expiringContracts?.count || 0
    };
  }

  private static async getEmployeeAttendanceSummary(db: any, employeeId: string) {
    const summary = await db.get(
      `SELECT
        COUNT(*) as totalDays,
        SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END) as presentDays,
        SUM(CASE WHEN status IN ('izin', 'sakit', 'cuti') THEN 1 ELSE 0 END) as leaveDays
      FROM absensi
      WHERE employeeId = ?`,
      employeeId
    );

    return {
      totalDays: summary?.totalDays || 0,
      presentDays: summary?.presentDays || 0,
      leaveDays: summary?.leaveDays || 0,
      attendanceRate: summary?.totalDays > 0
        ? Math.round((summary.presentDays / summary.totalDays) * 100)
        : 0
    };
  }

  private static async getEmployeeLeaveSummary(db: any, employeeId: string) {
    const summary = await db.get(
      `SELECT
        COUNT(*) as totalRequests,
        SUM(CASE WHEN LOWER(status) = 'disetujui' THEN 1 ELSE 0 END) as approvedRequests
      FROM permintaan_cuti
      WHERE employeeId = ?`,
      employeeId
    );

    return {
      totalRequests: summary?.totalRequests || 0,
      approvedRequests: summary?.approvedRequests || 0
    };
  }

  private static async getEmployeePayrollSummary(db: any, employeeId: string) {
    const latestPayroll = await db.get(
      `SELECT *
      FROM penggajian
      WHERE employeeId = ?
      ORDER BY period DESC
      LIMIT 1`,
      employeeId
    );

    return latestPayroll || null;
  }

  private static async getEmployeePerformanceSummary(db: any, employeeId: string) {
    const latestReview = await db.get(
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