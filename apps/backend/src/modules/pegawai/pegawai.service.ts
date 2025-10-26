import { PegawaiRepository } from './pegawai.repository';
import { AppError } from '../../utils/errors';
import { PenggunaRepository } from '../pengguna/pengguna.repository'; // Import PenggunaRepository

class PegawaiService {
  static async getAllPegawai() {
    try {
      return await PegawaiRepository.findAll();
    } catch (error: any) {
      throw new AppError(`Error retrieving employees: ${error.message}`, 500);
    }
  }

  static async getPegawaiById(id: string) {
    try {
      const pegawai = await PegawaiRepository.findById(id);
      if (!pegawai) {
        throw new AppError('Employee not found', 404);
      }
      return pegawai;
    } catch (error: any) {
      if (error.message === 'Employee not found') {
        throw error;
      }
      throw new AppError(`Error retrieving employee: ${error.message}`, 500);
    }
  }

  static async createPegawai(name: string, email: string, pegawaiData: any) {
    try {
      // Create the employee
      const newPegawai = await PegawaiRepository.create({
        ...pegawaiData,
        name,
        email
      });

      // Create corresponding user
      // The user creation logic is now handled within UserRepository.create
      // No direct call to UserRepository.create here, as it's part of employee creation in the repository

      return newPegawai;
    } catch (error: any) {
      if (error.message === 'Email already exists') {
        throw new AppError('Email already exists', 400);
      }
      throw new AppError(`Error creating employee: ${error.message}`, 500);
    }
  }

  static async updatePegawai(id: string, name: string, email: string, pegawaiData: any) {
    try {
      // Update employee data
      const updatedPegawai = await PegawaiRepository.update(id, {
        ...pegawaiData,
        name,
        email
      });

      // Update corresponding user
      // Assuming user update is handled separately or not directly tied to employee update in this service
      // await UserRepository.update(updatedPegawai.id, {
      //   name,
      //   email
      // });

      return updatedPegawai;
    } catch (error: any) {
      if (error.message === 'Employee not found') {
        throw new AppError('Employee not found', 404);
      }
      throw new AppError(`Error updating employee: ${error.message}`, 500);
    }
  }

  static async deletePegawai(id: string) {
    try {
      // Delete employee
      const deleted = await PegawaiRepository.delete(id);
      if (!deleted) {
        throw new AppError('Employee not found', 404);
      }

      // Delete corresponding user
      // Assuming user deletion is handled separately or not directly tied to employee deletion in this service
      // await UserRepository.delete(id);

      return { message: 'Employee deleted successfully' };
    } catch (error: any) {
      if (error.message === 'Employee not found') {
        throw error;
      }
      throw new AppError(`Error deleting employee: ${error.message}`, 500);
    }
  }

  static async updatePegawaiPayrollInfo(id: string, payrollInfo: any) {
    try {
      return await PegawaiRepository.updatePayrollInfo(id, payrollInfo);
    } catch (error: any) {
      if (error.message === 'Employee not found') {
        throw new AppError('Employee not found', 404);
      }
      throw new AppError(`Error updating employee payroll info: ${error.message}`, 500);
    }
  }
}

export default PegawaiService;