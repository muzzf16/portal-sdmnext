
import AbsensiService from './absensi.service';
import { Request, Response, NextFunction } from 'express';
import { AbsensiCreatePayload, AbsensiFilters, AbsensiUpdatePayload } from './absensi.model';

class AbsensiController {
  static async getAllAttendanceRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: AbsensiFilters = {
        employeeId: typeof req.query.employeeId === 'string' ? req.query.employeeId : undefined,
        startDate: typeof req.query.startDate === 'string' ? req.query.startDate : undefined,
        endDate: typeof req.query.endDate === 'string' ? req.query.endDate : undefined
      };
      const attendanceRecords = await AbsensiService.getAllAttendanceRecords(filters);
      res.status(200).json(attendanceRecords);
    } catch (error) {
      next(error);
    }
  }

  static async getAttendanceRecordById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const attendanceRecord = await AbsensiService.getAttendanceRecordById(id);
      res.status(200).json(attendanceRecord);
    } catch (error) {
      next(error);
    }
  }

  static async clockIn(req: Request, res: Response, next: NextFunction) {
    try {
      const authenticatedName = typeof req.user?.name === 'string' ? req.user.name : '';
      const result = await AbsensiService.clockIn({
        employeeId: req.body.employeeId || req.user?.employeeId || '',
        employeeName: req.body.employeeName || authenticatedName
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async clockOut(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = req.body.employeeId || req.user?.employeeId || '';
      const result = await AbsensiService.clockOut(employeeId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getAttendanceByEmployeeId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const filters = {
        startDate: typeof req.query.startDate === 'string' ? req.query.startDate : undefined,
        endDate: typeof req.query.endDate === 'string' ? req.query.endDate : undefined
      };
      const attendanceRecords = await AbsensiService.getAttendanceByEmployeeId(id, filters);
      res.status(200).json(attendanceRecords);
    } catch (error) {
      next(error);
    }
  }

  static async createAttendanceRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const attendanceData = req.body as AbsensiCreatePayload;
      const newRecord = await AbsensiService.createAttendanceRecord(attendanceData);
      res.status(201).json(newRecord);
    } catch (error) {
      next(error);
    }
  }

  static async updateAttendanceRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const attendanceData = req.body as AbsensiUpdatePayload;
      const updatedRecord = await AbsensiService.updateAttendanceRecord(id, attendanceData);
      res.status(200).json(updatedRecord);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAttendanceRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await AbsensiService.deleteAttendanceRecord(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async uploadLog(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const result = await AbsensiService.parseAndSaveLog(req.file.buffer);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      return next(error);
    }
  }
}

export default AbsensiController;
