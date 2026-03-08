
import KinerjaService from './kinerja.service';
import { Request, Response, NextFunction } from 'express';

class KinerjaController {
  static async getAllPenilaianKinerja(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      let supervisorId: string | undefined = undefined;

      if (user?.role === 'supervisor') {
        supervisorId = String(user?.employeeId || user?.id);
      }

      const performanceReviews = await KinerjaService.getAllPenilaianKinerja(supervisorId);
      res.status(200).json({ success: true, data: performanceReviews });
    } catch (error) {
      next(error);
    }
  }

  static async getPenilaianKinerjaById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const performanceReview = await KinerjaService.getPenilaianKinerjaById(id);
      res.status(200).json({ success: true, data: performanceReview });
    } catch (error) {
      next(error);
    }
  }

  static async getPenilaianKinerjaByEmployeeId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const performanceReviews = await KinerjaService.getPenilaianKinerjaByEmployeeId(id);
      res.status(200).json({ success: true, data: performanceReviews });
    } catch (error) {
      next(error);
    }
  }

  static async createPenilaianKinerja(req: Request, res: Response, next: NextFunction) {
    try {
      const performanceData = req.body;
      const newReview = await KinerjaService.createPenilaianKinerja(performanceData);
      res.status(201).json({ success: true, data: newReview });
    } catch (error) {
      console.error("createPenilaianKinerja Error:", error);
      next(error);
    }
  }

  static async updatePenilaianKinerja(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const performanceData = req.body;
      const updatedReview = await KinerjaService.updatePenilaianKinerja(id, performanceData);
      res.status(200).json({ success: true, data: updatedReview });
    } catch (error) {
      next(error);
    }
  }

  static async addFeedbackKinerja(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const feedback = req.body.employeeFeedback || req.body.feedback;
      if (!feedback) {
        return res.status(400).json({ success: false, message: 'employeeFeedback is required' });
      }
      const result = await KinerjaService.addFeedbackKinerja(id, feedback);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }

  static async deletePenilaianKinerja(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await KinerjaService.deletePenilaianKinerja(id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async submitSelfAssessment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { selfAssessmentKpis, selfAssessmentStrengths, selfAssessmentAreas, selfAssessmentStatus } = req.body;

      if (!selfAssessmentStatus || !['draft', 'submitted'].includes(selfAssessmentStatus)) {
        return res.status(400).json({ success: false, message: 'selfAssessmentStatus harus "draft" atau "submitted"' });
      }

      const result = await KinerjaService.submitSelfAssessment(id, {
        selfAssessmentKpis: selfAssessmentKpis || [],
        selfAssessmentStrengths: selfAssessmentStrengths || '',
        selfAssessmentAreas: selfAssessmentAreas || '',
        selfAssessmentStatus,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }

  static async transitionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { targetStatus, selfAssessmentDeadline } = req.body;

      const validStatuses = ['Draft', 'Awaiting SA', 'SA Submitted', 'In Review', 'Completed', 'Finalized'];
      if (!targetStatus || !validStatuses.includes(targetStatus)) {
        return res.status(400).json({
          success: false,
          message: `targetStatus harus salah satu dari: ${validStatuses.join(', ')}`
        });
      }

      // Set deadline if provided (when transitioning to "Awaiting SA")
      if (selfAssessmentDeadline && targetStatus === 'Awaiting SA') {
        const { openDb } = require('../../config/db');
        const db = await openDb();
        await db.run('UPDATE penilaian_kinerja SET selfAssessmentDeadline = ? WHERE id = ?', selfAssessmentDeadline, id);
      }

      const user = (req as any).user;
      const result = await KinerjaService.transitionStatus(id, targetStatus, user?.id);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }
}

export default KinerjaController;
