
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
            // Use 200 OK with null data if not found, to let frontend know it's a new entry
            res.status(200).json({
                success: true,
                data: analysis || null
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
