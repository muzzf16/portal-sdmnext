import { PelatihanRepository } from './pelatihan.repository';
import { AppError } from '../../utils/errors';

class PelatihanService {
  static async getAllPelatihan() {
    try {
      return await PelatihanRepository.findAll();
    } catch (error: any) {
      throw new AppError(`Error retrieving pelatihan: ${error.message}`, 500);
    }
  }

  static async getPelatihanByEmployeeId(employeeId: string) {
    try {
      return await PelatihanRepository.findByEmployeeId(employeeId);
    } catch (error: any) {
      throw new AppError(`Error retrieving pelatihan: ${error.message}`, 500);
    }
  }

  static async addPelatihan(employeeId: string, pelatihanData: any) {
    try {
      const pelatihanWithEmployee = {
        ...pelatihanData,
      };

      return await PelatihanRepository.create(employeeId, pelatihanWithEmployee);
    } catch (error: any) {
      throw new AppError(`Error adding pelatihan: ${error.message}`, 500);
    }
  }

  static async updatePelatihan(id: string, pelatihanData: any) {
    try {
      return await PelatihanRepository.update(id, pelatihanData);
    } catch (error: any) {
      throw new AppError(`Error updating pelatihan: ${error.message}`, 500);
    }
  }

  static async deletePelatihan(id: string) {
    try {
      return await PelatihanRepository.delete(id);
    } catch (error: any) {
      throw new AppError(`Error deleting pelatihan: ${error.message}`, 500);
    }
  }
}

export default PelatihanService;