import { Request, Response, NextFunction } from 'express';
import LaporanKepatuhanService from './laporan-kepatuhan.service';

interface AuthRequest extends Request {
    user?: any;
}

export default class LaporanKepatuhanController {
    static async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await LaporanKepatuhanService.create(req.body);
            return res.status(201).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const status = req.query.status as any;
            const employee_id = req.query.employee_id as string;
            
            const userRole = req.user?.role;
            const userEmployeeId = req.user?.employeeId || req.user?.userId;

            if (userRole === 'employee') {
                if (employee_id && String(employee_id) !== String(userEmployeeId)) {
                    return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke data pegawai ini' });
                }
                if (!employee_id) {
                    const data = await LaporanKepatuhanService.getByEmployeeId(userEmployeeId, status);
                    return res.status(200).json({ success: true, data });
                }
            }

            const data = await LaporanKepatuhanService.getAll(status, employee_id);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await LaporanKepatuhanService.getById(Number(req.params.id));
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async getMyReports(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const employeeId = req.user?.employeeId || req.user?.userId;
            const status = req.query.status as any;
            
            if (!employeeId) {
                return res.status(400).json({ success: false, message: 'User is not an employee' });
            }

            const data = await LaporanKepatuhanService.getByEmployeeId(employeeId, status);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = await LaporanKepatuhanService.update(Number(req.params.id), req.body);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await LaporanKepatuhanService.delete(Number(req.params.id));
            return res.status(200).json({ success: true, message: 'Laporan kepatuhan deleted successfully' });
        } catch (error) {
            return next(error);
        }
    }
}
