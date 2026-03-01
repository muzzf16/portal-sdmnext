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
