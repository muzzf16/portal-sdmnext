import { Request, Response, NextFunction } from 'express';
import PegawaiAuthService from './pegawai.auth.service';

class PegawaiAuthController {
  static async createEmployeeWithUser(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract all employee data from request body
      const employeeData = { ...req.body };
      
      const photo = req.file;

      const result = await PegawaiAuthService.createEmployeeWithUser(employeeData, photo);

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