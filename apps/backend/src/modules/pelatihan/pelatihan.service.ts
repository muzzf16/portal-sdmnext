import { PelatihanRepository } from './pelatihan.repository';
import { AppError } from '../../utils/errors';

class PelatihanService {
  static async getPelatihanByEmployeeId(employeeId: string) {
    try {
      return await PelatihanRepository.findByEmployeeId(employeeId);
    } catch (error: any) {
      throw new AppError(`Error retrieving pelatihan: ${error.message}`, 500);
    }
  }

  static async addPelatihan(employeeId: string, pelatihanData: any) {
    try {
      return await PelatihanRepository.create(employeeId, pelatihanData);
    } catch (error: any) {
      throw new AppError(`Error adding pelatihan: ${error.message}`, 500);
    }
  }
}

export default PelatihanService;