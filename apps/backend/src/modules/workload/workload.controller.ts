
import { Request, Response, NextFunction } from 'express';
import WorkloadService from './workload.service';
import { SaveWorkloadAnalysisPayload } from './workload.types';

export default class WorkloadController {

    static async getAnalysis(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId } = req.params;
            const { year } = req.query;

            if (!year) {
                throw new Error('Year is required');
            }

            const analysis = await WorkloadService.getAnalysis(employeeId, parseInt(year as string));

            // If no analysis exists, return null or empty structure, don't throw 404
            if (!analysis) {
                return res.status(200).json({ success: true, data: null });
            }

            // Add FTE calculation to response
            const fte = WorkloadService.calculateFTE(analysis.totalYearlyMinutes || 0);

            return res.status(200).json({
                success: true,
                data: {
                    ...analysis,
                    ftePercentage: fte.ftePercentage,
                    fteStatus: fte.fteStatus,
                    hoursPerDay: fte.hoursPerDay
                }
            });
        } catch (error) {
            return next(error);
        }
    }

    static async saveAnalysis(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body as SaveWorkloadAnalysisPayload;
            const result = await WorkloadService.saveAnalysis(data);
            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            return next(error);
        }
    }

    static async submitAnalysis(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await WorkloadService.submitAnalysis(id);
            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            return next(error);
        }
    }

    static async approveAnalysis(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await WorkloadService.approveAnalysis(id);
            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            return next(error);
        }
    }
}
