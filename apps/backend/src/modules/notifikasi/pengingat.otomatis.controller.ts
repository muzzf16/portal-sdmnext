import PengingatOtomatisService from './pengingat.otomatis.service';
import { Request, Response, NextFunction } from 'express';

class PengingatOtomatisController {
  static async sendContractExpirationReminders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PengingatOtomatisService.sendContractExpirationReminders();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
  
  static async sendLeaveApprovalNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PengingatOtomatisService.sendLeaveApprovalNotifications();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
  
  static async sendPayrollReleaseNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PengingatOtomatisService.sendPayrollReleaseNotifications();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
  
  static async sendPerformanceReviewReminders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PengingatOtomatisService.sendPerformanceReviewReminders();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
  
  static async sendBirthdayReminders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PengingatOtomatisService.sendBirthdayReminders();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
  
  static async sendAllAutomatedReminders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PengingatOtomatisService.sendAllAutomatedReminders();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default PengingatOtomatisController;