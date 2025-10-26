import { TugasOrientasiRepository } from './tugasOrientasi.repository';
import { AppError } from '../../utils/errors';

class OrientasiService {
  static async getTugasOrientasiByEmployeeId(employeeId: string) {
    try {
      return await TugasOrientasiRepository.findByEmployeeId(employeeId);
    } catch (error: any) {
      throw new AppError(`Error retrieving onboarding tasks: ${error.message}`, 500);
    }
  }

  static async createTugasOrientasi(employeeId: string, taskData: any) {
    try {
      return await TugasOrientasiRepository.create(employeeId, taskData);
    } catch (error: any) {
      throw new AppError(`Error creating onboarding task: ${error.message}`, 500);
    }
  }

  static async updateTugasOrientasi(taskId: string, taskData: any) {
    try {
      return await TugasOrientasiRepository.update(taskId, taskData);
    } catch (error: any) {
      throw new AppError(`Error updating onboarding task: ${error.message}`, 500);
    }
  }

  static async deleteTugasOrientasi(taskId: string) {
    try {
      const deleted = await TugasOrientasiRepository.delete(taskId);
      if (!deleted) {
        throw new AppError('Onboarding task not found', 404);
      }
      return { message: 'Onboarding task deleted successfully' };
    } catch (error: any) {
      throw new AppError(`Error deleting onboarding task: ${error.message}`, 500);
    }
  }
}

export default OrientasiService;