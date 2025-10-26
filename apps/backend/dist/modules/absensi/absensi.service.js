"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const absensi_repository_1 = require("./absensi.repository");
const errors_1 = require("../../utils/errors");
class AbsensiService {
    static async getAllAttendanceRecords() {
        try {
            return await absensi_repository_1.AbsensiRepository.findAll();
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
}
exports.default = AbsensiService;
//# sourceMappingURL=absensi.service.js.map