import { openDb } from '../../config/db';
import { AppError } from '../../utils/errors';
import { NotifikasiRepository } from '../notifikasi/notifikasi.repository';
import { PenilaianKinerja, ReviewStatus, VALID_TRANSITIONS } from './penilaianKinerja.model';
import { PenilaianKinerjaRepository } from './penilaianKinerja.repository';
import {
  CreatePerformanceReviewPayload,
  PerformanceReviewKpiSnapshot,
  SubmitSelfAssessmentPayload,
  UpdatePerformanceReviewPayload
} from './kinerja.types';

const normalizeText = (value?: string | null) => value?.trim() || '';

const normalizeOptionalText = (value?: string | null) => {
  const normalized = normalizeText(value);
  return normalized || null;
};

const normalizeKpiSnapshot = (kpis?: PerformanceReviewKpiSnapshot[]) =>
  (kpis || []).map((kpi, index) => ({
    id: kpi.id || kpi.kpiId || `snapshot-${Date.now()}-${index}`,
    kpiId: kpi.kpiId || kpi.id,
    name: normalizeText((kpi as any).name || (kpi as any).metric),
    score: Number(kpi.score || 0),
    weight: Number(kpi.weight || 0),
    targetValue: Number(kpi.targetValue || 0),
    actualValue: Number(kpi.actualValue || 0),
    targetUnit: normalizeText(kpi.targetUnit),
    notes: normalizeText(kpi.notes)
  })).filter((kpi) => Boolean(kpi.name));

const buildDefaultSelfAssessmentDeadline = (reviewDate: string) => {
  const baseDate = reviewDate ? new Date(reviewDate) : new Date();
  if (Number.isNaN(baseDate.getTime())) {
    throw new AppError('Tanggal review tidak valid', 400);
  }

  const deadline = new Date(baseDate);
  deadline.setDate(deadline.getDate() + 7);
  return deadline.toISOString().split('T')[0];
};

class KinerjaService {
  static async getAllPenilaianKinerja(supervisorId?: string) {
    try {
      return await PenilaianKinerjaRepository.findAll(supervisorId);
    } catch (error: any) {
      throw new AppError(`Error retrieving performance reviews: ${error.message}`, 500);
    }
  }

  static async getPenilaianKinerjaById(id: string) {
    try {
      const review = await PenilaianKinerjaRepository.findById(id);
      if (!review) {
        throw new AppError('Performance review not found', 404);
      }

      return review;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error retrieving performance review: ${error.message}`, 500);
    }
  }

  static async getPenilaianKinerjaByEmployeeId(employeeId: string) {
    try {
      return await PenilaianKinerjaRepository.findByEmployeeId(employeeId);
    } catch (error: any) {
      throw new AppError(`Error retrieving performance reviews for employee: ${error.message}`, 500);
    }
  }

  static async createPenilaianKinerja(reviewData: CreatePerformanceReviewPayload) {
    try {
      const payload = {
        employeeId: normalizeText(reviewData.employeeId),
        employeeName: normalizeText(reviewData.employeeName),
        period: normalizeText(reviewData.period),
        reviewerName: normalizeText(reviewData.reviewerName),
        reviewDate: normalizeText(reviewData.reviewDate),
        status: (reviewData.status || 'Draft') as ReviewStatus,
        strengths: normalizeText(reviewData.strengths),
        areasForImprovement: normalizeText(reviewData.areasForImprovement),
        employeeFeedback: normalizeText(reviewData.employeeFeedback),
        penilaiId: normalizeOptionalText(reviewData.penilaiId),
        selfAssessmentDeadline: normalizeOptionalText(reviewData.selfAssessmentDeadline),
        kpis: normalizeKpiSnapshot(reviewData.kpis)
      };

      if (!payload.employeeId || !payload.period || !payload.reviewerName || !payload.reviewDate) {
        throw new AppError('employeeId, period, reviewerName, dan reviewDate wajib diisi', 400);
      }

      if (payload.status === 'Awaiting SA' && !payload.selfAssessmentDeadline) {
        payload.selfAssessmentDeadline = buildDefaultSelfAssessmentDeadline(payload.reviewDate);
      }

      const result = await PenilaianKinerjaRepository.create(payload);

      if (payload.status === 'Awaiting SA') {
        await this.triggerNotification(result, 'Draft', 'Awaiting SA');
      }

      return result;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error creating performance review: ${error.message}`, 500);
    }
  }

  static async updatePenilaianKinerja(id: string, reviewData: UpdatePerformanceReviewPayload) {
    try {
      const existing = await PenilaianKinerjaRepository.findById(id);
      if (!existing) {
        throw new AppError('Performance review not found', 404);
      }

      if (existing.status === 'Finalized') {
        throw new AppError('Penilaian sudah final dan tidak bisa diubah', 400);
      }

      const payload: UpdatePerformanceReviewPayload = {
        employeeName: normalizeText(reviewData.employeeName) || existing.employeeName,
        period: normalizeText(reviewData.period) || existing.period,
        reviewerName: normalizeText(reviewData.reviewerName) || existing.reviewerName,
        reviewDate: normalizeText(reviewData.reviewDate) || existing.reviewDate,
        status: (reviewData.status || existing.status) as ReviewStatus,
        strengths: reviewData.strengths !== undefined ? normalizeText(reviewData.strengths) : existing.strengths,
        areasForImprovement: reviewData.areasForImprovement !== undefined
          ? normalizeText(reviewData.areasForImprovement)
          : existing.areasForImprovement,
        employeeFeedback: reviewData.employeeFeedback !== undefined
          ? normalizeText(reviewData.employeeFeedback)
          : existing.employeeFeedback,
        penilaiId: reviewData.penilaiId !== undefined ? normalizeOptionalText(reviewData.penilaiId) : existing.penilaiId,
        selfAssessmentDeadline: reviewData.selfAssessmentDeadline !== undefined
          ? normalizeOptionalText(reviewData.selfAssessmentDeadline)
          : existing.selfAssessmentDeadline,
        kpis: reviewData.kpis ? normalizeKpiSnapshot(reviewData.kpis) : existing.kpis
      };

      return await PenilaianKinerjaRepository.update(id, payload);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error updating performance review: ${error.message}`, 500);
    }
  }

  static async addFeedbackKinerja(id: string, feedback: string) {
    try {
      const review = await PenilaianKinerjaRepository.findById(id);
      if (!review) {
        throw new AppError('Review not found', 404);
      }

      if (review.status === 'Finalized') {
        throw new AppError('Penilaian sudah final dan feedback tidak bisa diubah', 400);
      }

      const updated = await PenilaianKinerjaRepository.updateFeedback(id, normalizeText(feedback));
      if (!updated) {
        throw new AppError('Review not found', 404);
      }

      return updated;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error adding performance review feedback: ${error.message}`, 500);
    }
  }

  static async deletePenilaianKinerja(id: string) {
    try {
      const existing = await PenilaianKinerjaRepository.findById(id);
      if (!existing) throw new AppError('Performance review not found', 404);

      if (existing.status !== 'Draft') {
        throw new AppError('Hanya penilaian berstatus Draft yang bisa dihapus', 400);
      }

      const deleted = await PenilaianKinerjaRepository.delete(id);
      if (!deleted) throw new AppError('Performance review not found', 404);
      return { message: 'Performance review deleted successfully' };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error deleting performance review: ${error.message}`, 500);
    }
  }

  static async transitionStatus(id: string, targetStatus: ReviewStatus, userId?: string, selfAssessmentDeadline?: string | null) {
    try {
      const review = await PenilaianKinerjaRepository.findById(id);
      if (!review) {
        throw new AppError('Performance review not found', 404);
      }

      const currentStatus = review.status as ReviewStatus;
      const allowedTransitions = VALID_TRANSITIONS[currentStatus];

      if (!allowedTransitions || !allowedTransitions.includes(targetStatus)) {
        throw new AppError(
          `Transisi tidak valid: "${currentStatus}" ke "${targetStatus}". Status yang diizinkan: ${(allowedTransitions || []).join(', ') || 'tidak ada'}`,
          400
        );
      }

      const normalizedDeadline = normalizeOptionalText(selfAssessmentDeadline);
      const deadlineForUpdate = targetStatus === 'Awaiting SA'
        ? (normalizedDeadline || review.selfAssessmentDeadline || buildDefaultSelfAssessmentDeadline(review.reviewDate))
        : normalizedDeadline;

      const updatedRow = await PenilaianKinerjaRepository.updateStatus(id, targetStatus, deadlineForUpdate);
      if (!updatedRow) {
        throw new AppError('Performance review not found', 404);
      }

      await this.triggerNotification(
        { ...updatedRow, transitionedBy: userId || null },
        currentStatus,
        targetStatus
      );

      return updatedRow;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error transitioning status: ${error.message}`, 500);
    }
  }

  private static async triggerNotification(
    review: PenilaianKinerja & { transitionedBy?: string | null },
    _fromStatus: ReviewStatus,
    toStatus: ReviewStatus
  ) {
    try {
      const employeeId = review.employeeId;
      let supervisorId: string | null = null;

      try {
        const db = await openDb();
        const supervisor = await db.get(`
          SELECT p2.id
          FROM pegawai p1
          JOIN jabatan j1 ON p1.jabatan_id = j1.id
          JOIN jabatan j2 ON j1.parent_id = j2.id
          JOIN pegawai p2 ON p2.jabatan_id = j2.id
          WHERE p1.id = ?
          LIMIT 1
        `, employeeId);

        supervisorId = supervisor?.id || null;
      } catch {
        supervisorId = null;
      }

      switch (toStatus) {
        case 'Awaiting SA':
          await NotifikasiRepository.create({
            employee_id: employeeId,
            message: `Penilaian kinerja periode ${review.period} sudah dibuat. Silakan isi self-assessment sebelum ${review.selfAssessmentDeadline ? new Date(review.selfAssessmentDeadline).toLocaleDateString('id-ID') : 'batas waktu'}.`,
            type: 'kinerja',
            related_entity: 'penilaian_kinerja',
            related_entity_id: review.id
          });
          break;
        case 'SA Submitted':
          if (supervisorId) {
            await NotifikasiRepository.create({
              employee_id: supervisorId,
              message: `Self-assessment dari ${review.employeeName} untuk periode ${review.period} sudah dikirim.`,
              type: 'kinerja',
              related_entity: 'penilaian_kinerja',
              related_entity_id: review.id
            });
          }
          break;
        case 'Completed':
          await NotifikasiRepository.create({
            employee_id: employeeId,
            message: `Penilaian kinerja periode ${review.period} sudah direview. Skor saat ini: ${review.overallScore || '-'}.`,
            type: 'kinerja',
            related_entity: 'penilaian_kinerja',
            related_entity_id: review.id
          });
          break;
        case 'Finalized':
          await NotifikasiRepository.create({
            employee_id: employeeId,
            message: `Penilaian kinerja periode ${review.period} sudah ditetapkan sebagai final.`,
            type: 'kinerja',
            related_entity: 'penilaian_kinerja',
            related_entity_id: review.id
          });
          break;
      }
    } catch (error) {
      console.error('Notification trigger error:', error);
    }
  }

  static async submitSelfAssessment(id: string, data: SubmitSelfAssessmentPayload) {
    try {
      const review = await PenilaianKinerjaRepository.findById(id);
      if (!review) throw new AppError('Performance review not found', 404);

      if (review.status === 'Finalized' || review.status === 'Completed') {
        throw new AppError('Penilaian sudah selesai dan self-assessment tidak bisa diubah', 400);
      }

      if (review.selfAssessmentStatus === 'submitted' && data.selfAssessmentStatus === 'submitted') {
        throw new AppError('Self-assessment sudah dikirim sebelumnya', 400);
      }

      if (data.selfAssessmentStatus === 'submitted' && review.selfAssessmentDeadline) {
        const deadline = new Date(review.selfAssessmentDeadline);
        const now = new Date();
        if (now > deadline) {
          throw new AppError(
            `Batas waktu self-assessment sudah lewat (${deadline.toLocaleDateString('id-ID')}). Hubungi HR untuk perpanjangan.`,
            400
          );
        }
      }

      await PenilaianKinerjaRepository.submitSelfAssessment(id, data);

      if (data.selfAssessmentStatus === 'submitted') {
        await PenilaianKinerjaRepository.updateStatus(id, 'SA Submitted');
      }

      const updatedReview = await PenilaianKinerjaRepository.findById(id);
      if (!updatedReview) {
        throw new AppError('Performance review not found', 404);
      }

      if (data.selfAssessmentStatus === 'submitted') {
        await this.triggerNotification(updatedReview, review.status as ReviewStatus, 'SA Submitted');
      }

      return updatedReview;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error submitting self-assessment: ${error.message}`, 500);
    }
  }
}

export default KinerjaService;
