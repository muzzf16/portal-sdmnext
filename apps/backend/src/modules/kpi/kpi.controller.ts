import { Request, Response, NextFunction } from 'express';
import KpiService from './kpi.service';

export default class KpiController {

    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId, period, status } = req.query;
            const filters = {
                employeeId: employeeId as string | undefined,
                period: period as string | undefined,
                status: status as string | undefined,
            };
            const data = await KpiService.getAll(filters);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    static async getByEmployeeId(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId } = req.params;
            const data = await KpiService.getByEmployeeId(employeeId);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    static async getByEmployeePeriod(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId } = req.params;
            const { period } = req.query;
            const data = await KpiService.getByEmployeePeriod(employeeId, period as string);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = await KpiService.getById(id);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await KpiService.create(req.body);
            res.status(201).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = await KpiService.update(id, req.body);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    static async updateActualValue(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { actualValue } = req.body;
            if (actualValue === undefined) {
                return res.status(400).json({ success: false, message: 'actualValue is required' });
            }
            const data = await KpiService.updateActualValue(id, actualValue);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = await KpiService.delete(id);
            res.status(200).json({ success: true, ...data });
        } catch (error) {
            next(error);
        }
    }

    static async generateFromAbk(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId, year, period } = req.body;
            if (!employeeId || !year || !period) {
                return res.status(400).json({ success: false, message: 'employeeId, year, and period are required' });
            }
            const data = await KpiService.generateFromAbk(employeeId, parseInt(year), period);
            return res.status(201).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }
}
