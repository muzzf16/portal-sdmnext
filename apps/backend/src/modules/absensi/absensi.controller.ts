
import AbsensiService from './absensi.service';
import { Request, Response, NextFunction } from 'express';

class AbsensiController {
  static async getAllAttendanceRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const attendanceRecords = await AbsensiService.getAllAttendanceRecords(query);
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
      const { employeeId, employeeName } = req.body;
      const result = await AbsensiService.clockIn(employeeId, employeeName);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async clockOut(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.body;
      const result = await AbsensiService.clockOut(employeeId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getAttendanceByEmployeeId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const attendanceRecords = await AbsensiService.getAttendanceByEmployeeId(id);
      res.status(200).json(attendanceRecords);
    } catch (error) {
      next(error);
    }
  }

  static async createAttendanceRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const attendanceData = req.body;
      const newRecord = await AbsensiService.createAttendanceRecord(attendanceData);
      res.status(201).json(newRecord);
    } catch (error) {
      next(error);
    }
  }

  static async updateAttendanceRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const attendanceData = req.body;
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
}

export default AbsensiController;
