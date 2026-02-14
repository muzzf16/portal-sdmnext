
import { WorkloadRepository } from './workload.repository';
import { AppError } from '../../utils/errors';

// Constants for frequency calculation
const DAYS_IN_YEAR = 264; // Effective working days
const WEEKS_IN_YEAR = 52;
const MONTHS_IN_YEAR = 12;
const HOURS_PER_DAY = 8;
const AVAILABLE_YEARLY_MINUTES = DAYS_IN_YEAR * HOURS_PER_DAY * 60; // 126,720

export default class WorkloadService {

    /**
     * Calculate FTE (Full Time Equivalent) percentage
     * FTE = totalYearlyMinutes / availableYearlyMinutes × 100
     */
    static calculateFTE(totalYearlyMinutes: number): {
        ftePercentage: number;
        fteStatus: 'Overload' | 'Normal' | 'Underload';
        hoursPerDay: number;
    } {
        const ftePercentage = parseFloat(((totalYearlyMinutes / AVAILABLE_YEARLY_MINUTES) * 100).toFixed(1));
        const hoursPerDay = parseFloat((totalYearlyMinutes / DAYS_IN_YEAR / 60).toFixed(2));

        let fteStatus: 'Overload' | 'Normal' | 'Underload';
        if (ftePercentage > 100) {
            fteStatus = 'Overload';
        } else if (ftePercentage >= 80) {
            fteStatus = 'Normal';
        } else {
            fteStatus = 'Underload';
        }

        return { ftePercentage, fteStatus, hoursPerDay };
    }

    static calculateTotalMinutes(item: any) {
        return (item.durationMinutes || 0) * (
            (item.freqDaily || 0) * DAYS_IN_YEAR +
            (item.freqWeekly || 0) * WEEKS_IN_YEAR +
            (item.freqMonthly || 0) * MONTHS_IN_YEAR +
            (item.freqQuarterly || 0) * 4 +
            (item.freqSemester || 0) * 2 +
            (item.freqYearly || 0)
        );
    }

    static async getAnalysis(employeeId: string, year: number) {
        const header = await WorkloadRepository.findAnalysisByEmployeeYear(employeeId, year);
        if (!header) return null;
        return await WorkloadRepository.findAnalysisById(header.id);
    }


    static async getAnalysisById(id: string) {
        const analysis = await WorkloadRepository.findAnalysisById(id);
        if (!analysis) throw new AppError('Workload analysis not found', 404);
        return analysis;
    }

    static async saveAnalysis(data: any) {
        // Check if exists
        let analysis = await WorkloadRepository.findAnalysisByEmployeeYear(data.employeeId, data.year);

        let totalYearlyMinutes = 0;
        const itemsWithTotals = data.items.map((item: any) => {
            const total = this.calculateTotalMinutes(item);
            totalYearlyMinutes += total;
            return { ...item, totalMinutes: total };
        });

        if (!analysis) {
            // Create Header
            analysis = await WorkloadRepository.createAnalysis({
                employeeId: data.employeeId,
                year: data.year,
                position: data.position,
                department: data.department,
                totalYearlyMinutes,
                status: data.status || 'draft'
            });
        } else {
            // Update Header
            await WorkloadRepository.updateAnalysisHeader(analysis.id, {
                totalYearlyMinutes,
                status: data.status || analysis.status
            });
        }

        // Replace Items (Full Replacement Strategy for simplicity)
        await WorkloadRepository.clearItems(analysis.id);

        for (const item of itemsWithTotals) {
            await WorkloadRepository.createItem({ ...item, analysisId: analysis.id });
        }

        return await this.getAnalysisById(analysis.id);
    }
}
