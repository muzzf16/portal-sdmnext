
import { PenggunaRepository } from './pengguna.repository';
import { AppError } from '../../utils/errors';
import jwt from 'jsonwebtoken';
import config from '../../config/config'; // Assuming config is in src/config/config.ts

class AuthPenggunaService {
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
      if (error.message === 'User not found.' || error.message === 'Invalid credentials.') {
        throw new AppError(error.message, 401);
      }
      throw new AppError(`Error authenticating user: ${error.message}`, 500);
    }
  }

  static async register(name: string, email: string, password: string) {
    try {
      const user = await PenggunaRepository.create({
        name,
        email,
        password,
        role: 'EMPLOYEE'
      });
      
      return { message: 'Registration successful', userId: user.id };
    } catch (error: any) {
      if (error.message === 'Email already exists') {
        throw new AppError('Email already exists', 400);
      }
      throw new AppError(`Error registering user: ${error.message}`, 500);
    }
  }
}

export default AuthPenggunaService;
