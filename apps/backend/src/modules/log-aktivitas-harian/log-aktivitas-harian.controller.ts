import { Request, Response, NextFunction } from 'express';
import LogAktivitasHarianService from './log-aktivitas-harian.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads/documents';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

interface AuthRequest extends Request {
    user?: any;
}

export default class LogAktivitasHarianController {
    static uploadAny = upload.any();

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
            const id_pegawai = req.user?.employeeId || req.user?.id || req.body.id_pegawai;
            const { tanggal } = req.body;
            let logs = req.body.logs;

            if (typeof logs === 'string') {
                try {
                    logs = JSON.parse(logs);
                } catch (e) {
                    return res.status(400).json({ success: false, message: 'Invalid logs format' });
                }
            }

            if (!tanggal || !logs || !Array.isArray(logs)) {
                return res.status(400).json({ success: false, message: 'tanggal and logs array are required' });
            }

            // Attach file URLs if any
            if (req.files && Array.isArray(req.files)) {
                logs.forEach((log: any) => {
                    const file = (req.files as Express.Multer.File[]).find(f => f.fieldname === `file_${log.id_activity_library}`);
                    if (file) {
                        log.lampiran = `/uploads/documents/${file.filename}`;
                    }
                });
            }

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
