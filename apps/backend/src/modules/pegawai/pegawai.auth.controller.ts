import { Request, Response, NextFunction } from 'express';
import PegawaiAuthService from './pegawai.auth.service';

class PegawaiAuthController {
  static async createEmployeeWithUser(req: Request, res: Response, next: NextFunction) {
    try {
      let avatarUrl = req.body.avatarUrl;
      if (req.file) {
        avatarUrl = `/uploads/avatars/${req.file.filename}`;
      }

      const { name, email, ...pegawaiData } = req.body;

      if (pegawaiData.educationHistory && typeof pegawaiData.educationHistory === 'string') {
        try {
          pegawaiData.educationHistory = JSON.parse(pegawaiData.educationHistory);
        } catch (e) {
          throw new Error('Invalid educationHistory JSON format.');
        }
      }

      const newPegawaiData = {
        ...pegawaiData,
        avatarUrl: avatarUrl || '/avatars/default-avatar.jpg',
        name,
        email
      };

      const result = await PegawaiAuthService.createEmployeeWithUser(newPegawaiData);

      res.status(201).json({
        success: true,
        message: 'Employee and user account created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

export default PegawaiAuthController;