import { Request, Response } from 'express';
import { KreditBerkasService } from './kredit-berkas.service';

export const KreditBerkasController = {
    async create(req: Request, res: Response) {
        try {
            const employeeId = (req as any).user?.employeeId || (req as any).user?.userId || (req as any).user?.id;
            if (!employeeId) return res.status(401).json({ success: false, message: 'Unauthorized' });

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
            const employeeId = (req as any).user?.employeeId || (req as any).user?.userId || (req as any).user?.id;
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
    }
};
