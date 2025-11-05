
import { PermintaanCutiRepository } from './permintaanCuti.repository';
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
      
      let totalCutiDiambil = 0;
      approvedLeaves.forEach(cutiItem => {
        const startDate = new Date(cutiItem.startDate);
        const endDate = new Date(cutiItem.endDate);
        const timeDiff = endDate.getTime() - startDate.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        totalCutiDiambil += dayDiff;
      });

      const jumlahJatahCuti = 18; // Hardcoded for now
      const cutiBersama = [
        { id: '1', tanggal: '2025-01-01', deskripsi: 'Tahun Baru' },
        { id: '2', tanggal: '2025-05-01', deskripsi: 'Hari Buruh Internasional' },
        { id: '3', tanggal: '2025-08-17', deskripsi: 'Hari Kemerdekaan RI' },
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
      };
    } catch (error: any) {
      throw new AppError(`Error calculating remaining leave: ${error.message}`, 500);
    }
  }
}

export default CutiService;
