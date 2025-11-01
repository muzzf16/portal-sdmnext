
// src/modules/laporan/laporan.repository.ts
import { openDb } from '../../config/db';

export const LaporanRepository = {
  async generateLaporanPegawai() {
    const db = await openDb();
    const employees = await db.all('SELECT id, name, email, position, department, joinDate, jenis_kelamin, isActive FROM pegawai');
    return employees;
  },

  async generateLaporanAbsensi(startDate: string, endDate: string) {
    const db = await openDb();
    const attendance = await db.all(
      'SELECT employeeId, date, clockIn, clockOut, status FROM absensi WHERE date BETWEEN ? AND ?',
      startDate, endDate
    );
    return attendance;
  },

  async generateLaporanPenggajian(month: string, year: string) {
    const db = await openDb();
    const payrolls = await db.all(
      "SELECT employeeId, period, baseSalary, totalIncome, totalDeductions, netSalary FROM penggajian WHERE period LIKE ?",
      `${year}-${month}%`
    );
    return payrolls;
  },
  
  async generateLaporanCuti(month: string, year: string) {
    const db = await openDb();
    const leaveRequests = await db.all(
      "SELECT employeeId, employeeName, leaveType, startDate, endDate, status FROM permintaan_cuti WHERE startDate LIKE ?",
      `${year}-${month}%`
    );
    return leaveRequests;
  },
  
  async generateLaporanKinerja(month: string, year: string) {
    const db = await openDb();
    const performanceReviews = await db.all(
      "SELECT employeeId, employeeName, period, overallScore, status FROM penilaian_kinerja WHERE reviewDate LIKE ?",
      `${year}-${month}%`
    );
    return performanceReviews;
  },

  // New method for employee turnover analysis
  async generateLaporanTurnover(startDate: string, endDate: string) {
    const db = await openDb();
    
    // Get employees who left during the period
    const turnoverQuery = `
      SELECT id, name, position, department, joinDate, tanggalKeluar as exitDate
      FROM pegawai
      WHERE tanggalKeluar BETWEEN ? AND ?
        AND isActive = 0
    `;
    
    const turnoverData = await db.all(turnoverQuery, [startDate, endDate]);
    
    // Calculate turnover rate
    const totalEmployeesQuery = `
      SELECT COUNT(*) as total FROM pegawai
      WHERE (joinDate <= ? OR tanggalKeluar IS NULL)
        AND (tanggalKeluar > ? OR tanggalKeluar IS NULL)
        AND isActive = 1
    `;
    
    const totalEmployees = await db.get(totalEmployeesQuery, [startDate, endDate]);
    const turnoverCount = turnoverData.length;
    const turnoverRate = totalEmployees.total > 0 ? (turnoverCount / totalEmployees.total) * 100 : 0;
    
    return {
      period: { startDate, endDate },
      turnoverCount,
      turnoverRate: parseFloat(turnoverRate.toFixed(2)),
      turnoverDetails: turnoverData
    };
  },

  // Additional analytics for employee demographics
  async generateLaporanDemografi() {
    const db = await openDb();
    
    // Get gender distribution
    const genderQuery = `
      SELECT jenis_kelamin, COUNT(*) as count
      FROM pegawai
      WHERE jenis_kelamin IS NOT NULL
      GROUP BY jenis_kelamin
    `;
    
    // Get department distribution
    const departmentQuery = `
      SELECT department, COUNT(*) as count
      FROM pegawai
      WHERE department IS NOT NULL
      GROUP BY department
    `;
    
    // Get tenure distribution (how long employees have been with company)
    const tenureQuery = `
      SELECT 
        CASE 
          WHEN julianday('now') - julianday(joinDate) < 365 THEN 'Kurang dari 1 tahun'
          WHEN julianday('now') - julianday(joinDate) BETWEEN 365 AND 1095 THEN '1-3 tahun'
          WHEN julianday('now') - julianday(joinDate) BETWEEN 1096 AND 1825 THEN '3-5 tahun'
          ELSE 'Lebih dari 5 tahun'
        END as range,
        COUNT(*) as count
      FROM pegawai
      WHERE joinDate IS NOT NULL
      GROUP BY range
    `;
    
    const genderData = await db.all(genderQuery);
    const departmentData = await db.all(departmentQuery);
    const tenureData = await db.all(tenureQuery);
    
    return {
      genderDistribution: genderData,
      departmentDistribution: departmentData,
      tenureDistribution: tenureData
    };
  },
  
  // Enhanced report with comprehensive employee data
  async generateLaporanPegawaiKomprehensif() {
    const db = await openDb();
    
    // Get comprehensive employee data with related information
    const employeesQuery = `
      SELECT 
        p.id,
        p.nip,
        p.name,
        p.email,
        p.position,
        p.department,
        p.joinDate,
        p.jenis_kelamin,
        p.isActive,
        p.tanggalKeluar,
        COUNT(DISTINCT a.id) as totalAttendance,
        COUNT(DISTINCT l.id) as totalLeaveRequests,
        COUNT(DISTINCT pa.id) as totalPayrolls,
        COUNT(DISTINCT pe.id) as totalPerformanceReviews,
        AVG(pe.overallScore) as averagePerformanceScore
      FROM pegawai p
      LEFT JOIN absensi a ON p.id = a.employeeId
      LEFT JOIN permintaan_cuti l ON p.id = l.employeeId
      LEFT JOIN penggajian pa ON p.id = pa.employeeId
      LEFT JOIN penilaian_kinerja pe ON p.id = pe.employeeId
      GROUP BY p.id, p.nip, p.name, p.email, p.position, p.department, p.joinDate, 
               p.jenis_kelamin, p.isActive, p.tanggalKeluar
      ORDER BY p.name ASC
    `;
    
    const employees = await db.all(employeesQuery);
    
    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as totalEmployees,
        SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as activeEmployees,
        SUM(CASE WHEN isActive = 0 THEN 1 ELSE 0 END) as inactiveEmployees,
        AVG(julianday('now') - julianday(joinDate)) as avgTenureDays
      FROM pegawai
    `;
    
    const summary = await db.get(summaryQuery);
    
    return {
      employees,
      summary: {
        ...summary,
        avgTenureMonths: Math.round((summary.avgTenureDays || 0) / 30)
      }
    };
  },
  
  // Enhanced attendance report with analytics
  async generateLaporanAbsensiAnalitik(startDate: string, endDate: string) {
    const db = await openDb();
    
    // Get detailed attendance data with analytics
    const attendanceQuery = `
      SELECT 
        a.employeeId,
        p.name as employeeName,
        p.position,
        p.department,
        a.date,
        a.clockIn,
        a.clockOut,
        a.status,
        a.workDuration,
        CASE 
          WHEN a.clockIn > '08:00:00' THEN 'Terlambat'
          WHEN a.clockIn <= '08:00:00' THEN 'Tepat Waktu'
          ELSE 'Tidak Hadir'
        END as punctuality
      FROM absensi a
      JOIN pegawai p ON a.employeeId = p.id
      WHERE a.date BETWEEN ? AND ?
      ORDER BY a.date DESC, a.clockIn ASC
    `;
    
    const attendance = await db.all(attendanceQuery, [startDate, endDate]);
    
    // Calculate punctuality statistics
    const punctualityStats = await db.get(`
      SELECT 
        COUNT(*) as totalRecords,
        SUM(CASE WHEN clockIn > '08:00:00' THEN 1 ELSE 0 END) as lateArrivals,
        SUM(CASE WHEN clockIn <= '08:00:00' THEN 1 ELSE 0 END) as onTimeArrivals
      FROM absensi
      WHERE date BETWEEN ? AND ?
    `, [startDate, endDate]);
    
    return {
      attendance,
      punctualityStats: {
        ...punctualityStats,
        latePercentage: punctualityStats.totalRecords > 0 
          ? Math.round((punctualityStats.lateArrivals / punctualityStats.totalRecords) * 100)
          : 0
      }
    };
  },
  
  // Enhanced payroll report with analytics
  async generateLaporanPenggajianAnalitik(month: string, year: string) {
    const db = await openDb();
    
    // Get detailed payroll data with analytics
    const payrollQuery = `
      SELECT 
        pa.employeeId,
        p.name as employeeName,
        p.position,
        p.department,
        pa.period,
        pa.baseSalary,
        pa.totalIncome,
        pa.totalDeductions,
        pa.netSalary,
        (pa.totalIncome / NULLIF(pa.baseSalary, 0)) * 100 as incomePercentage,
        (pa.totalDeductions / NULLIF(pa.baseSalary, 0)) * 100 as deductionPercentage
      FROM penggajian pa
      JOIN pegawai p ON pa.employeeId = p.id
      WHERE pa.period LIKE ?
      ORDER BY pa.netSalary DESC
    `;
    
    const payrolls = await db.all(payrollQuery, [`${year}-${month}%`]);
    
    // Calculate payroll statistics
    const statsQuery = `
      SELECT 
        AVG(baseSalary) as avgBaseSalary,
        AVG(netSalary) as avgNetSalary,
        MAX(netSalary) as maxNetSalary,
        MIN(netSalary) as minNetSalary,
        COUNT(*) as totalPayrolls
      FROM penggajian
      WHERE period LIKE ?
    `;
    
    const stats = await db.get(statsQuery, [`${year}-${month}%`]);
    
    return {
      payrolls,
      stats: {
        ...stats,
        avgBaseSalary: stats.avgBaseSalary ? Math.round(stats.avgBaseSalary) : 0,
        avgNetSalary: stats.avgNetSalary ? Math.round(stats.avgNetSalary) : 0,
        maxNetSalary: stats.maxNetSalary ? Math.round(stats.maxNetSalary) : 0,
        minNetSalary: stats.minNetSalary ? Math.round(stats.minNetSalary) : 0
      }
    };
  }
};
