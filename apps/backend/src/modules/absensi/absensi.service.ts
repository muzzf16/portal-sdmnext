import { AbsensiRepository } from './absensi.repository';
import { PegawaiRepository } from '../pegawai/pegawai.repository';
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

  static async parseAndSaveLog(buffer: Buffer) {
    try {
      // Decode UTF-16LE
      const content = buffer.toString('utf16le');
      const lines = content.split('\n');

      // Skip header (first line)
      // Format: No  TMNo  EnNo  Name  GMNo  Mode  In/Out  Antipass  ProxyWork  DateTime
      const records = lines.slice(1).filter(line => line.trim() !== '');

      const attendanceMap: Record<string, { employeeName: string, date: string, punches: string[] }> = {};

      for (const line of records) {
        const columns = line.split('\t');
        if (columns.length >= 10) {
          const enNoRaw = columns[2].trim(); // employee ID / NIP in machine
          const enNo = enNoRaw.length > 3 ? enNoRaw.slice(-3) : enNoRaw.padStart(3, '0');
          const name = columns[3].trim();
          const dateTimeStr = columns[9].trim();
          // dateTimeStr is like "2024-12-23 16:49:50"

          if (!dateTimeStr) continue;

          const parts = dateTimeStr.split(' ');
          if (parts.length >= 2) {
            const date = parts[0];
            const time = parts[1];

            const key = `${enNo}-${date}`;
            if (!attendanceMap[key]) {
              attendanceMap[key] = { employeeName: name, date, punches: [] };
            }
            attendanceMap[key].punches.push(time);
          }
        }
      }

      let createdCount = 0;
      let updatedCount = 0;

      for (const [key, data] of Object.entries(attendanceMap)) {
        const enNo = key.split('-')[0];
        const punches = data.punches.sort();

        const clockIn = punches[0];
        let clockOut = punches.length > 1 ? punches[punches.length - 1] : null;

        // Find existing record for this EnNo (or actual employee ID if we can map it)
        const allEmp = await PegawaiRepository.findAll();
        let employeeInfo = allEmp.find((emp: any) => {
          // match last 3 digits of NIP
          if (emp.nip && emp.nip.endsWith(enNo)) return true;
          // match partial name (case-insensitive)
          const dbName = emp.name.toLowerCase();
          const logName = data.employeeName.toLowerCase();
          return dbName.includes(logName) || logName.includes(dbName);
        });

        const actualEmployeeId = employeeInfo ? employeeInfo.id.toString() : enNo;
        const actualEmployeeName = employeeInfo ? employeeInfo.name : data.employeeName;

        const existingRecord = await AbsensiRepository.findByDate(actualEmployeeId, data.date);

        let finalClockIn: string | null = clockIn;
        let finalClockOut: string | null = clockOut;

        // If there is only 1 punch and it's afternoon, assume it's an out punch
        if (punches.length === 1 && punches[0] >= '12:00:00') {
          finalClockIn = null;
          finalClockOut = punches[0];
        }

        if (existingRecord) {
          // update existing
          const updateData: any = {};
          if (finalClockIn && (!existingRecord.clockIn || finalClockIn < existingRecord.clockIn)) {
            updateData.clockIn = finalClockIn;
          }
          if (finalClockOut && (!existingRecord.clockOut || finalClockOut > existingRecord.clockOut)) {
            updateData.clockOut = finalClockOut;
          }

          if (Object.keys(updateData).length > 0) {
            const newIn = updateData.clockIn || existingRecord.clockIn;
            const newOut = updateData.clockOut || existingRecord.clockOut;
            if (newIn && newOut) {
              const start = new Date(`${data.date}T${newIn}`);
              const end = new Date(`${data.date}T${newOut}`);
              const diffMs = end.getTime() - start.getTime();
              const diffHrs = Math.floor(diffMs / 3600000);
              const diffMins = Math.floor((diffMs % 3600000) / 60000);
              updateData.workDuration = `${diffHrs}j ${diffMins}m`;
            }

            await AbsensiRepository.update(existingRecord.id, updateData);
            updatedCount++;
          }
        } else {
          // create new
          const isLate = finalClockIn && finalClockIn > '09:00:00';
          const newRecord: any = {
            employeeId: actualEmployeeId,
            employeeName: actualEmployeeName,
            date: data.date,
            clockIn: finalClockIn,
            clockOut: finalClockOut,
            status: isLate ? 'terlambat' : 'hadir',
            workDuration: null
          };

          if (finalClockIn && finalClockOut) {
            const start = new Date(`${data.date}T${finalClockIn}`);
            const end = new Date(`${data.date}T${finalClockOut}`);
            const diffMs = end.getTime() - start.getTime();
            const diffHrs = Math.floor(diffMs / 3600000);
            const diffMins = Math.floor((diffMs % 3600000) / 60000);
            newRecord.workDuration = `${diffHrs}j ${diffMins}m`;
          }

          await AbsensiRepository.create(newRecord);
          createdCount++;
        }
      }

      return { message: 'Log processed successfully', created: createdCount, updated: updatedCount };
    } catch (error: any) {
      throw new AppError(`Error parsing and saving log: ${error.message}`, 500);
    }
  }
}

export default AbsensiService;
