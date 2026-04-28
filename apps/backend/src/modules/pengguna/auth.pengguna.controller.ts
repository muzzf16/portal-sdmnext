import AuthPenggunaService from './auth.pengguna.service';
import AuditLogService from '../audit-log/audit-log.service';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config/config';

class AuthPenggunaController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { accessToken, user } = await AuthPenggunaService.login(email, password);
      
      // Record login audit log
      const userAgent = req.get('user-agent') || '';
      let device = 'Web/Desktop';
      if (/mobile/i.test(userAgent)) device = 'Mobile';
      else if (/tablet/i.test(userAgent)) device = 'Tablet';

      await AuditLogService.record({
        user_id: user.id.toString(),
        action: 'LOGIN',
        module: 'AUTH',
        description: `User ${user.email} logged in`,
        device,
        metadata: { ip: req.ip, userAgent }
      });

      res.status(200).json({ 
        accessToken,
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
