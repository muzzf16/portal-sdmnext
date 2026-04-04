
import CutiService from './cuti.service';
import { Request, Response, NextFunction } from 'express';

class CutiController {
  static async getAllPermintaanCuti(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, unknown>;
      const leaveRequests = await CutiService.getAllPermintaanCuti(query);
      res.status(200).json(leaveRequests);
    } catch (error) {
      next(error);
    }
  }

  static async getPermintaanCutiById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const leaveRequest = await CutiService.getPermintaanCutiById(id);
      res.status(200).json(leaveRequest);
    } catch (error) {
      next(error);
    }
  }

  static async getPermintaanCutiByEmployeeId(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const leaveRequests = await CutiService.getPermintaanCutiByEmployeeId(employeeId);
      res.status(200).json(leaveRequests);
    } catch (error) {
      next(error);
    }
  }

  static async submitPermintaanCuti(req: Request, res: Response, next: NextFunction) {
    try {
      const leaveRequestData = req.body;
      if (req.file) {
        leaveRequestData.supportingDocument = `/documents/${req.file.filename}`;
      }
      const newLeaveRequest = await CutiService.submitPermintaanCuti(leaveRequestData);
      res.status(201).json(newLeaveRequest);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatusCuti(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      const result = await CutiService.updateStatusCuti(id, status, rejectionReason);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deletePermintaanCuti(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await CutiService.deletePermintaanCuti(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getSisaCuti(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const sisaCuti = await CutiService.getSisaCuti(employeeId);
      res.status(200).json(sisaCuti);
    } catch (error) {
      next(error);
    }
  }

  static async getBatchSisaCuti(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CutiService.getBatchSisaCuti();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getCutiBersama(req: Request, res: Response, next: NextFunction) {
    try {
      const result = CutiService.getCutiBersama();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default CutiController;
