import { AppError } from '../../utils/errors';
import { PegawaiRepository } from '../pegawai/pegawai.repository';
import {
  Absensi,
  AbsensiCreatePayload,
  AbsensiFilters,
  AbsensiUpdatePayload,
  AttendanceClockPayload,
  MachineLogImportResult,
  ParsedMachineAttendanceLog,
  SkippedLogEntry
} from './absensi.model';
import { AbsensiRepository } from './absensi.repository';

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatLocalTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const calculateWorkDuration = (date: string, clockIn?: string | null, clockOut?: string | null) => {
  if (!clockIn || !clockOut) {
    return null;
  }

  const start = new Date(`${date}T${clockIn}`);
  const end = new Date(`${date}T${clockOut}`);
  const diffMs = end.getTime() - start.getTime();

  if (Number.isNaN(diffMs) || diffMs < 0) {
    return null;
  }

  const diffHours = Math.floor(diffMs / 3600000);
  const diffMinutes = Math.floor((diffMs % 3600000) / 60000);
  return `${diffHours}j ${diffMinutes}m`;
};

const getAttendanceStatus = (clockIn?: string | null, fallbackStatus?: string) => {
  if (clockIn) {
    return clockIn > '09:00:00' ? 'terlambat' : 'hadir';
  }

  return fallbackStatus || 'hadir';
};

const parseMachineLogs = (buffer: Buffer): ParsedMachineAttendanceLog[] => {
  const content = buffer.toString('utf16le');
  const lines = content.split('\n').slice(1).filter((line) => line.trim() !== '');
  const attendanceMap = new Map<string, ParsedMachineAttendanceLog>();

  for (const line of lines) {
    const columns = line.split('\t');

    if (columns.length < 10) {
      continue;
    }

    const machineEmployeeCodeRaw = columns[2].trim();
    const machineEmployeeCode = machineEmployeeCodeRaw.length > 3
      ? machineEmployeeCodeRaw.slice(-3)
      : machineEmployeeCodeRaw.padStart(3, '0');
    const employeeName = columns[3].trim();
    const dateTimeStr = columns[9].trim();

    if (!dateTimeStr) {
      continue;
    }

    const [date, time] = dateTimeStr.split(' ');

    if (!date || !time) {
      continue;
    }

    const key = `${machineEmployeeCode}-${date}`;
    const existing = attendanceMap.get(key);

    if (existing) {
      existing.punches.push(time);
      continue;
    }

    attendanceMap.set(key, {
      machineEmployeeCode,
      employeeName,
      date,
      punches: [time]
    });
  }

  return Array.from(attendanceMap.values());
};

const resolveEmployeeFromMachineLog = (
  machineLog: ParsedMachineAttendanceLog,
  employees: Awaited<ReturnType<typeof PegawaiRepository.findAll>>
): { employeeId: string; employeeName: string } | null => {
  const matchedEmployee = employees.find((employee) => {
    const normalizedLogName = machineLog.employeeName.toLowerCase();
    const normalizedEmployeeName = employee.name.toLowerCase();

    return (
      (employee.nip && employee.nip.endsWith(machineLog.machineEmployeeCode)) ||
      normalizedEmployeeName.includes(normalizedLogName) ||
      normalizedLogName.includes(normalizedEmployeeName)
    );
  });

  if (!matchedEmployee) {
    return null;
  }

  return {
    employeeId: String(matchedEmployee.id),
    employeeName: matchedEmployee.name
  };
};

const normalizeAttendancePayload = (
  payload: AbsensiCreatePayload | AbsensiUpdatePayload,
  existingRecord?: Absensi | null
) => {
  const date = payload.date ?? existingRecord?.date;
  const clockIn = payload.clockIn ?? existingRecord?.clockIn ?? null;
  const clockOut = payload.clockOut ?? existingRecord?.clockOut ?? null;

  return {
    ...payload,
    clockIn,
    clockOut,
    workDuration: payload.workDuration ?? calculateWorkDuration(date || '', clockIn, clockOut),
    status: getAttendanceStatus(clockIn, payload.status ?? existingRecord?.status)
  };
};

class AbsensiService {
  static async getAllAttendanceRecords(filters: AbsensiFilters) {
    try {
      return await AbsensiRepository.findAll(filters);
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
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(`Error retrieving attendance record: ${error.message}`, 500);
    }
  }

  static async clockIn(payload: AttendanceClockPayload) {
    const employeeId = payload.employeeId?.trim();
    const employeeName = payload.employeeName?.trim();

    if (!employeeId || !employeeName) {
      throw new AppError('Employee ID and employee name are required', 400);
    }

    try {
      const now = new Date();
      const today = formatLocalDate(now);
      const currentTime = formatLocalTime(now);
      const existingRecord = await AbsensiRepository.findByDate(employeeId, today);

      if (existingRecord?.clockIn) {
        throw new AppError('Already clocked in today.', 400);
      }

      if (existingRecord) {
        const updatedRecord = await AbsensiRepository.update(existingRecord.id, {
          employeeName,
          clockIn: currentTime,
          status: getAttendanceStatus(currentTime, existingRecord.status),
          workDuration: calculateWorkDuration(today, currentTime, existingRecord.clockOut)
        });

        if (!updatedRecord) {
          throw new AppError('Attendance record not found', 404);
        }

        return updatedRecord;
      }

      return await AbsensiRepository.create({
        employeeId,
        employeeName,
        date: today,
        clockIn: currentTime,
        clockOut: null,
        status: getAttendanceStatus(currentTime),
        workDuration: null
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(`Error processing clock-in: ${error.message}`, 500);
    }
  }

  static async clockOut(employeeId: string) {
    const normalizedEmployeeId = employeeId?.trim();

    if (!normalizedEmployeeId) {
      throw new AppError('Employee ID is required', 400);
    }

    try {
      const now = new Date();
      const today = formatLocalDate(now);
      const currentTime = formatLocalTime(now);
      const activeRecord = await AbsensiRepository.findActiveClockInByDate(normalizedEmployeeId, today);

      if (!activeRecord) {
        throw new AppError('No active clock-in record found for today.', 404);
      }

      await AbsensiRepository.update(activeRecord.id, {
        clockOut: currentTime,
        workDuration: calculateWorkDuration(today, activeRecord.clockIn, currentTime)
      });

      return { message: 'Clock out successful' };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(`Error processing clock-out: ${error.message}`, 500);
    }
  }

  static async getAttendanceByEmployeeId(employeeId: string, filters: Omit<AbsensiFilters, 'employeeId'> = {}) {
    try {
      return await AbsensiRepository.findByEmployeeId(employeeId, filters);
    } catch (error: any) {
      throw new AppError(`Error retrieving attendance records for employee: ${error.message}`, 500);
    }
  }

  static async createAttendanceRecord(attendanceData: AbsensiCreatePayload) {
    if (!attendanceData.employeeId || !attendanceData.employeeName || !attendanceData.date) {
      throw new AppError('employeeId, employeeName, and date are required', 400);
    }

    try {
      const normalizedPayload = normalizeAttendancePayload(attendanceData);
      return await AbsensiRepository.create({
        ...attendanceData,
        ...normalizedPayload
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(`Error creating attendance record: ${error.message}`, 500);
    }
  }

  static async updateAttendanceRecord(id: string, attendanceData: AbsensiUpdatePayload) {
    try {
      const existingRecord = await AbsensiRepository.findById(id);

      if (!existingRecord) {
        throw new AppError('Attendance record not found', 404);
      }

      const normalizedPayload = normalizeAttendancePayload(attendanceData, existingRecord);
      const updatedRecord = await AbsensiRepository.update(id, normalizedPayload);

      if (!updatedRecord) {
        throw new AppError('Attendance record not found', 404);
      }

      return updatedRecord;
    } catch (error: any) {
      if (error instanceof AppError) {
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
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(`Error deleting attendance record: ${error.message}`, 500);
    }
  }

  static async parseAndSaveLog(buffer: Buffer): Promise<MachineLogImportResult> {
    try {
      const parsedLogs = parseMachineLogs(buffer);
      const employees = (await PegawaiRepository.findAll()).filter((employee: any) => Number(employee.isActive ?? 1) === 1);
      let createdCount = 0;
      let updatedCount = 0;
      const skippedEntries: SkippedLogEntry[] = [];

      for (const parsedLog of parsedLogs) {
        const resolvedEmployee = resolveEmployeeFromMachineLog(parsedLog, employees);

        // Skip entries that can't be matched to a real pegawai record
        // to avoid FOREIGN KEY constraint violations
        if (!resolvedEmployee) {
          skippedEntries.push({
            machineEmployeeCode: parsedLog.machineEmployeeCode,
            employeeName: parsedLog.employeeName,
            date: parsedLog.date
          });
          continue;
        }

        const punches = [...parsedLog.punches].sort();
        let clockIn: string | null = punches[0] ?? null;
        let clockOut: string | null = punches.length > 1 ? punches[punches.length - 1] : null;

        if (punches.length === 1 && punches[0] >= '12:00:00') {
          clockIn = null;
          clockOut = punches[0];
        }

        const existingRecord = await AbsensiRepository.findByDate(resolvedEmployee.employeeId, parsedLog.date);

        if (existingRecord) {
          const nextClockIn = clockIn && (!existingRecord.clockIn || clockIn < existingRecord.clockIn)
            ? clockIn
            : existingRecord.clockIn;
          const nextClockOut = clockOut && (!existingRecord.clockOut || clockOut > existingRecord.clockOut)
            ? clockOut
            : existingRecord.clockOut;

          if (nextClockIn !== existingRecord.clockIn || nextClockOut !== existingRecord.clockOut) {
            await AbsensiRepository.update(existingRecord.id, {
              employeeName: resolvedEmployee.employeeName,
              clockIn: nextClockIn,
              clockOut: nextClockOut,
              status: getAttendanceStatus(nextClockIn, existingRecord.status),
              workDuration: calculateWorkDuration(parsedLog.date, nextClockIn, nextClockOut)
            });
            updatedCount += 1;
          }

          continue;
        }

        await AbsensiRepository.create({
          employeeId: resolvedEmployee.employeeId,
          employeeName: resolvedEmployee.employeeName,
          date: parsedLog.date,
          clockIn,
          clockOut,
          status: getAttendanceStatus(clockIn),
          workDuration: calculateWorkDuration(parsedLog.date, clockIn, clockOut)
        });
        createdCount += 1;
      }

      return {
        message: skippedEntries.length > 0
          ? `Log processed with ${skippedEntries.length} unmatched entries skipped`
          : 'Log processed successfully',
        created: createdCount,
        updated: updatedCount,
        skipped: skippedEntries.length,
        skippedEntries
      };
    } catch (error: any) {
      throw new AppError(`Error parsing and saving log: ${error.message}`, 500);
    }
  }
}

export default AbsensiService;
