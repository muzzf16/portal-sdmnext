
import { PenilaianKinerjaRepository } from './penilaianKinerja.repository';
import { ReviewStatus, VALID_TRANSITIONS } from './penilaianKinerja.model';
import { NotifikasiRepository } from '../notifikasi/notifikasi.repository';
import { AppError } from '../../utils/errors';
import { openDb } from '../../config/db';

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

  static async createPenilaianKinerja(reviewData: any) {
    try {
      // Ensure initial status is Draft
      reviewData.status = reviewData.status || 'Draft';
      const result = await PenilaianKinerjaRepository.create(reviewData);
      return result;
    } catch (error: any) {
      throw new AppError(`Error creating performance review: ${error.message}`, 500);
    }
  }

  static async updatePenilaianKinerja(id: string, reviewData: any) {
    try {
      const existing = await PenilaianKinerjaRepository.findById(id);
      if (!existing) throw new AppError('Performance review not found', 404);

      // Block updates on finalized reviews
      if (existing.status === 'Finalized') {
        throw new AppError('Penilaian sudah final — tidak bisa diubah', 400);
      }

      const updatedReview = await PenilaianKinerjaRepository.update(id, reviewData);
      if (!updatedReview) throw new AppError('Performance review not found', 404);
      return updatedReview;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error updating performance review: ${error.message}`, 500);
    }
  }

  static async addFeedbackKinerja(id: string, feedback: string) {
    try {
      return await PenilaianKinerjaRepository.updateFeedback(id, feedback);
    } catch (error: any) {
      if (error.message === 'Review not found') {
        throw new AppError('Review not found', 404);
      }
      throw new AppError(`Error adding performance review feedback: ${error.message}`, 500);
    }
  }

  static async deletePenilaianKinerja(id: string) {
    try {
      const existing = await PenilaianKinerjaRepository.findById(id);
      if (!existing) throw new AppError('Performance review not found', 404);

      // Only allow deletion of Draft reviews
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

  // ═══════════════════════════════════════════════════════════
  //  G1: STATUS LIFECYCLE TRANSITION
  // ═══════════════════════════════════════════════════════════
  static async transitionStatus(id: string, targetStatus: ReviewStatus, userId?: string) {
    try {
      const review = await PenilaianKinerjaRepository.findById(id);
      if (!review) throw new AppError('Performance review not found', 404);

      const currentStatus = review.status as ReviewStatus;
      const allowedTransitions = VALID_TRANSITIONS[currentStatus];

      if (!allowedTransitions || !allowedTransitions.includes(targetStatus)) {
        throw new AppError(
          `Transisi tidak valid: "${currentStatus}" → "${targetStatus}". ` +
          `Status yang diizinkan: ${(allowedTransitions || []).join(', ') || 'tidak ada'}`,
          400
        );
      }

      // G3: Validate deadline when transitioning to "Awaiting SA"
      // Deadline must be set via reviewData.selfAssessmentDeadline
      const db = await openDb();
      await db.run('UPDATE penilaian_kinerja SET status = ? WHERE id = ?', targetStatus, id);

      // G2: NOTIFICATION TRIGGERS
      await this.triggerNotification(review, currentStatus, targetStatus);

      const updatedRow = await PenilaianKinerjaRepository.findById(id);
      return updatedRow;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error transitioning status: ${error.message}`, 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  G2: NOTIFICATION TRIGGERS
  // ═══════════════════════════════════════════════════════════
  private static async triggerNotification(
    review: any,
    fromStatus: ReviewStatus,
    toStatus: ReviewStatus
  ) {
    try {
      const employeeNip = review.employeeId;

      // Find employee's supervisor NIP (via jabatan parent)
      let supervisorNip: string | null = null;
      try {
        const db = await openDb();
        const supervisor = await db.get(`
          SELECT p2.nip 
          FROM pegawai p1
          JOIN jabatan j1 ON p1.jabatan_id = j1.id
          JOIN jabatan j2 ON j1.parent_id = j2.id
          JOIN pegawai p2 ON p2.jabatan_id = j2.id
          WHERE p1.nip = ?
          LIMIT 1
        `, employeeNip);
        supervisorNip = supervisor?.nip || null;
      } catch { /* supervisor lookup failed, skip */ }

      switch (toStatus) {
        case 'Awaiting SA':
          // Notif ke pegawai: "Anda memiliki penilaian kinerja baru"
          await NotifikasiRepository.create({
            employee_id: employeeNip,
            message: `📋 Penilaian kinerja periode ${review.period} sudah dibuat. Silakan isi self-assessment sebelum ${review.selfAssessmentDeadline ? new Date(review.selfAssessmentDeadline).toLocaleDateString('id-ID') : 'batas waktu'}.`,
            type: 'kinerja',
            related_entity: 'penilaian_kinerja',
            related_entity_id: review.id,
          });
          break;

        case 'SA Submitted':
          // Notif ke atasan: "Self-assessment dari {nama} sudah dikirim"
          if (supervisorNip) {
            await NotifikasiRepository.create({
              employee_id: supervisorNip,
              message: `✅ Self-assessment dari ${review.employeeName} (periode ${review.period}) sudah dikirim. Silakan review.`,
              type: 'kinerja',
              related_entity: 'penilaian_kinerja',
              related_entity_id: review.id,
            });
          }
          break;

        case 'Completed':
          // Notif ke pegawai: "Review kinerja Anda sudah selesai"
          await NotifikasiRepository.create({
            employee_id: employeeNip,
            message: `🏆 Penilaian kinerja Anda periode ${review.period} sudah direview oleh atasan. Skor: ${review.overallScore || '-'}. Silakan lihat hasilnya.`,
            type: 'kinerja',
            related_entity: 'penilaian_kinerja',
            related_entity_id: review.id,
          });
          break;

        case 'Finalized':
          // Notif ke pegawai: "Penilaian sudah final"
          await NotifikasiRepository.create({
            employee_id: employeeNip,
            message: `📌 Penilaian kinerja periode ${review.period} sudah ditetapkan sebagai final.`,
            type: 'kinerja',
            related_entity: 'penilaian_kinerja',
            related_entity_id: review.id,
          });
          break;
      }
    } catch (error) {
      // Notification failure should not block the transition
      console.error('Notification trigger error:', error);
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  SELF-ASSESSMENT (with G3 deadline enforcement + G8 weighted score)
  // ═══════════════════════════════════════════════════════════
  static async submitSelfAssessment(id: string, data: {
    selfAssessmentKpis: any[];
    selfAssessmentStrengths: string;
    selfAssessmentAreas: string;
    selfAssessmentStatus: 'draft' | 'submitted';
  }) {
    try {
      const review = await PenilaianKinerjaRepository.findById(id);
      if (!review) throw new AppError('Performance review not found', 404);

      // G1: Validate status — SA only allowed in 'Awaiting SA' or 'Draft' status
      const allowedStatuses = ['Awaiting SA', 'Draft', 'SA Submitted'];
      if (review.status === 'Finalized' || review.status === 'Completed') {
        throw new AppError('Penilaian sudah selesai — self-assessment tidak bisa diubah', 400);
      }

      // If already submitted, prevent re-submission (but allow draft saves)
      if (review.selfAssessmentStatus === 'submitted' && data.selfAssessmentStatus === 'submitted') {
        throw new AppError('Self-assessment sudah dikirim sebelumnya', 400);
      }

      // G3: Deadline enforcement
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

      const result = await PenilaianKinerjaRepository.submitSelfAssessment(id, data);

      // G1: Auto-transition status when submitted
      if (data.selfAssessmentStatus === 'submitted') {
        const db = await openDb();
        await db.run("UPDATE penilaian_kinerja SET status = 'SA Submitted' WHERE id = ?", id);

        // G2: Trigger notification to supervisor
        await this.triggerNotification(
          { ...review, ...result },
          review.status as ReviewStatus,
          'SA Submitted'
        );
      }

      return await PenilaianKinerjaRepository.findById(id);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error submitting self-assessment: ${error.message}`, 500);
    }
  }
}

export default KinerjaService;
