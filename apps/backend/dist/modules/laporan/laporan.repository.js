"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaporanRepository = void 0;
const db_1 = require("../../config/db");
exports.LaporanRepository = {
    async generateLaporanPegawai() {
        const db = await (0, db_1.openDb)();
        const employees = await db.all('SELECT id, name, email, position, department, joinDate FROM pegawai');
        return employees;
    },
    async generateLaporanAbsensi(startDate, endDate) {
        const db = await (0, db_1.openDb)();
        const attendance = await db.all('SELECT employeeId, date, clockIn, clockOut FROM absensi WHERE date BETWEEN ? AND ?', startDate, endDate);
        return attendance;
    },
    async generateLaporanPenggajian(month, year) {
        const db = await (0, db_1.openDb)();
        const payrolls = await db.all("SELECT employeeId, period, baseSalary, totalIncome, totalDeductions, netSalary FROM penggajian WHERE period LIKE ?", `${year}-${month}%`);
        return payrolls;
    },
    async generateLaporanCuti(month, year) {
        const db = await (0, db_1.openDb)();
        const leaveRequests = await db.all("SELECT employeeId, employeeName, leaveType, startDate, endDate, status FROM permintaan_cuti WHERE startDate LIKE ?", `${year}-${month}%`);
        return leaveRequests;
    },
    async generateLaporanKinerja(month, year) {
        const db = await (0, db_1.openDb)();
        const performanceReviews = await db.all("SELECT employeeId, employeeName, period, overallScore, status FROM penilaian_kinerja WHERE reviewDate LIKE ?", `${year}-${month}%`);
        return performanceReviews;
    }
};
//# sourceMappingURL=laporan.repository.js.map