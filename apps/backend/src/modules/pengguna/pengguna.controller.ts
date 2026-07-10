
// src/modules/pengguna/pengguna.controller.ts
import PenggunaService from './pengguna.service';
import { Request, Response, NextFunction } from 'express';

class PenggunaController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { accessToken, user } = await PenggunaService.login(email, password);
      
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
      const { name, email, password } = req.body;
      const result = await PenggunaService.register(name, email, password);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getAllPengguna(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await PenggunaService.getAllPengguna();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  static async getPenggunaById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await PenggunaService.getPenggunaById(id);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async updatePengguna(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedUser = await PenggunaService.updatePengguna(id, req.body);
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  static async deletePengguna(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await PenggunaService.deletePengguna(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current password dan new password wajib diisi.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
      }
      const result = await PenggunaService.changePassword(id, currentPassword, newPassword);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
      return;
    }
  }

  static async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'File tidak ditemukan.' });
      }
      const avatarUrl = `/avatars/${req.file.filename}`;
      const updatedUser = await PenggunaService.updatePengguna(id, { avatarUrl });
      return res.status(200).json({ success: true, avatarUrl, data: updatedUser });
    } catch (error) {
      next(error);
      return;
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      if (!newPassword) {
        return res.status(400).json({ success: false, message: 'Password baru wajib diisi.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
      }
      const result = await PenggunaService.resetPassword(id, newPassword);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
      return;
    }
  }
}

export default PenggunaController;
