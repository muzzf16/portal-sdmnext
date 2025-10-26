
import LaporanService from './laporan.service';
import { Request, Response, NextFunction } from 'express';

class LaporanController {
  static async getLaporanPegawai(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await LaporanService.generateLaporanPegawai();
      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLaporanAbsensi(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const report = await LaporanService.generateLaporanAbsensi(startDate as string, endDate as string);
      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLaporanPenggajian(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;
      const report = await LaporanService.generateLaporanPenggajian(month as string, year as string);
      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getLaporanCuti(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;
      const report = await LaporanService.generateLaporanCuti(month as string, year as string);
      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getLaporanKinerja(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;
      const report = await LaporanService.generateLaporanKinerja(month as string, year as string);
      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
}

export default LaporanController;
