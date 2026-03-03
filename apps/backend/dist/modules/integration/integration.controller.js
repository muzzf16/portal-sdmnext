"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActivityLogFromIntegration = exports.createAttendanceFromIntegration = exports.getLeavesForIntegration = exports.getAttendancesForIntegration = exports.getEmployeesForIntegration = void 0;
const integration_service_1 = require("./integration.service");
const getEmployeesForIntegration = async (req, res) => {
    try {
        const employees = await integration_service_1.IntegrationService.getEmployees();
        return res.status(200).json({
            success: true,
            data: employees,
            meta: {
                total: employees.length,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Error fetching employees for integration:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while fetching integration data',
            error: error.message
        });
    }
};
exports.getEmployeesForIntegration = getEmployeesForIntegration;
const getAttendancesForIntegration = async (req, res) => {
    try {
        const { startDate, endDate, employeeId } = req.query;
        const attendances = await integration_service_1.IntegrationService.getAttendances({
            startDate: startDate,
            endDate: endDate,
            employeeId: employeeId
        });
        return res.status(200).json({
            success: true,
            data: attendances,
            meta: {
                total: attendances.length,
                timestamp: new Date().toISOString(),
                params: { startDate, endDate, employeeId }
            }
        });
    }
    catch (error) {
        console.error('Error fetching attendances for integration:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while fetching integration attendance data',
            error: error.message
        });
    }
};
exports.getAttendancesForIntegration = getAttendancesForIntegration;
const getLeavesForIntegration = async (req, res) => {
    try {
        const { startDate, endDate, employeeId, status } = req.query;
        const leaves = await integration_service_1.IntegrationService.getLeaves({
            startDate: startDate,
            endDate: endDate,
            employeeId: employeeId,
            status: status
        });
        return res.status(200).json({
            success: true,
            data: leaves,
            meta: {
                total: leaves.length,
                timestamp: new Date().toISOString(),
                params: { startDate, endDate, employeeId, status }
            }
        });
    }
    catch (error) {
        console.error('Error fetching leaves for integration:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while fetching integration leave data',
            error: error.message
        });
    }
};
exports.getLeavesForIntegration = getLeavesForIntegration;
const createAttendanceFromIntegration = async (req, res) => {
    try {
        const { nip, date, clock_in, clock_out, status, notes } = req.body;
        if (!nip || !date || !clock_in) {
            return res.status(400).json({
                success: false,
                message: 'Bad Request: nip, date, and clock_in are required fields'
            });
        }
        const result = await integration_service_1.IntegrationService.insertInboundAttendance({
            nip,
            date,
            clockIn: clock_in,
            clockOut: clock_out,
            status,
            notes
        });
        return res.status(200).json({
            success: true,
            message: `Attendance record successfully processed (${result.action})`,
            data: result
        });
    }
    catch (error) {
        console.error('Error creating inbound attendance:', error);
        if (error.message && error.message.includes('tidak ditemukan')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error while processing inbound attendance',
            error: error.message
        });
    }
};
exports.createAttendanceFromIntegration = createAttendanceFromIntegration;
const createActivityLogFromIntegration = async (req, res) => {
    try {
        const { nip, date, activity_name, duration_minutes, notes } = req.body;
        if (!nip || !date || !activity_name || duration_minutes === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Bad Request: nip, date, activity_name, and duration_minutes are required fields'
            });
        }
        const result = await integration_service_1.IntegrationService.insertInboundDailyActivity({
            nip,
            date,
            activityName: activity_name,
            durationMinutes: Number(duration_minutes),
            notes
        });
        return res.status(200).json({
            success: true,
            message: 'Daily activity log successfully processed',
            data: result
        });
    }
    catch (error) {
        console.error('Error creating inbound activity log:', error);
        if (error.message && error.message.includes('tidak ditemukan')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error while processing inbound activity log',
            error: error.message
        });
    }
};
exports.createActivityLogFromIntegration = createActivityLogFromIntegration;
//# sourceMappingURL=integration.controller.js.map