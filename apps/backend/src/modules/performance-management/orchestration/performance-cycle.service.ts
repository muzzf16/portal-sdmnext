import { AppError } from '../../../utils/errors';
import { PegawaiRepository } from '../../pegawai/pegawai.repository';
import { PenilaianKinerjaRepository } from '../../kinerja/penilaianKinerja.repository';
import KinerjaService from '../../kinerja/kinerja.service';
import KpiService from '../../kpi/kpi.service';
import { WorkloadRepository } from '../../workload/workload.repository';
import { PerformanceCycleBatchPayload, PerformanceCycleBatchResult } from './performance-cycle.types';

const normalizeText = (value?: string | null) => value?.trim() || '';

const extractYearFromPeriod = (period: string) => {
  const match = normalizeText(period).match(/^(\d{4})/);
  if (!match) {
    throw new AppError('Format period tidak valid. Gunakan format seperti 2026-S1 atau 2026-Q1', 400);
  }

  return Number(match[1]);
};

const buildDefaultDeadline = () => {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7);
  return deadline.toISOString().split('T')[0];
};

export default class PerformanceCycleService {
  private static async resolveEmployees(employeeIds?: string[]) {
    const allEmployees = await PegawaiRepository.findAll();
    const activeEmployees = allEmployees.filter((employee: any) => employee.isActive === 1 || employee.statusKaryawan === 'aktif');

    if (!employeeIds || employeeIds.length === 0) {
      return activeEmployees;
    }

    const allowedIds = new Set(employeeIds.map((id) => String(id)));
    return activeEmployees.filter((employee: any) => allowedIds.has(String(employee.id)));
  }

  private static buildResult(period: string, details: PerformanceCycleBatchResult['details']): PerformanceCycleBatchResult {
    return {
      period,
      processed: details.length,
      succeeded: details.filter((detail) => detail.status === 'success').length,
      skipped: details.filter((detail) => detail.status === 'skipped').length,
      failed: details.filter((detail) => detail.status === 'failed').length,
      details
    };
  }

  static async openPeriod(payload: PerformanceCycleBatchPayload): Promise<PerformanceCycleBatchResult> {
    const period = normalizeText(payload.period);
    if (!period) {
      throw new AppError('period is required', 400);
    }

    const year = extractYearFromPeriod(period);
    const employees = await this.resolveEmployees(payload.employeeIds);
    const details: PerformanceCycleBatchResult['details'] = [];

    for (const employee of employees) {
      try {
        const analysis = await WorkloadRepository.findAnalysisByEmployeeYear(String(employee.id), year);
        if (!analysis) {
          details.push({
            employeeId: String(employee.id),
            employeeName: employee.name,
            status: 'skipped',
            message: 'ABK belum tersedia untuk tahun ini'
          });
          continue;
        }

        if (analysis.status !== 'approved') {
          details.push({
            employeeId: String(employee.id),
            employeeName: employee.name,
            status: 'skipped',
            message: `ABK belum approved (status: ${analysis.status})`
          });
          continue;
        }

        const existingKpis = await KpiService.getByEmployeePeriod(String(employee.id), period);
        if (existingKpis.length > 0) {
          details.push({
            employeeId: String(employee.id),
            employeeName: employee.name,
            status: 'skipped',
            message: 'KPI periode ini sudah tersedia'
          });
          continue;
        }

        const generated = await KpiService.generateFromAbk(String(employee.id), year, period);
        if ((generated as any)?._isBusinessError) {
          details.push({
            employeeId: String(employee.id),
            employeeName: employee.name,
            status: 'skipped',
            message: (generated as any).message
          });
          continue;
        }

        details.push({
          employeeId: String(employee.id),
          employeeName: employee.name,
          status: 'success',
          message: `Berhasil generate ${(generated as any[]).length} KPI dari ABK`
        });
      } catch (error: any) {
        details.push({
          employeeId: String(employee.id),
          employeeName: employee.name,
          status: 'failed',
          message: error.message || 'Gagal membuka periode'
        });
      }
    }

    return this.buildResult(period, details);
  }

  static async syncApprovedWlaToKpi(payload: PerformanceCycleBatchPayload): Promise<PerformanceCycleBatchResult> {
    const period = normalizeText(payload.period);
    if (!period) {
      throw new AppError('period is required', 400);
    }

    const employees = await this.resolveEmployees(payload.employeeIds);
    const details: PerformanceCycleBatchResult['details'] = [];

    for (const employee of employees) {
      try {
        const kpis = await KpiService.getByEmployeePeriod(String(employee.id), period);
        if (kpis.length === 0) {
          details.push({
            employeeId: String(employee.id),
            employeeName: employee.name,
            status: 'skipped',
            message: 'Tidak ada KPI untuk disinkronkan'
          });
          continue;
        }

        const syncResult = await KpiService.syncRealisasiFromWla(String(employee.id), period);
        details.push({
          employeeId: String(employee.id),
          employeeName: employee.name,
          status: 'success',
          message: `Synced ${syncResult.synced} KPI dari WLA approved`
        });
      } catch (error: any) {
        details.push({
          employeeId: String(employee.id),
          employeeName: employee.name,
          status: 'failed',
          message: error.message || 'Gagal sync WLA ke KPI'
        });
      }
    }

    return this.buildResult(period, details);
  }

  static async createReviewBatch(payload: PerformanceCycleBatchPayload): Promise<PerformanceCycleBatchResult> {
    const period = normalizeText(payload.period);
    if (!period) {
      throw new AppError('period is required', 400);
    }

    const employees = await this.resolveEmployees(payload.employeeIds);
    const details: PerformanceCycleBatchResult['details'] = [];
    const deadline = normalizeText(payload.selfAssessmentDeadline) || buildDefaultDeadline();

    for (const employee of employees) {
      try {
        const existingReviews = await PenilaianKinerjaRepository.findByEmployeeId(String(employee.id));
        const existingReview = existingReviews.find((review) => review.period === period);
        if (existingReview) {
          details.push({
            employeeId: String(employee.id),
            employeeName: employee.name,
            status: 'skipped',
            message: `Review periode ini sudah ada dengan status ${existingReview.status}`
          });
          continue;
        }

        const kpis = await KpiService.getByEmployeePeriod(String(employee.id), period);
        if (kpis.length === 0) {
          details.push({
            employeeId: String(employee.id),
            employeeName: employee.name,
            status: 'skipped',
            message: 'Belum ada KPI final untuk dibuatkan review'
          });
          continue;
        }

        await KinerjaService.createPenilaianKinerja({
          employeeId: String(employee.id),
          employeeName: employee.name,
          period,
          reviewerName: 'Sistem',
          reviewDate: new Date().toISOString().split('T')[0],
          status: 'Awaiting SA',
          kpis: kpis.map((kpi) => ({
            id: kpi.id,
            kpiId: kpi.id,
            name: kpi.kpiName,
            score: kpi.score,
            weight: kpi.weight,
            targetValue: kpi.targetValue,
            actualValue: kpi.actualValue,
            targetUnit: kpi.targetUnit,
            notes: kpi.notes
          })),
          selfAssessmentDeadline: deadline
        });

        details.push({
          employeeId: String(employee.id),
          employeeName: employee.name,
          status: 'success',
          message: 'Review berhasil dibuat dan dikirim ke pegawai'
        });
      } catch (error: any) {
        details.push({
          employeeId: String(employee.id),
          employeeName: employee.name,
          status: 'failed',
          message: error.message || 'Gagal membuat review batch'
        });
      }
    }

    return this.buildResult(period, details);
  }

  static async finalizePeriod(payload: PerformanceCycleBatchPayload): Promise<PerformanceCycleBatchResult> {
    const period = normalizeText(payload.period);
    if (!period) {
      throw new AppError('period is required', 400);
    }

    const employees = await this.resolveEmployees(payload.employeeIds);
    const details: PerformanceCycleBatchResult['details'] = [];

    for (const employee of employees) {
      try {
        const reviews = await PenilaianKinerjaRepository.findByEmployeeId(String(employee.id));
        const review = reviews.find((item) => item.period === period);

        if (!review) {
          details.push({
            employeeId: String(employee.id),
            employeeName: employee.name,
            status: 'skipped',
            message: 'Belum ada review untuk difinalisasi'
          });
          continue;
        }

        if (review.status === 'Finalized') {
          details.push({
            employeeId: String(employee.id),
            employeeName: employee.name,
            status: 'skipped',
            message: 'Review sudah final'
          });
          continue;
        }

        if (review.status !== 'Completed') {
          details.push({
            employeeId: String(employee.id),
            employeeName: employee.name,
            status: 'skipped',
            message: `Review belum siap difinalisasi (status: ${review.status})`
          });
          continue;
        }

        await KinerjaService.transitionStatus(review.id, 'Finalized');
        details.push({
          employeeId: String(employee.id),
          employeeName: employee.name,
          status: 'success',
          message: 'Review berhasil difinalisasi'
        });
      } catch (error: any) {
        details.push({
          employeeId: String(employee.id),
          employeeName: employee.name,
          status: 'failed',
          message: error.message || 'Gagal finalisasi periode'
        });
      }
    }

    return this.buildResult(period, details);
  }
}
