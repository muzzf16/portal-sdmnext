
import { Request, Response, NextFunction } from 'express';
import WorkloadService from './workload.service';

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
            next(error);
        }
    }

    static async saveAnalysis(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body;
            const result = await WorkloadService.saveAnalysis(data);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}
