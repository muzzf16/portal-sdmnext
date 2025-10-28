import PelatihanService from './pelatihan.service';
import { Request, Response, NextFunction } from 'express';

class PelatihanController {
  static async getAllPelatihan(req: Request, res: Response, next: NextFunction) {
    try {
      const pelatihan = await PelatihanService.getAllPelatihan();
      res.status(200).json(pelatihan);
    } catch (error) {
      next(error);
    }
  }

  static async getPelatihanByEmployeeId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const pelatihan = await PelatihanService.getPelatihanByEmployeeId(id);
      res.status(200).json(pelatihan);
    } catch (error) {
      next(error);
    }
  }

  static async addPelatihan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const pelatihanData = req.body;
      const newPelatihan = await PelatihanService.addPelatihan(id, pelatihanData);
      res.status(201).json(newPelatihan);
    } catch (error) {
      next(error);
    }
  }
}

export default PelatihanController;