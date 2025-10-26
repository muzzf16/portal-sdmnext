
import KinerjaService from './kinerja.service';
import { Request, Response, NextFunction } from 'express';

class KinerjaController {
  static async getAllPenilaianKinerja(req: Request, res: Response, next: NextFunction) {
    try {
      const performanceReviews = await KinerjaService.getAllPenilaianKinerja();
      res.status(200).json(performanceReviews);
    } catch (error) {
      next(error);
    }
  }

  static async getPenilaianKinerjaById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const performanceReview = await KinerjaService.getPenilaianKinerjaById(id);
      res.status(200).json(performanceReview);
    } catch (error) {
      next(error);
    }
  }

  static async getPenilaianKinerjaByEmployeeId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const performanceReviews = await KinerjaService.getPenilaianKinerjaByEmployeeId(id);
      res.status(200).json(performanceReviews);
    } catch (error) {
      next(error);
    }
  }

  static async createPenilaianKinerja(req: Request, res: Response, next: NextFunction) {
    try {
      const performanceData = req.body;
      const newReview = await KinerjaService.createPenilaianKinerja(performanceData);
      res.status(201).json(newReview);
    } catch (error) {
      next(error);
    }
  }

  static async updatePenilaianKinerja(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const performanceData = req.body;
      const updatedReview = await KinerjaService.updatePenilaianKinerja(id, performanceData);
      res.status(200).json(updatedReview);
    } catch (error) {
      next(error);
    }
  }

  static async addFeedbackKinerja(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { feedback } = req.body;
      const result = await KinerjaService.addFeedbackKinerja(id, feedback);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deletePenilaianKinerja(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await KinerjaService.deletePenilaianKinerja(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default KinerjaController;
