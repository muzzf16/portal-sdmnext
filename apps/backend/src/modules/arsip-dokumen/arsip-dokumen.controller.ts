// src/modules/arsip-dokumen/arsip-dokumen.controller.ts
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { ArsipDokumenService } from './arsip-dokumen.service';
import { ArsipDokumenFilters, KategoriDokumen, StatusDokumen } from './arsip-dokumen.model';

export class ArsipDokumenController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userRole: string | undefined = (req as any).user?.role;
      const filters: ArsipDokumenFilters = {
        kategori: req.query.kategori as KategoriDokumen | undefined,
        status: req.query.status as StatusDokumen | undefined,
        tingkatKerahasiaan: req.query.tingkatKerahasiaan as any,
        search: req.query.search as string | undefined,
        tanggalDari: req.query.tanggalDari as string | undefined,
        tanggalSampai: req.query.tanggalSampai as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      };
      const result = await ArsipDokumenService.getAll(filters, userRole);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userRole: string | undefined = (req as any).user?.role;
      const stats = await ArsipDokumenService.getStats(userRole);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  static async getExpiring(req: Request, res: Response, next: NextFunction) {
    try {
      const userRole: string | undefined = (req as any).user?.role;
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const docs = await ArsipDokumenService.getExpiring(days, userRole);
      res.status(200).json({ success: true, data: docs });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userRole: string | undefined = (req as any).user?.role;
      const doc = await ArsipDokumenService.getById(req.params.id, userRole);
      res.status(200).json({ success: true, data: doc });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;

      // Parse tags if sent as JSON string (multipart/form-data)
      if (body.tags && typeof body.tags === 'string') {
        try {
          body.tags = JSON.parse(body.tags);
        } catch {
          body.tags = body.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
        }
      }

      const fileData: { filePath?: string; ukuranFile?: number; tipeFile?: string } = {};
      if (req.file) {
        fileData.filePath = `/documents/${req.file.filename}`;
        fileData.ukuranFile = req.file.size;
        fileData.tipeFile = req.file.mimetype;
      }

      const uploadedByUserId = (req as any).user?.id;
      const doc = await ArsipDokumenService.create({ ...body, ...fileData }, uploadedByUserId);

      res.status(201).json({ success: true, data: doc, message: 'Dokumen berhasil diunggah' });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;

      if (body.tags && typeof body.tags === 'string') {
        try {
          body.tags = JSON.parse(body.tags);
        } catch {
          body.tags = body.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
        }
      }

      const fileData: { filePath?: string; ukuranFile?: number; tipeFile?: string } = {};
      if (req.file) {
        // Get old file path to remove it after successful update
        const existing = await ArsipDokumenService.getById(req.params.id);
        if (existing?.filePath) {
          const oldFilePath = path.join(__dirname, '../../../public', existing.filePath);
          if (fs.existsSync(oldFilePath)) {
            fs.unlink(oldFilePath, (err) => {
              if (err) console.error('Failed to delete old file:', err);
            });
          }
        }
        fileData.filePath = `/documents/${req.file.filename}`;
        fileData.ukuranFile = req.file.size;
        fileData.tipeFile = req.file.mimetype;
      }

      const doc = await ArsipDokumenService.update(req.params.id, { ...body, ...fileData });
      res.status(200).json({ success: true, data: doc, message: 'Dokumen berhasil diperbarui' });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ArsipDokumenService.delete(req.params.id);

      // Delete physical file if it exists
      if (result.filePath) {
        const fullPath = path.join(__dirname, '../../../public', result.filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlink(fullPath, (err) => {
            if (err) console.error('Failed to delete file:', err);
          });
        }
      }

      res.status(200).json({ success: true, message: 'Dokumen berhasil dihapus' });
    } catch (error) {
      next(error);
    }
  }
}
