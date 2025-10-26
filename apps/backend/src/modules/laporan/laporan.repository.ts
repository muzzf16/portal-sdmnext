
// src/modules/laporan/laporan.repository.ts
import { openDb } from '../../config/db';

export const LaporanRepository = {
  async generateLaporanPegawai() {
    const db = await openDb();
    const employees = await db.all('SELECT id, name, email, position, department, joinDate FROM pegawai');
    return employees;
  },

  async generateLaporanAbsensi(startDate: string, endDate: string) {
    const db = await openDb();
    const attendance = await db.all(
      'SELECT employeeId, date, clockIn, clockOut FROM absensi WHERE date BETWEEN ? AND ?',
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
  }
};
