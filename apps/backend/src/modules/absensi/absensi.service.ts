
import { AbsensiRepository } from './absensi.repository';
import { AppError } from '../../utils/errors';

class AbsensiService {
  static async getAllAttendanceRecords(query: any) {
    try {
      return await AbsensiRepository.findAll(query);
    } catch (error: any) {
      throw new AppError(`Error retrieving attendance records: ${error.message}`, 500);
    }
  }

  static async getAttendanceRecordById(id: string) {
    try {
      const record = await AbsensiRepository.findById(id);
      if (!record) {
        throw new AppError('Attendance record not found', 404);
      }
      return record;
    } catch (error: any) {
      if (error.message === 'Attendance record not found') {
        throw error;
      }
      throw new AppError(`Error retrieving attendance record: ${error.message}`, 500);
    }
  }

  static async clockIn(employeeId: string, employeeName: string) {
    try {
      return await AbsensiRepository.clockIn(employeeId, employeeName);
    } catch (error: any) {
      if (error.message === 'Already clocked in today.') {
        throw new AppError(error.message, 400);
      }
      throw new AppError(`Error processing clock-in: ${error.message}`, 500);
    }
  }

  static async clockOut(employeeId: string) {
    try {
      return await AbsensiRepository.clockOut(employeeId);
    } catch (error: any) {
      if (error.message === 'No active clock-in record found for today.') {
        throw new AppError(error.message, 404);
      }
      throw new AppError(`Error processing clock-out: ${error.message}`, 500);
    }
  }

  static async getAttendanceByEmployeeId(employeeId: string) {
    try {
      return await AbsensiRepository.findByEmployeeId(employeeId);
    } catch (error: any) {
      throw new AppError(`Error retrieving attendance records for employee: ${error.message}`, 500);
    }
  }

  static async createAttendanceRecord(attendanceData: any) {
    try {
      return await AbsensiRepository.create(attendanceData);
    } catch (error: any) {
      throw new AppError(`Error creating attendance record: ${error.message}`, 500);
    }
  }

  static async updateAttendanceRecord(id: string, attendanceData: any) {
    try {
      const updatedRecord = await AbsensiRepository.update(id, attendanceData);
      if (!updatedRecord) {
        throw new AppError('Attendance record not found', 404);
      }
      return updatedRecord;
    } catch (error: any) {
      if (error.message === 'Attendance record not found') {
        throw error;
      }
      throw new AppError(`Error updating attendance record: ${error.message}`, 500);
    }
  }

  static async deleteAttendanceRecord(id: string) {
    try {
      const deleted = await AbsensiRepository.delete(id);
      if (!deleted) {
        throw new AppError('Attendance record not found', 404);
      }
      return { message: 'Attendance record deleted successfully' };
    } catch (error: any) {
      if (error.message === 'Attendance record not found') {
        throw error;
      }
      throw new AppError(`Error deleting attendance record: ${error.message}`, 500);
    }
  }
}

export default AbsensiService;
