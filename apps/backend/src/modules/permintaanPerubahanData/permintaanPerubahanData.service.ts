
import { PermintaanPerubahanDataRepository } from './permintaanPerubahanData.repository';
import { AppError } from '../../utils/errors';

class PermintaanPerubahanDataService {
  static async getAllPermintaanPerubahanData() {
    try {
      return await PermintaanPerubahanDataRepository.findAll();
    } catch (error: any) {
      throw new AppError(`Error retrieving data change requests: ${error.message}`, 500);
    }
  }

  static async getPermintaanPerubahanDataById(id: string) {
    try {
      const request = await PermintaanPerubahanDataRepository.findById(id);
      if (!request) {
        throw new AppError('Data change request not found', 404);
      }
      return request;
    } catch (error: any) {
      if (error.message === 'Data change request not found') {
        throw error;
      }
      throw new AppError(`Error retrieving data change request: ${error.message}`, 500);
    }
  }

  static async getPermintaanPerubahanDataByEmployeeId(employeeId: string) {
    try {
      return await PermintaanPerubahanDataRepository.findByEmployeeId(employeeId);
    } catch (error: any) {
      throw new AppError(`Error retrieving data change requests for employee: ${error.message}`, 500);
    }
  }

  static async getPendingPermintaanPerubahanData() {
    try {
      return await PermintaanPerubahanDataRepository.findPending();
    } catch (error: any) {
      throw new AppError(`Error retrieving pending data change requests: ${error.message}`, 500);
    }
  }

  static async createPermintaanPerubahanData(requestData: any) {
    try {
      return await PermintaanPerubahanDataRepository.create(requestData);
    } catch (error: any) {
      throw new AppError(`Error creating data change request: ${error.message}`, 500);
    }
  }

  static async updatePermintaanPerubahanDataStatus(id: string, status: string) {
    try {
      return await PermintaanPerubahanDataRepository.updateStatus(id, status);
    } catch (error: any) {
      if (error.message === 'Data change request not found') {
        throw new AppError('Data change request not found', 404);
      }
      throw new AppError(`Error updating data change request status: ${error.message}`, 500);
    }
  }

  static async deletePermintaanPerubahanData(id: string) {
    try {
      const deleted = await PermintaanPerubahanDataRepository.delete(id);
      if (!deleted) {
        throw new AppError('Data change request not found', 404);
      }
      return { message: 'Data change request deleted successfully' };
    } catch (error: any) {
      if (error.message === 'Data change request not found') {
        throw error;
      }
      throw new AppError(`Error deleting data change request: ${error.message}`, 500);
    }
  }
}

export default PermintaanPerubahanDataService;
