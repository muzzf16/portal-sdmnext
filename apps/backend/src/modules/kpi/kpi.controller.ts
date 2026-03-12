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
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async getByEmployeeId(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId } = req.params;
            const data = await KpiService.getByEmployeeId(employeeId);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async getByEmployeePeriod(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId } = req.params;
            const { period } = req.query;
            const data = await KpiService.getByEmployeePeriod(employeeId, period as string);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = await KpiService.getById(id);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await KpiService.create(req.body);
            return res.status(201).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = await KpiService.update(id, req.body);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async updateActualValue(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { actualValue } = req.body;
            if (actualValue === undefined) {
                return res.status(400).json({ success: false, message: 'actualValue is required' });
            }
            // Optional evidence file from multer
            const evidenceUrl = (req as any).file
                ? `/documents/${(req as any).file.filename}`
                : (req.body.evidenceUrl || undefined);
            const data = await KpiService.updateActualValue(id, parseFloat(actualValue), evidenceUrl);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = await KpiService.delete(id);
            return res.status(200).json({ success: true, ...data });
        } catch (error) {
            return next(error);
        }
    }

    static async uploadEvidence(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!(req as any).file) {
                return res.status(400).json({ success: false, message: 'Evidence file is required' });
            }
            const evidenceUrl = `/documents/${(req as any).file.filename}`;
            const data = await KpiService.updateEvidence(id, evidenceUrl);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async generateFromAbk(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId, year, period } = req.body;
            if (!employeeId || !year || !period) {
                return res.status(400).json({ success: false, message: 'employeeId, year, and period are required' });
            }
            const data = await KpiService.generateFromAbk(employeeId, parseInt(year), period);
            if (data && (data as any)._isBusinessError) {
                return res.status(200).json({ success: false, message: (data as any).message });
            }
            return res.status(201).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async syncRealisasiFromWla(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId, period } = req.body;
            if (!employeeId || !period) {
                return res.status(400).json({ success: false, message: 'employeeId and period are required' });
            }
            const data = await KpiService.syncRealisasiFromWla(employeeId, period);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async rebalanceWeights(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId, period } = req.body;
            if (!employeeId || !period) {
                return res.status(400).json({ success: false, message: 'employeeId and period are required' });
            }
            const data = await KpiService.rebalanceWeights(employeeId, period);
            if (data && (data as any)._isBusinessError) {
                return res.status(200).json({ success: false, message: (data as any).message });
            }
            return res.status(200).json(data); // data already contains success and message properties
        } catch (error) {
            return next(error);
        }
    }
}
