import PerekrutanService from './perekrutan.service';
import { Request, Response, NextFunction } from 'express';

class PerekrutanController {
  static async getAllKandidat(req: Request, res: Response, next: NextFunction) {
    try {
      const candidates = await PerekrutanService.getAllKandidat();
      res.status(200).json(candidates);
    } catch (error) {
      next(error);
    }
  }

  static async getKandidatById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const candidate = await PerekrutanService.getKandidatById(id);
      res.status(200).json(candidate);
    } catch (error) {
      next(error);
    }
  }

  static async createKandidat(req: Request, res: Response, next: NextFunction) {
    try {
      const candidateData = req.body;
      const newCandidate = await PerekrutanService.createKandidat(candidateData);
      res.status(201).json(newCandidate);
    } catch (error) {
      next(error);
    }
  }

  static async updateKandidat(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const candidateData = req.body;
      const updatedCandidate = await PerekrutanService.updateKandidat(id, candidateData);
      res.status(200).json(updatedCandidate);
    } catch (error) {
      next(error);
    }
  }

  static async deleteKandidat(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await PerekrutanService.deleteKandidat(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default PerekrutanController;