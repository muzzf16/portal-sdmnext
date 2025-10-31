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
      // Ensure the pelatihanData has the correct structure with the certificate field
      const pelatihanWithEmployee = {
        ...pelatihanData,
        // If there's a file path in the request, it's already processed in the controller
        // The repository will handle storing only the filename, not the full path
      };

      return await PelatihanRepository.create(employeeId, pelatihanWithEmployee);
    } catch (error: any) {
      throw new AppError(`Error adding pelatihan: ${error.message}`, 500);
    }
  }
}

export default PelatihanService;