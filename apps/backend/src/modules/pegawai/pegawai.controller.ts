import PegawaiService from './pegawai.service';
import { AppError } from '../../utils/errors';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    // Pass error as first parameter when validation fails
    // Using type assertion to handle TypeScript error
    cb(new Error('Invalid file type. Only images are allowed.') as any, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

class PegawaiController {
  static async getAllPegawai(req: Request, res: Response, next: NextFunction) {
    try {
      const includeDirectors = req.query.includeDirectors === 'true';
      const pegawai = await PegawaiService.getAllPegawai({ includeDirectors });
      return res.status(200).json({ success: true, data: pegawai });
    } catch (error) {
      return next(error);
    }
  }

  static async getPegawaiById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const pegawai = await PegawaiService.getPegawaiById(id);
      return res.status(200).json({ success: true, data: pegawai });
    } catch (error) {
      return next(error);
    }
  }

  static async createPegawai(req: Request, res: Response, next: NextFunction) {
    try {
      let avatarUrl = req.body.avatarUrl;
      if (req.file) {
        avatarUrl = `/avatars/${req.file.filename}`;
      }

      const { name, email, ...pegawaiData } = req.body;

      const jsonFields = ['educationHistory', 'workHistory', 'trainingCertificates', 'payrollInfo'];
      for (const field of jsonFields) {
        if (pegawaiData[field] && typeof pegawaiData[field] === 'string') {
          try {
            pegawaiData[field] = JSON.parse(pegawaiData[field]);
          } catch (e) {
            return next(new AppError(`Invalid ${field} JSON format.`, 400));
          }
        }
      }

      const newPegawaiData = {
        ...pegawaiData,
        avatarUrl: avatarUrl || '/avatars/default-avatar.jpg'
      };

      const newPegawai = await PegawaiService.createPegawai(name, email, newPegawaiData);
      return res.status(201).json({ success: true, data: newPegawai });
    } catch (error) {
      return next(error);
    }
  }

  static async updatePegawai(req: Request, res: Response, next: NextFunction) {
    try {
      let avatarUrl = req.body.avatarUrl;
      if (req.file) {
        avatarUrl = `/avatars/${req.file.filename}`;
      }

      const { id } = req.params;
      const { name, email, ...pegawaiData } = req.body;

      const jsonFields = ['educationHistory', 'workHistory', 'trainingCertificates', 'payrollInfo'];
      for (const field of jsonFields) {
        if (pegawaiData[field] && typeof pegawaiData[field] === 'string') {
          try {
            pegawaiData[field] = JSON.parse(pegawaiData[field]);
          } catch (e) {
            return next(new AppError(`Invalid ${field} JSON format.`, 400));
          }
        }
      }

      const updatedPegawaiData = {
        ...pegawaiData
      };

      if (avatarUrl) {
        updatedPegawaiData.avatarUrl = avatarUrl;
      }

      const updatedPegawai = await PegawaiService.updatePegawai(id, name, email, updatedPegawaiData);
      return res.status(200).json({ success: true, data: updatedPegawai });
    } catch (error) {
      return next(error);
    }
  }

  static async deletePegawai(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await PegawaiService.deletePegawai(id);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }

  static async updatePegawaiPayrollInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payrollInfo = req.body;
      const result = await PegawaiService.updatePegawaiPayrollInfo(id, payrollInfo);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }

  static async getGenderDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const distribution = await PegawaiService.getGenderDistribution();
      return res.status(200).json({ success: true, data: distribution });
    } catch (error) {
      return next(error);
    }
  }

  static async getEducationDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const distribution = await PegawaiService.getEducationDistribution();
      return res.status(200).json({ success: true, data: distribution });
    } catch (error) {
      return next(error);
    }
  }

  static async getDepartmentDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const distribution = await PegawaiService.getDepartmentDistribution();
      return res.status(200).json({ success: true, data: distribution });
    } catch (error) {
      return next(error);
    }
  }

  // Upload avatar middleware
  static uploadAvatar = upload.single('photo');
}

export default PegawaiController;