import { Request, Response } from 'express';
import { KreditBerkasService } from './kredit-berkas.service';
import { KreditWaNotificationService } from './kredit-wa-notification.service';

export const KreditBerkasController = {
    async create(req: Request, res: Response) {
        try {
            const employeeId = (req as any).user?.employeeId || (req as any).user?.userId || (req as any).user?.id;
            if (!employeeId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            // Validasi no_wa_nasabah wajib diisi
            if (!req.body.no_wa_nasabah || typeof req.body.no_wa_nasabah !== 'string' || req.body.no_wa_nasabah.trim().length < 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Nomor WhatsApp nasabah wajib diisi (min 10 digit)'
                });
            }

            const result = await KreditBerkasService.create(employeeId, req.body);
            return res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    async getAll(req: Request, res: Response) {
        try {
            const result = await KreditBerkasService.getAll(req.query);
            return res.json({ success: true, data: result });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    async getById(req: Request, res: Response) {
        try {
            const result = await KreditBerkasService.getById(parseInt(req.params.id));
            if (!result) return res.status(404).json({ success: false, message: 'Not found' });
            return res.json({ success: true, data: result });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    async getPending(req: Request, res: Response) {
        try {
            const employeeId = (req.query.employee_id as string) || (req as any).user?.employeeId || (req as any).user?.userId || (req as any).user?.id;
            if (!employeeId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const result = await KreditBerkasService.getPendingForUser(employeeId);
            return res.json({ success: true, data: result });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    async processStage(req: Request, res: Response) {
        try {
            const employeeId = (req as any).user?.employeeId || (req as any).user?.userId || (req as any).user?.id;
            if (!employeeId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const result = await KreditBerkasService.processStage(
                parseInt(req.params.id),
                employeeId,
                req.body
            );
            return res.json({ success: true, data: result });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    async getMonitoring(req: Request, res: Response) {
        try {
            const result = await KreditBerkasService.getMonitoring();
            return res.json({ success: true, data: result });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    async getWaLog(req: Request, res: Response) {
        try {
            const berkasId = parseInt(req.params.id);
            if (isNaN(berkasId)) {
                return res.status(400).json({ success: false, message: 'ID berkas tidak valid' });
            }

            const log = await KreditWaNotificationService.getNotificationLog(berkasId);
            return res.json({ success: true, data: log });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    async resendWa(req: Request, res: Response) {
        try {
            const logId = parseInt(req.params.logId);
            if (isNaN(logId)) {
                return res.status(400).json({ success: false, message: 'ID log tidak valid' });
            }

            const result = await KreditWaNotificationService.resend(logId);
            return res.json(result);
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};

