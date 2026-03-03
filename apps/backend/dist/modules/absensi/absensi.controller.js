"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const absensi_service_1 = __importDefault(require("./absensi.service"));
class AbsensiController {
    static async getAllAttendanceRecords(req, res, next) {
        try {
            const query = req.query;
            const attendanceRecords = await absensi_service_1.default.getAllAttendanceRecords(query);
            res.status(200).json(attendanceRecords);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAttendanceRecordById(req, res, next) {
        try {
            const { id } = req.params;
            const attendanceRecord = await absensi_service_1.default.getAttendanceRecordById(id);
            res.status(200).json(attendanceRecord);
        }
        catch (error) {
            next(error);
        }
    }
    static async clockIn(req, res, next) {
        try {
            const { employeeId, employeeName } = req.body;
            const result = await absensi_service_1.default.clockIn(employeeId, employeeName);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async clockOut(req, res, next) {
        try {
            const { employeeId } = req.body;
            const result = await absensi_service_1.default.clockOut(employeeId);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAttendanceByEmployeeId(req, res, next) {
        try {
            const { id } = req.params;
            const attendanceRecords = await absensi_service_1.default.getAttendanceByEmployeeId(id);
            res.status(200).json(attendanceRecords);
        }
        catch (error) {
            next(error);
        }
    }
    static async createAttendanceRecord(req, res, next) {
        try {
            const attendanceData = req.body;
            const newRecord = await absensi_service_1.default.createAttendanceRecord(attendanceData);
            res.status(201).json(newRecord);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateAttendanceRecord(req, res, next) {
        try {
            const { id } = req.params;
            const attendanceData = req.body;
            const updatedRecord = await absensi_service_1.default.updateAttendanceRecord(id, attendanceData);
            res.status(200).json(updatedRecord);
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteAttendanceRecord(req, res, next) {
        try {
            const { id } = req.params;
            const result = await absensi_service_1.default.deleteAttendanceRecord(id);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async uploadLog(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }
            const result = await absensi_service_1.default.parseAndSaveLog(req.file.buffer);
            return res.status(200).json({ success: true, ...result });
        }
        catch (error) {
            return next(error);
        }
    }
}
exports.default = AbsensiController;
//# sourceMappingURL=absensi.controller.js.map