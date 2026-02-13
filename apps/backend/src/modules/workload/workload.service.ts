
import { WorkloadRepository } from './workload.repository';
import { AppError } from '../../utils/errors';

// Constants for frequency calculation
const DAYS_IN_YEAR = 264; // Effective working days
const WEEKS_IN_YEAR = 52;
const MONTHS_IN_YEAR = 12;

export default class WorkloadService {

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
