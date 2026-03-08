
import { PermintaanCutiRepository } from './permintaanCuti.repository';
import { getCompanySettings } from '../company-settings/company-settings.repository';
import { AppError } from '../../utils/errors';

class CutiService {
  static async getAllPermintaanCuti(query: any) {
    try {
      return await PermintaanCutiRepository.findAll(query);
    } catch (error: any) {
      throw new AppError(`Error retrieving leave requests: ${error.message}`, 500);
    }
  }

  static async getPermintaanCutiById(id: string) {
    try {
      const request = await PermintaanCutiRepository.findById(id);
      if (!request) {
        throw new AppError('Leave request not found', 404);
      }
      return request;
    } catch (error: any) {
      if (error.message === 'Leave request not found') {
        throw error;
      }
      throw new AppError(`Error retrieving leave request: ${error.message}`, 500);
    }
  }

  static async getPermintaanCutiByEmployeeId(employeeId: string) {
    try {
      return await PermintaanCutiRepository.findByEmployeeId(employeeId);
    } catch (error: any) {
      throw new AppError(`Error retrieving leave requests: ${error.message}`, 500);
    }
  }

  static async submitPermintaanCuti(requestData: any) {
    try {
      return await PermintaanCutiRepository.create(requestData);
    } catch (error: any) {
      throw new AppError(`Error submitting leave request: ${error.message}`, 500);
    }
  }

  static async updateStatusCuti(id: string, status: string, rejectionReason: string | null) {
    try {
      return await PermintaanCutiRepository.updateStatus(id, status, rejectionReason);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        throw new AppError(error.message, 404);
      }
      throw new AppError(`Error updating leave request status: ${error.message}`, 500);
    }
  }

  static async deletePermintaanCuti(id: string) {
    try {
      const deleted = await PermintaanCutiRepository.delete(id);
      if (!deleted) {
        throw new AppError('Leave request not found', 404);
      }
      return { message: 'Leave request deleted successfully' };
    } catch (error: any) {
      if (error.message === 'Leave request not found') {
        throw error;
      }
      throw new AppError(`Error deleting leave request: ${error.message}`, 500);
    }
  }

  static async getSisaCuti(employeeId: string) {
    try {
      const approvedLeaves = await PermintaanCutiRepository.findApprovedByEmployeeId(employeeId);
      // Hanya hitung cuti Tahunan (akomodasi nilai lama dan baru)
      const annualApprovedLeaves = approvedLeaves.filter((cutiItem: any) => {
        const type = (cutiItem.leaveType || '').toLowerCase();
        return type === 'tahunan' || type === 'annual' || type === 'cuti tahunan';
      });

      let totalCutiDiambil = 0;
      annualApprovedLeaves.forEach(cutiItem => {
        const startDate = new Date(cutiItem.startDate);
        const endDate = new Date(cutiItem.endDate);
        const timeDiff = endDate.getTime() - startDate.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        totalCutiDiambil += dayDiff;
      });

      // Ambil jatah cuti dari company_settings (bukan hardcoded)
      // Fallback ke 12 hari sesuai UU 13/2003 Pasal 79 jika belum diatur
      const companySettings = await getCompanySettings();
      const jumlahJatahCuti = companySettings?.annualLeaveQuota || 12;

      // Cuti bersama — idealnya dari tabel terpisah, untuk saat ini dari konfigurasi
      // Referensi: SKB Menteri tentang Hari Libur Nasional dan Cuti Bersama
      const cutiBersama = [
        { id: '1', tanggal: '2026-01-01', deskripsi: 'Tahun Baru 2026' },
        { id: '2', tanggal: '2026-03-31', deskripsi: 'Hari Raya Idul Fitri' },
        { id: '3', tanggal: '2026-04-01', deskripsi: 'Cuti Bersama Idul Fitri' },
        { id: '4', tanggal: '2026-05-01', deskripsi: 'Hari Buruh Internasional' },
        { id: '5', tanggal: '2026-08-17', deskripsi: 'Hari Kemerdekaan RI' },
        { id: '6', tanggal: '2026-12-25', deskripsi: 'Hari Natal' },
        { id: '7', tanggal: '2026-12-26', deskripsi: 'Cuti Bersama Natal' },
      ];
      const currentYear = new Date().getFullYear();
      const cutiBersamaTahunIni = cutiBersama.filter(c =>
        new Date(c.tanggal).getFullYear() === currentYear
      ).length;

      const sisaCuti = jumlahJatahCuti - totalCutiDiambil - cutiBersamaTahunIni;

      return {
        jatahCuti: jumlahJatahCuti,
        cutiDiambil: totalCutiDiambil,
        cutiBersama: cutiBersamaTahunIni,
        sisaCuti: sisaCuti,
        sumberJatah: companySettings ? 'company_settings' : 'default_uu13_2003',
      };
    } catch (error: any) {
      throw new AppError(`Error calculating remaining leave: ${error.message}`, 500);
    }
  }
}

export default CutiService;
