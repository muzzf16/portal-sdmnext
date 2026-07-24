import PelatihanService from './pelatihan.service';
import { Request, Response, NextFunction } from 'express';

class PelatihanController {
  static async getAllPelatihan(req: Request, res: Response, next: NextFunction) {
    try {
      const pelatihan = await PelatihanService.getAllPelatihan();
      res.status(200).json(pelatihan);
    } catch (error) {
      next(error);
    }
  }

  static async getPelatihanByEmployeeId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const pelatihan = await PelatihanService.getPelatihanByEmployeeId(id);
      res.status(200).json(pelatihan);
    } catch (error) {
      next(error);
    }
  }

  static async addPelatihan(req: Request, res: Response, next: NextFunction) {
    try {
      const targetEmployeeId = req.params.id || req.body.pegawai_id || req.body.employeeId;
      const pelatihanData = { ...req.body };

      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (files.certificate && files.certificate[0]) {
          pelatihanData.nomor_sertifikat = files.certificate[0].filename;
        }
        if (files.surat_jalan && files.surat_jalan[0]) {
          pelatihanData.surat_jalan = files.surat_jalan[0].filename;
        }
        if (files.sppd && files.sppd[0]) {
          pelatihanData.surat_jalan = files.sppd[0].filename;
        }
        if (files.surat_penawaran && files.surat_penawaran[0]) {
          pelatihanData.surat_penawaran = files.surat_penawaran[0].filename;
        }
      } else if (req.file) {
        if (req.file.fieldname === 'surat_jalan' || req.file.fieldname === 'sppd') {
          pelatihanData.surat_jalan = req.file.filename;
        } else if (req.file.fieldname === 'surat_penawaran') {
          pelatihanData.surat_penawaran = req.file.filename;
        } else {
          pelatihanData.nomor_sertifikat = req.file.filename;
        }
      }

      const newPelatihan = await PelatihanService.addPelatihan(targetEmployeeId, pelatihanData);
      res.status(201).json(newPelatihan);
    } catch (error) {
      next(error);
    }
  }

  static async updatePelatihan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const pelatihanData = { ...req.body };

      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (files.certificate && files.certificate[0]) {
          pelatihanData.nomor_sertifikat = files.certificate[0].filename;
        }
        if (files.surat_jalan && files.surat_jalan[0]) {
          pelatihanData.surat_jalan = files.surat_jalan[0].filename;
        }
        if (files.sppd && files.sppd[0]) {
          pelatihanData.surat_jalan = files.sppd[0].filename;
        }
        if (files.surat_penawaran && files.surat_penawaran[0]) {
          pelatihanData.surat_penawaran = files.surat_penawaran[0].filename;
        }
      } else if (req.file) {
        if (req.file.fieldname === 'surat_jalan' || req.file.fieldname === 'sppd') {
          pelatihanData.surat_jalan = req.file.filename;
        } else if (req.file.fieldname === 'surat_penawaran') {
          pelatihanData.surat_penawaran = req.file.filename;
        } else {
          pelatihanData.nomor_sertifikat = req.file.filename;
        }
      }

      const updated = await PelatihanService.updatePelatihan(id, pelatihanData);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  static async deletePelatihan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await PelatihanService.deletePelatihan(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default PelatihanController;