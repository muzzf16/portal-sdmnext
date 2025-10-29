
import LaporanService from './laporan.service';
import { Request, Response, NextFunction } from 'express';

class LaporanController {
  static async getLaporanPegawai(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await LaporanService.generateLaporanPegawai();
      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }

  static async getLaporanAbsensi(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const report = await LaporanService.generateLaporanAbsensi(startDate as string, endDate as string);
      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }

  static async getLaporanPenggajian(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;
      const report = await LaporanService.generateLaporanPenggajian(month as string, year as string);
      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }
  
  static async getLaporanCuti(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;
      const report = await LaporanService.generateLaporanCuti(month as string, year as string);
      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }
  
  static async getLaporanKinerja(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;
      const report = await LaporanService.generateLaporanKinerja(month as string, year as string);
      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }
  
  // New endpoint for turnover analysis
  static async getLaporanTurnover(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate and endDate are required'
        });
      }
      const report = await LaporanService.generateLaporanTurnover(startDate as string, endDate as string);
      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }
  
  // New endpoint for demographic analysis
  static async getLaporanDemografi(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await LaporanService.generateLaporanDemografi();
      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }
  
  // Enhanced analytics endpoints
  static async getLaporanPegawaiKomprehensif(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await LaporanService.generateLaporanPegawaiKomprehensif();
      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }
  
  static async getLaporanAbsensiAnalitik(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate and endDate are required'
        });
      }
      const report = await LaporanService.generateLaporanAbsensiAnalitik(startDate as string, endDate as string);
      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }
  
  static async getLaporanPenggajianAnalitik(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;
      if (!month || !year) {
        return res.status(400).json({
          success: false,
          message: 'month and year are required'
        });
      }
      const report = await LaporanService.generateLaporanPenggajianAnalitik(month as string, year as string);
      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }
  
  // Export endpoints for different report types
  static async exportLaporanPegawai(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await LaporanService.generateLaporanPegawai();
      const formattedData = LaporanService.formatForExport(report, 'pegawai');
      
      // Set headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=laporan-pegawai.xlsx');
      
      // For now, send the JSON data that can be used by frontend to generate Excel/PDF
      return res.status(200).json({
        success: true,
        data: formattedData,
        metadata: {
          reportType: 'pegawai',
          exportFormat: 'xlsx',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }
  
  static async exportLaporanAbsensi(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate and endDate are required'
        });
      }
      
      const report = await LaporanService.generateLaporanAbsensi(startDate as string, endDate as string);
      const formattedData = LaporanService.formatForExport(report, 'absensi');
      
      // Set headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=laporan-absensi.xlsx');
      
      return res.status(200).json({
        success: true,
        data: formattedData,
        metadata: {
          reportType: 'absensi',
          exportFormat: 'xlsx',
          timestamp: new Date().toISOString(),
          filters: { startDate, endDate }
        }
      });
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }
  
  static async exportLaporanPenggajian(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;
      if (!month || !year) {
        return res.status(400).json({
          success: false,
          message: 'month and year are required'
        });
      }
      
      const report = await LaporanService.generateLaporanPenggajian(month as string, year as string);
      const formattedData = LaporanService.formatForExport(report, 'penggajian');
      
      // Set headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=laporan-penggajian.xlsx');
      
      return res.status(200).json({
        success: true,
        data: formattedData,
        metadata: {
          reportType: 'penggajian',
          exportFormat: 'xlsx',
          timestamp: new Date().toISOString(),
          filters: { month, year }
        }
      });
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }
  
  static async exportLaporanCuti(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;
      if (!month || !year) {
        return res.status(400).json({
          success: false,
          message: 'month and year are required'
        });
      }
      
      const report = await LaporanService.generateLaporanCuti(month as string, year as string);
      const formattedData = LaporanService.formatForExport(report, 'cuti');
      
      // Set headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=laporan-cuti.xlsx');
      
      return res.status(200).json({
        success: true,
        data: formattedData,
        metadata: {
          reportType: 'cuti',
          exportFormat: 'xlsx',
          timestamp: new Date().toISOString(),
          filters: { month, year }
        }
      });
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }
  
  static async exportLaporanKinerja(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;
      if (!month || !year) {
        return res.status(400).json({
          success: false,
          message: 'month and year are required'
        });
      }
      
      const report = await LaporanService.generateLaporanKinerja(month as string, year as string);
      const formattedData = LaporanService.formatForExport(report, 'kinerja');
      
      // Set headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=laporan-kinerja.xlsx');
      
      return res.status(200).json({
        success: true,
        data: formattedData,
        metadata: {
          reportType: 'kinerja',
          exportFormat: 'xlsx',
          timestamp: new Date().toISOString(),
          filters: { month, year }
        }
      });
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }
}

export default LaporanController;
