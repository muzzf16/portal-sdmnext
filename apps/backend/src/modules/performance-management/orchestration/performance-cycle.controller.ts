import { NextFunction, Request, Response } from 'express';
import PerformanceCycleService from './performance-cycle.service';
import { PerformanceCycleBatchPayload } from './performance-cycle.types';

export default class PerformanceCycleController {
  static async openPeriod(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PerformanceCycleService.openPeriod(req.body as PerformanceCycleBatchPayload);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }

  static async syncApprovedWlaToKpi(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PerformanceCycleService.syncApprovedWlaToKpi(req.body as PerformanceCycleBatchPayload);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }

  static async createReviewBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PerformanceCycleService.createReviewBatch(req.body as PerformanceCycleBatchPayload);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }

  static async finalizePeriod(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PerformanceCycleService.finalizePeriod(req.body as PerformanceCycleBatchPayload);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }
}
