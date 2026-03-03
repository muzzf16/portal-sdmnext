"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const absensi_repository_1 = require("./absensi.repository");
const pegawai_repository_1 = require("../pegawai/pegawai.repository");
const errors_1 = require("../../utils/errors");
class AbsensiService {
    static async getAllAttendanceRecords(query) {
        try {
            return await absensi_repository_1.AbsensiRepository.findAll(query);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving attendance records: ${error.message}`, 500);
        }
    }
    static async getAttendanceRecordById(id) {
        try {
            const record = await absensi_repository_1.AbsensiRepository.findById(id);
            if (!record) {
                throw new errors_1.AppError('Attendance record not found', 404);
            }
            return record;
        }
        catch (error) {
            if (error.message === 'Attendance record not found') {
                throw error;
            }
            throw new errors_1.AppError(`Error retrieving attendance record: ${error.message}`, 500);
        }
    }
    static async clockIn(employeeId, employeeName) {
        try {
            return await absensi_repository_1.AbsensiRepository.clockIn(employeeId, employeeName);
        }
        catch (error) {
            if (error.message === 'Already clocked in today.') {
                throw new errors_1.AppError(error.message, 400);
            }
            throw new errors_1.AppError(`Error processing clock-in: ${error.message}`, 500);
        }
    }
    static async clockOut(employeeId) {
        try {
            return await absensi_repository_1.AbsensiRepository.clockOut(employeeId);
        }
        catch (error) {
            if (error.message === 'No active clock-in record found for today.') {
                throw new errors_1.AppError(error.message, 404);
            }
            throw new errors_1.AppError(`Error processing clock-out: ${error.message}`, 500);
        }
    }
    static async getAttendanceByEmployeeId(employeeId) {
        try {
            return await absensi_repository_1.AbsensiRepository.findByEmployeeId(employeeId);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving attendance records for employee: ${error.message}`, 500);
        }
    }
    static async createAttendanceRecord(attendanceData) {
        try {
            return await absensi_repository_1.AbsensiRepository.create(attendanceData);
        }
        catch (error) {
            throw new errors_1.AppError(`Error creating attendance record: ${error.message}`, 500);
        }
    }
    static async updateAttendanceRecord(id, attendanceData) {
        try {
            const updatedRecord = await absensi_repository_1.AbsensiRepository.update(id, attendanceData);
            if (!updatedRecord) {
                throw new errors_1.AppError('Attendance record not found', 404);
            }
            return updatedRecord;
        }
        catch (error) {
            if (error.message === 'Attendance record not found') {
                throw error;
            }
            throw new errors_1.AppError(`Error updating attendance record: ${error.message}`, 500);
        }
    }
    static async deleteAttendanceRecord(id) {
        try {
            const deleted = await absensi_repository_1.AbsensiRepository.delete(id);
            if (!deleted) {
                throw new errors_1.AppError('Attendance record not found', 404);
            }
            return { message: 'Attendance record deleted successfully' };
        }
        catch (error) {
            if (error.message === 'Attendance record not found') {
                throw error;
            }
            throw new errors_1.AppError(`Error deleting attendance record: ${error.message}`, 500);
        }
    }
    static async parseAndSaveLog(buffer) {
        try {
            const content = buffer.toString('utf16le');
            const lines = content.split('\n');
            const records = lines.slice(1).filter(line => line.trim() !== '');
            const attendanceMap = {};
            for (const line of records) {
                const columns = line.split('\t');
                if (columns.length >= 10) {
                    const enNoRaw = columns[2].trim();
                    const enNo = enNoRaw.length > 3 ? enNoRaw.slice(-3) : enNoRaw.padStart(3, '0');
                    const name = columns[3].trim();
                    const dateTimeStr = columns[9].trim();
                    if (!dateTimeStr)
                        continue;
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
                const allEmp = await pegawai_repository_1.PegawaiRepository.findAll();
                let employeeInfo = allEmp.find((emp) => {
                    if (emp.nip && emp.nip.endsWith(enNo))
                        return true;
                    const dbName = emp.name.toLowerCase();
                    const logName = data.employeeName.toLowerCase();
                    return dbName.includes(logName) || logName.includes(dbName);
                });
                const actualEmployeeId = employeeInfo ? employeeInfo.id.toString() : enNo;
                const actualEmployeeName = employeeInfo ? employeeInfo.name : data.employeeName;
                const existingRecord = await absensi_repository_1.AbsensiRepository.findByDate(actualEmployeeId, data.date);
                let finalClockIn = clockIn;
                let finalClockOut = clockOut;
                if (punches.length === 1 && punches[0] >= '12:00:00') {
                    finalClockIn = null;
                    finalClockOut = punches[0];
                }
                if (existingRecord) {
                    const updateData = {};
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
                        await absensi_repository_1.AbsensiRepository.update(existingRecord.id, updateData);
                        updatedCount++;
                    }
                }
                else {
                    const isLate = finalClockIn && finalClockIn > '09:00:00';
                    const newRecord = {
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
                    await absensi_repository_1.AbsensiRepository.create(newRecord);
                    createdCount++;
                }
            }
            return { message: 'Log processed successfully', created: createdCount, updated: updatedCount };
        }
        catch (error) {
            throw new errors_1.AppError(`Error parsing and saving log: ${error.message}`, 500);
        }
    }
}
exports.default = AbsensiService;
//# sourceMappingURL=absensi.service.js.map