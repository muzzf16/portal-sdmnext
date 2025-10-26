
// src/modules/pengguna/pengguna.service.ts
import { PenggunaRepository } from './pengguna.repository';
import { AppError } from '../../utils/errors';
import jwt from 'jsonwebtoken';
import config from '../../config/config'; // Assuming config is in src/config/config.ts

class PenggunaService {
  static async login(email: string, password: string) {
    try {
      const user = await PenggunaRepository.authenticate(email, password);
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: '24h' }
      );
      
      return { token, user };
    } catch (error: any) {
      throw new AppError(`Authentication failed: ${error.message}`, 401);
    }
  }

  static async register(name: string, email: string, password: string) {
    try {
      const newUser = await PenggunaRepository.create({ name, email, password, role: 'EMPLOYEE' });
      return newUser;
    } catch (error: any) {
      if (error.message === 'Email already exists') {
        throw new AppError('Email already exists', 400);
      }
      throw new AppError(`Error registering user: ${error.message}`, 500);
    }
  }

  static async getAllPengguna() {
    try {
      return await PenggunaRepository.findAll();
    } catch (error: any) {
      throw new AppError(`Error retrieving users: ${error.message}`, 500);
    }
  }

  static async getPenggunaById(id: string) {
    try {
      const user = await PenggunaRepository.findById(id);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      return user;
    } catch (error: any) {
      throw new AppError(`Error retrieving user: ${error.message}`, 500);
    }
  }

  static async updatePengguna(id: string, data: any) {
    try {
      const updatedUser = await PenggunaRepository.update(id, data);
      return updatedUser;
    } catch (error: any) {
      throw new AppError(`Error updating user: ${error.message}`, 500);
    }
  }

  static async deletePengguna(id: string) {
    try {
      const deleted = await PenggunaRepository.delete(id);
      if (!deleted) {
        throw new AppError('User not found', 404);
      }
      return { message: 'User deleted successfully' };
    } catch (error: any) {
      throw new AppError(`Error deleting user: ${error.message}`, 500);
    }
  }
}

export default PenggunaService;
