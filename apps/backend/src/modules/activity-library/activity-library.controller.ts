import { Request, Response, NextFunction } from 'express';
import ActivityLibraryService from './activity-library.service';

export default class ActivityLibraryController {

    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { position, department, category } = req.query;
            const filters = {
                position: position as string | undefined,
                department: department as string | undefined,
                category: category as string | undefined,
            };
            const data = await ActivityLibraryService.getAll(filters);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    static async getByPosition(req: Request, res: Response, next: NextFunction) {
        try {
            const { position } = req.params;
            const data = await ActivityLibraryService.getByPosition(position);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = await ActivityLibraryService.getById(id);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    static async getPositions(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await ActivityLibraryService.getPositions();
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await ActivityLibraryService.create(req.body);
            res.status(201).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = await ActivityLibraryService.update(id, req.body);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = await ActivityLibraryService.delete(id);
            res.status(200).json({ success: true, ...data });
        } catch (error) {
            next(error);
        }
    }
}
