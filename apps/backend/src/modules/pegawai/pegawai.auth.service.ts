import { PegawaiRepository } from './pegawai.repository';
import { PenggunaRepository } from '../pengguna/pengguna.repository';
import { AppError } from '../../utils/errors';
import PegawaiService from './pegawai.service';

class PegawaiAuthService {
  /**
   * Creates both employee and corresponding user account in a single transaction
   */
  static async createEmployeeWithUser(pegawaiData: any) {
    let employee;
    try {
      const { name, email, ...restData } = pegawaiData;

      // Use PegawaiService to get the proper validation and database mapping
      employee = await PegawaiService.createPegawai(name, email, restData);

      // Create corresponding user account
      const userData = {
        name: pegawaiData.name,
        email: pegawaiData.email,
        password: 'password123', // Default password
        role: 'employee',
        employeeId: employee.id // Link to the newly created employee
      };

      try {
        const user = await PenggunaRepository.create(userData);
        return { employee, user };
      } catch (userCreateErr) {
        // If user creation fails, rollback the created employee
        await PegawaiRepository.delete(employee.id);
        throw userCreateErr;
      }
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error; // Preserves the original 400 status from PegawaiService validation
      }

      if (error.message.includes('UNIQUE constraint failed') || error.message.includes('Email already exists')) {
        throw new AppError(`Data already exists: ${error.message}`, 400);
      }
      throw new AppError(`Error creating employee and user: ${error.message}`, 500);
    }
  }
}

export default PegawaiAuthService;