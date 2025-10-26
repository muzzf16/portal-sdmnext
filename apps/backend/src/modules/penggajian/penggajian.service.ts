
import { PenggajianRepository } from './penggajian.repository';
import { AppError } from '../../utils/errors';

class PenggajianService {
  static async getAllPenggajian() {
    try {
      return await PenggajianRepository.findAll();
    } catch (error: any) {
      throw new AppError(`Error retrieving payrolls: ${error.message}`, 500);
    }
  }

  static async getPenggajianById(id: string) {
    try {
      const payroll = await PenggajianRepository.findById(id);
      if (!payroll) {
        throw new AppError('Payroll not found', 404);
      }
      return payroll;
    } catch (error: any) {
      if (error.message === 'Payroll not found') {
        throw error;
      }
      throw new AppError(`Error retrieving payroll: ${error.message}`, 500);
    }
  }

  static async getPenggajianByEmployeeId(employeeId: string) {
    try {
      return await PenggajianRepository.findByEmployeeId(employeeId);
    } catch (error: any) {
      throw new AppError(`Error retrieving payrolls for employee: ${error.message}`, 500);
    }
  }

  static async createPenggajian(payrollData: any) {
    try {
      return await PenggajianRepository.create(payrollData);
    } catch (error: any) {
      throw new AppError(`Error creating payroll: ${error.message}`, 500);
    }
  }

  static async updatePenggajian(id: string, payrollData: any) {
    try {
      const updatedPayroll = await PenggajianRepository.update(id, payrollData);
      if (!updatedPayroll) {
        throw new AppError('Payroll not found', 404);
      }
      return updatedPayroll;
    } catch (error: any) {
      if (error.message === 'Payroll not found') {
        throw error;
      }
      throw new AppError(`Error updating payroll: ${error.message}`, 500);
    }
  }

  static async deletePenggajian(id: string) {
    try {
      const deleted = await PenggajianRepository.delete(id);
      if (!deleted) {
        throw new AppError('Payroll not found', 404);
      }
      return { message: 'Payroll deleted successfully' };
    } catch (error: any) {
      if (error.message === 'Payroll not found') {
        throw error;
      }
      throw new AppError(`Error deleting payroll: ${error.message}`, 500);
    }
  }
}

export default PenggajianService;
