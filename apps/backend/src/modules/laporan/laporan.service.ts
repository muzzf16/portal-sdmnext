
import { LaporanRepository } from './laporan.repository';
import { AppError } from '../../utils/errors';

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
}

export default LaporanService;
