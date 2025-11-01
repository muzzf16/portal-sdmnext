
import AuthPenggunaService from './auth.pengguna.service';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config/config';

class AuthPenggunaController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { token, user } = await AuthPenggunaService.login(email, password);
      
      res.status(200).json({ 
        token,
        user
      });
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role } = req.body;
      const result = await AuthPenggunaService.register(name, email, password, role);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthPenggunaController;
