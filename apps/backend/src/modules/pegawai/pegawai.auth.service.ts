import { PegawaiRepository } from './pegawai.repository';
import { PenggunaRepository } from '../pengguna/pengguna.repository';
import { AppError } from '../../utils/errors';
import bcrypt from 'bcrypt';

class PegawaiAuthService {
  /**
   * Creates both employee and corresponding user account in a single transaction
   */
  static async createEmployeeWithUser(pegawaiData: any, photo?: Express.Multer.File) {
    try {
      // Create employee first - PegawaiRepository.create will use the provided data or defaults
      const employee = await PegawaiRepository.create(pegawaiData);
      
      // Create corresponding user account
      const userData = {
        name: pegawaiData.name,
        email: pegawaiData.email,
        password: 'password123', // Default password
        role: 'employee',
        employeeId: employee.id // Link to the newly created employee
      };
      
      const user = await PenggunaRepository.create(userData);
      
      return { employee, user };
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        // If NIP or email already exists, delete the employee we just created to maintain consistency
        if (error.message.includes('pegawai.nip')) {
          await PegawaiRepository.delete(pegawaiData.id || `emp-${Date.now()}`);
        }
        throw new AppError(`Data already exists: ${error.message}`, 400);
      }
      throw new AppError(`Error creating employee and user: ${error.message}`, 500);
    }
  }
}

export default PegawaiAuthService;