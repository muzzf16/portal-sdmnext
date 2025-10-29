import CustomReportService from './custom-report.service';
import { Request, Response, NextFunction } from 'express';

class CustomReportController {
  static async getReportMetadata(req: Request, res: Response, next: NextFunction) {
    try {
      const metadata = await CustomReportService.getReportMetadata();
      return res.status(200).json({
        success: true,
        data: metadata
      });
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }

  static async generateCustomReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { filters, fields, reportType } = req.body;
      
      if (!reportType) {
        return res.status(400).json({
          success: false,
          message: 'Report type is required'
        });
      }
      
      if (!Array.isArray(fields) || fields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one field must be selected'
        });
      }
      
      const report = await CustomReportService.generateCustomReport(filters, fields, reportType);
      
      return res.status(200).json({
        success: true,
        data: report,
        metadata: {
          reportType,
          fields,
          filters,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }
  
  static async exportCustomReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { filters, fields, reportType } = req.body;
      
      if (!reportType) {
        return res.status(400).json({
          success: false,
          message: 'Report type is required'
        });
      }
      
      if (!Array.isArray(fields) || fields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one field must be selected'
        });
      }
      
      const report = await CustomReportService.generateCustomReport(filters, fields, reportType);
      
      // Set headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=custom-report-${reportType}.xlsx`);
      
      return res.status(200).json({
        success: true,
        data: report,
        metadata: {
          reportType,
          fields,
          filters,
          exportFormat: 'xlsx',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
      return; // Explicitly return to satisfy TypeScript
    }
  }
}

export default CustomReportController;