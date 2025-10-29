
import { LaporanRepository } from './laporan.repository';
import { AppError } from '../../utils/errors';
import { Pegawai } from '../pegawai/pegawai.model';
import { Absensi } from '../absensi/absensi.model';
import { Penggajian } from '../penggajian/penggajian.model';
import { PermintaanCuti } from '../cuti/permintaanCuti.model';
import { PenilaianKinerja } from '../kinerja/penilaianKinerja.model';

class LaporanService {
  static async generateLaporanPegawai() {
    try {
      return await LaporanRepository.generateLaporanPegawai();
    } catch (error: any) {
      throw new AppError(`Error generating employee report: ${error.message}`, 500);
    }
  }

  static async generateLaporanAbsensi(startDate: string, endDate: string) {
    try {
      return await LaporanRepository.generateLaporanAbsensi(startDate, endDate);
    } catch (error: any) {
      throw new AppError(`Error generating attendance report: ${error.message}`, 500);
    }
  }

  static async generateLaporanPenggajian(month: string, year: string) {
    try {
      return await LaporanRepository.generateLaporanPenggajian(month, year);
    } catch (error: any) {
      throw new AppError(`Error generating payroll report: ${error.message}`, 500);
    }
  }
  
  static async generateLaporanCuti(month: string, year: string) {
    try {
      return await LaporanRepository.generateLaporanCuti(month, year);
    } catch (error: any) {
      throw new AppError(`Error generating leave report: ${error.message}`, 500);
    }
  }
  
  static async generateLaporanKinerja(month: string, year: string) {
    try {
      return await LaporanRepository.generateLaporanKinerja(month, year);
    } catch (error: any) {
      throw new AppError(`Error generating performance report: ${error.message}`, 500);
    }
  }
  
  // New method for turnover analysis
  static async generateLaporanTurnover(startDate: string, endDate: string) {
    try {
      return await LaporanRepository.generateLaporanTurnover(startDate, endDate);
    } catch (error: any) {
      throw new AppError(`Error generating turnover report: ${error.message}`, 500);
    }
  }
  
  // New method for demographic analysis
  static async generateLaporanDemografi() {
    try {
      return await LaporanRepository.generateLaporanDemografi();
    } catch (error: any) {
      throw new AppError(`Error generating demographic report: ${error.message}`, 500);
    }
  }
  
  // Enhanced analytics methods
  static async generateLaporanPegawaiKomprehensif() {
    try {
      return await LaporanRepository.generateLaporanPegawaiKomprehensif();
    } catch (error: any) {
      throw new AppError(`Error generating comprehensive employee report: ${error.message}`, 500);
    }
  }
  
  static async generateLaporanAbsensiAnalitik(startDate: string, endDate: string) {
    try {
      return await LaporanRepository.generateLaporanAbsensiAnalitik(startDate, endDate);
    } catch (error: any) {
      throw new AppError(`Error generating analytical attendance report: ${error.message}`, 500);
    }
  }
  
  static async generateLaporanPenggajianAnalitik(month: string, year: string) {
    try {
      return await LaporanRepository.generateLaporanPenggajianAnalitik(month, year);
    } catch (error: any) {
      throw new AppError(`Error generating analytical payroll report: ${error.message}`, 500);
    }
  }
  
  // Export helpers for different formats
  static formatForExport(data: any[], reportType: string): any[] {
    switch(reportType) {
      case 'pegawai':
        return data.map((item: Pegawai) => ({
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
        return data.map((item: Absensi) => ({
          'ID Pegawai': item.employeeId,
          'Tanggal': item.date,
          'Jam Masuk': item.clockIn,
          'Jam Keluar': item.clockOut,
          'Status': item.status,
          'Durasi Kerja': item.workDuration
        }));
      case 'penggajian':
        return data.map((item: Penggajian) => ({
          'ID Pegawai': item.employeeId,
          'Periode': item.period,
          'Gaji Pokok': item.baseSalary,
          'Total Tunjangan': item.totalIncome,
          'Total Potongan': item.totalDeductions,
          'Gaji Bersih': item.netSalary
        }));
      case 'cuti':
        return data.map((item: PermintaanCuti) => ({
          'ID Pegawai': item.employeeId,
          'Nama Pegawai': item.employeeName,
          'Jenis Cuti': item.leaveType,
          'Tanggal Mulai': item.startDate,
          'Tanggal Selesai': item.endDate,
          'Alasan': item.reason,
          'Status': item.status
        }));
      case 'kinerja':
        return data.map((item: PenilaianKinerja) => ({
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

export default LaporanService;
