import JabatanService from './jabatan.service';
import { Request, Response, NextFunction } from 'express';

class JabatanController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const jabatan = await JabatanService.getAll();
            return res.status(200).json({ success: true, data: jabatan });
        } catch (error) {
            return next(error);
        }
    }

    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id);
            const jabatan = await JabatanService.getById(id);
            return res.status(200).json({ success: true, data: jabatan });
        } catch (error) {
            return next(error);
        }
    }

    static async getByLevel(req: Request, res: Response, next: NextFunction) {
        try {
            const level = parseInt(req.params.level);
            const jabatan = await JabatanService.getByLevel(level);
            return res.status(200).json({ success: true, data: jabatan });
        } catch (error) {
            return next(error);
        }
    }

    static async getTree(req: Request, res: Response, next: NextFunction) {
        try {
            const tree = await JabatanService.getTree();
            return res.status(200).json({ success: true, data: tree });
        } catch (error) {
            return next(error);
        }
    }

    static async getTreeWithEmployees(req: Request, res: Response, next: NextFunction) {
        try {
            const tree = await JabatanService.getTreeWithEmployees();
            return res.status(200).json({ success: true, data: tree });
        } catch (error) {
            return next(error);
        }
    }

    static async getSubordinates(req: Request, res: Response, next: NextFunction) {
        try {
            const { pegawaiId } = req.params;
            const recursive = req.query.recursive === 'true';

            const subordinates = recursive
                ? await JabatanService.getAllSubordinates(pegawaiId)
                : await JabatanService.getSubordinates(pegawaiId);

            return res.status(200).json({ success: true, data: subordinates });
        } catch (error) {
            return next(error);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const jabatan = await JabatanService.create(req.body);
            return res.status(201).json({ success: true, data: jabatan });
        } catch (error) {
            return next(error);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id);
            const jabatan = await JabatanService.update(id, req.body);
            return res.status(200).json({ success: true, data: jabatan });
        } catch (error) {
            return next(error);
        }
    }

    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id);
            const result = await JabatanService.delete(id);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return next(error);
        }
    }
}

export default JabatanController;
