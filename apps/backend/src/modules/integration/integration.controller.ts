import { Request, Response } from 'express';
import { IntegrationService } from './integration.service';

/**
 * Controller untuk menangani endpoint integrasi pegawai
 */
export const getEmployeesForIntegration = async (req: Request, res: Response) => {
    try {
        const employees = await IntegrationService.getEmployees();

        return res.status(200).json({
            success: true,
            data: employees,
            meta: {
                total: employees.length,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error: any) {
        console.error('Error fetching employees for integration:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while fetching integration data',
            error: error.message
        });
    }
};

/**
 * Controller untuk menangani endpoint integrasi absensi
 */
export const getAttendancesForIntegration = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, employeeId } = req.query;

        const attendances = await IntegrationService.getAttendances({
            startDate: startDate as string,
            endDate: endDate as string,
            employeeId: employeeId as string
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
    } catch (error: any) {
        console.error('Error fetching attendances for integration:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while fetching integration attendance data',
            error: error.message
        });
    }
};

/**
 * Controller untuk menangani endpoint integrasi cuti
 */
export const getLeavesForIntegration = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, employeeId, status } = req.query;

        const leaves = await IntegrationService.getLeaves({
            startDate: startDate as string,
            endDate: endDate as string,
            employeeId: employeeId as string,
            status: status as string
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
    } catch (error: any) {
        console.error('Error fetching leaves for integration:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while fetching integration leave data',
            error: error.message
        });
    }
};

/**
 * Controller untuk menerima dan menyimpan data absensi dari aplikasi eksternal (Inbound)
 */
export const createAttendanceFromIntegration = async (req: Request, res: Response) => {
    try {
        const { nip, date, clock_in, clock_out, status, notes } = req.body;

        if (!nip || !date || !clock_in) {
            return res.status(400).json({
                success: false,
                message: 'Bad Request: nip, date, and clock_in are required fields'
            });
        }

        const result = await IntegrationService.insertInboundAttendance({
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

    } catch (error: any) {
        console.error('Error creating inbound attendance:', error);

        // Cek jika error karena NIP tidak ditemukan
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

/**
 * Controller untuk menerima dan menyimpan log aktivitas harian dari aplikasi eksternal (Inbound)
 */
export const createActivityLogFromIntegration = async (req: Request, res: Response) => {
    try {
        const { nip, date, activity_name, duration_minutes, notes } = req.body;

        if (!nip || !date || !activity_name || duration_minutes === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Bad Request: nip, date, activity_name, and duration_minutes are required fields'
            });
        }

        const result = await IntegrationService.insertInboundDailyActivity({
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

    } catch (error: any) {
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
