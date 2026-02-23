import { Request, Response, NextFunction } from 'express';
import LogAktivitasHarianService from './log-aktivitas-harian.service';

interface AuthRequest extends Request {
    user?: any;
}

export default class LogAktivitasHarianController {

    static async createLog(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            // Check if current user info is available (authMiddleware stores in req.user)
            // Or rely on body payload
            const id_pegawai = req.user?.employeeId || req.user?.id || req.body.id_pegawai;

            const data = await LogAktivitasHarianService.createLog({
                id_pegawai: Number(id_pegawai),
                tanggal: req.body.tanggal,
                id_activity_library: Number(req.body.id_activity_library),
                frekuensi: Number(req.body.frekuensi || 1),
                catatan: req.body.catatan
            });
            return res.status(201).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async createBulkLog(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            console.log("createBulkLog req.body:", req.body);
            console.log("createBulkLog req.user:", req.user);
            const id_pegawai = req.user?.employeeId || req.user?.id || req.body.id_pegawai;
            const { tanggal, logs } = req.body;
            console.log("Resolved id_pegawai:", id_pegawai, "Type:", typeof id_pegawai);

            if (!tanggal || !logs || !Array.isArray(logs)) {
                return res.status(400).json({ success: false, message: 'tanggal and logs array are required' });
            }

            // Remove Number() wrapping since id_pegawai might be a UUID string like 'emp-123'
            const data = await LogAktivitasHarianService.createBulkLogs(
                id_pegawai,
                tanggal,
                logs
            );
            return res.status(201).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async getMyLogs(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const id_pegawai = req.user?.employeeId || req.user?.id || req.query.id_pegawai;
            const tanggal = req.query.tanggal as string;

            if (!id_pegawai || !tanggal) {
                return res.status(400).json({ success: false, message: 'id_pegawai and tanggal are required' });
            }

            const data = await LogAktivitasHarianService.getMyLogs(id_pegawai, tanggal);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const id_pegawai = req.user?.employeeId || req.user?.id || req.query.id_pegawai;
            const startDate = req.query.startDate as string;
            const endDate = req.query.endDate as string;

            if (!id_pegawai || !startDate || !endDate) {
                return res.status(400).json({ success: false, message: 'id_pegawai, startDate, and endDate are required' });
            }

            const data = await LogAktivitasHarianService.getSummary(id_pegawai, startDate, endDate);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async getAdminLogs(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const tanggal = req.query.tanggal as string;
            const id_pegawai = req.query.id_pegawai as string;
            if (!tanggal || !id_pegawai) {
                return res.status(400).json({ success: false, message: 'tanggal and id_pegawai are required' });
            }
            const data = await LogAktivitasHarianService.getMyLogs(id_pegawai, tanggal);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async getAdminSummary(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const tanggal = req.query.tanggal as string;
            if (!tanggal) {
                return res.status(400).json({ success: false, message: 'tanggal is required' });
            }
            const data = await LogAktivitasHarianService.getAdminSummaryByDate(tanggal);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }

    static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const id_log = req.params.id;
            const { status } = req.body; // 'approved' | 'rejected'

            if (!['approved', 'rejected'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }

            const data = await LogAktivitasHarianService.updateStatus(Number(id_log), status as any);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return next(error);
        }
    }
}
