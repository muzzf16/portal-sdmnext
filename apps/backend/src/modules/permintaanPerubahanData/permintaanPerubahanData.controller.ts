
import PermintaanPerubahanDataService from './permintaanPerubahanData.service';
import { Request, Response, NextFunction } from 'express';

class PermintaanPerubahanDataController {
  static async getAllPermintaanPerubahanData(req: Request, res: Response, next: NextFunction) {
    try {
      const requests = await PermintaanPerubahanDataService.getAllPermintaanPerubahanData();
      res.status(200).json(requests);
    } catch (error) {
      next(error);
    }
  }

  static async getPermintaanPerubahanDataById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const request = await PermintaanPerubahanDataService.getPermintaanPerubahanDataById(id);
      res.status(200).json(request);
    } catch (error) {
      next(error);
    }
  }

  static async getPermintaanPerubahanDataByEmployeeId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const requests = await PermintaanPerubahanDataService.getPermintaanPerubahanDataByEmployeeId(id);
      res.status(200).json(requests);
    } catch (error) {
      next(error);
    }
  }

  static async getPendingPermintaanPerubahanData(req: Request, res: Response, next: NextFunction) {
    try {
      const requests = await PermintaanPerubahanDataService.getPendingPermintaanPerubahanData();
      res.status(200).json(requests);
    } catch (error) {
      next(error);
    }
  }

  static async createPermintaanPerubahanData(req: Request, res: Response, next: NextFunction) {
    try {
      const requestData = req.body;
      const newRequest = await PermintaanPerubahanDataService.createPermintaanPerubahanData(requestData);
      res.status(201).json(newRequest);
    } catch (error) {
      next(error);
    }
  }

  static async updatePermintaanPerubahanDataStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await PermintaanPerubahanDataService.updatePermintaanPerubahanDataStatus(id, status);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deletePermintaanPerubahanData(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await PermintaanPerubahanDataService.deletePermintaanPerubahanData(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default PermintaanPerubahanDataController;
