"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const laporan_repository_1 = require("./laporan.repository");
const errors_1 = require("../../utils/errors");
class LaporanService {
    static async generateLaporanPegawai() {
        try {
            return await laporan_repository_1.LaporanRepository.generateLaporanPegawai();
        }
        catch (error) {
            throw new errors_1.AppError(`Error generating employee report: ${error.message}`, 500);
        }
    }
    static async generateLaporanAbsensi(startDate, endDate) {
        try {
            return await laporan_repository_1.LaporanRepository.generateLaporanAbsensi(startDate, endDate);
        }
        catch (error) {
            throw new errors_1.AppError(`Error generating attendance report: ${error.message}`, 500);
        }
    }
    static async generateLaporanPenggajian(month, year) {
        try {
            return await laporan_repository_1.LaporanRepository.generateLaporanPenggajian(month, year);
        }
        catch (error) {
            throw new errors_1.AppError(`Error generating payroll report: ${error.message}`, 500);
        }
    }
    static async generateLaporanCuti(month, year) {
        try {
            return await laporan_repository_1.LaporanRepository.generateLaporanCuti(month, year);
        }
        catch (error) {
            throw new errors_1.AppError(`Error generating leave report: ${error.message}`, 500);
        }
    }
    static async generateLaporanKinerja(month, year) {
        try {
            return await laporan_repository_1.LaporanRepository.generateLaporanKinerja(month, year);
        }
        catch (error) {
            throw new errors_1.AppError(`Error generating performance report: ${error.message}`, 500);
        }
    }
    static async generateLaporanTurnover(startDate, endDate) {
        try {
            return await laporan_repository_1.LaporanRepository.generateLaporanTurnover(startDate, endDate);
        }
        catch (error) {
            throw new errors_1.AppError(`Error generating turnover report: ${error.message}`, 500);
        }
    }
    static async generateLaporanDemografi() {
        try {
            return await laporan_repository_1.LaporanRepository.generateLaporanDemografi();
        }
        catch (error) {
            throw new errors_1.AppError(`Error generating demographic report: ${error.message}`, 500);
        }
    }
    static async generateLaporanPegawaiKomprehensif() {
        try {
            return await laporan_repository_1.LaporanRepository.generateLaporanPegawaiKomprehensif();
        }
        catch (error) {
            throw new errors_1.AppError(`Error generating comprehensive employee report: ${error.message}`, 500);
        }
    }
    static async generateLaporanAbsensiAnalitik(startDate, endDate) {
        try {
            return await laporan_repository_1.LaporanRepository.generateLaporanAbsensiAnalitik(startDate, endDate);
        }
        catch (error) {
            throw new errors_1.AppError(`Error generating analytical attendance report: ${error.message}`, 500);
        }
    }
    static async generateLaporanPenggajianAnalitik(month, year) {
        try {
            return await laporan_repository_1.LaporanRepository.generateLaporanPenggajianAnalitik(month, year);
        }
        catch (error) {
            throw new errors_1.AppError(`Error generating analytical payroll report: ${error.message}`, 500);
        }
    }
    static formatForExport(data, reportType) {
        switch (reportType) {
            case 'pegawai':
                return data.map((item) => ({
                    'ID': item.id,
                    'NIP': item.nip,
                    'Nama': item.name,
                    'Email': item.email,
                    'Posisi': item.position,
                    'Departemen': item.department,
                    'Tanggal Bergabung': item.joinDate,
                    'Jenis Kelamin': item.jenis_kelamin,
                    'Status': item.isActive ? 'Aktif' : 'Tidak Aktif'
                }));
            case 'absensi':
                return data.map((item) => ({
                    'ID Pegawai': item.employeeId,
                    'Tanggal': item.date,
                    'Jam Masuk': item.clockIn,
                    'Jam Keluar': item.clockOut,
                    'Status': item.status,
                    'Durasi Kerja': item.workDuration
                }));
            case 'penggajian':
                return data.map((item) => ({
                    'ID Pegawai': item.employeeId,
                    'Periode': item.period,
                    'Gaji Pokok': item.baseSalary,
                    'Total Tunjangan': item.totalIncome,
                    'Total Potongan': item.totalDeductions,
                    'Gaji Bersih': item.netSalary
                }));
            case 'cuti':
                return data.map((item) => ({
                    'ID Pegawai': item.employeeId,
                    'Nama Pegawai': item.employeeName,
                    'Jenis Cuti': item.leaveType,
                    'Tanggal Mulai': item.startDate,
                    'Tanggal Selesai': item.endDate,
                    'Alasan': item.reason,
                    'Status': item.status
                }));
            case 'kinerja':
                return data.map((item) => ({
                    'ID Pegawai': item.employeeId,
                    'Nama Pegawai': item.employeeName,
                    'Periode': item.period,
                    'Skor Keseluruhan': item.overallScore,
                    'Status': item.status,
                    'Tanggal Review': item.reviewDate
                }));
            default:
                return data;
        }
    }
}
exports.default = LaporanService;
//# sourceMappingURL=laporan.service.js.map