"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const penilaianKinerja_repository_1 = require("./penilaianKinerja.repository");
const penilaianKinerja_model_1 = require("./penilaianKinerja.model");
const notifikasi_repository_1 = require("../notifikasi/notifikasi.repository");
const errors_1 = require("../../utils/errors");
const db_1 = require("../../config/db");
class KinerjaService {
    static async getAllPenilaianKinerja(supervisorId) {
        try {
            return await penilaianKinerja_repository_1.PenilaianKinerjaRepository.findAll(supervisorId);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving performance reviews: ${error.message}`, 500);
        }
    }
    static async getPenilaianKinerjaById(id) {
        try {
            const review = await penilaianKinerja_repository_1.PenilaianKinerjaRepository.findById(id);
            if (!review) {
                throw new errors_1.AppError('Performance review not found', 404);
            }
            return review;
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            throw new errors_1.AppError(`Error retrieving performance review: ${error.message}`, 500);
        }
    }
    static async getPenilaianKinerjaByEmployeeId(employeeId) {
        try {
            return await penilaianKinerja_repository_1.PenilaianKinerjaRepository.findByEmployeeId(employeeId);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving performance reviews for employee: ${error.message}`, 500);
        }
    }
    static async createPenilaianKinerja(reviewData) {
        try {
            reviewData.status = reviewData.status || 'Draft';
            const result = await penilaianKinerja_repository_1.PenilaianKinerjaRepository.create(reviewData);
            return result;
        }
        catch (error) {
            throw new errors_1.AppError(`Error creating performance review: ${error.message}`, 500);
        }
    }
    static async updatePenilaianKinerja(id, reviewData) {
        try {
            const existing = await penilaianKinerja_repository_1.PenilaianKinerjaRepository.findById(id);
            if (!existing)
                throw new errors_1.AppError('Performance review not found', 404);
            if (existing.status === 'Finalized') {
                throw new errors_1.AppError('Penilaian sudah final — tidak bisa diubah', 400);
            }
            const updatedReview = await penilaianKinerja_repository_1.PenilaianKinerjaRepository.update(id, reviewData);
            if (!updatedReview)
                throw new errors_1.AppError('Performance review not found', 404);
            return updatedReview;
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            throw new errors_1.AppError(`Error updating performance review: ${error.message}`, 500);
        }
    }
    static async addFeedbackKinerja(id, feedback) {
        try {
            return await penilaianKinerja_repository_1.PenilaianKinerjaRepository.updateFeedback(id, feedback);
        }
        catch (error) {
            if (error.message === 'Review not found') {
                throw new errors_1.AppError('Review not found', 404);
            }
            throw new errors_1.AppError(`Error adding performance review feedback: ${error.message}`, 500);
        }
    }
    static async deletePenilaianKinerja(id) {
        try {
            const existing = await penilaianKinerja_repository_1.PenilaianKinerjaRepository.findById(id);
            if (!existing)
                throw new errors_1.AppError('Performance review not found', 404);
            if (existing.status !== 'Draft') {
                throw new errors_1.AppError('Hanya penilaian berstatus Draft yang bisa dihapus', 400);
            }
            const deleted = await penilaianKinerja_repository_1.PenilaianKinerjaRepository.delete(id);
            if (!deleted)
                throw new errors_1.AppError('Performance review not found', 404);
            return { message: 'Performance review deleted successfully' };
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            throw new errors_1.AppError(`Error deleting performance review: ${error.message}`, 500);
        }
    }
    static async transitionStatus(id, targetStatus, userId) {
        try {
            const review = await penilaianKinerja_repository_1.PenilaianKinerjaRepository.findById(id);
            if (!review)
                throw new errors_1.AppError('Performance review not found', 404);
            const currentStatus = review.status;
            const allowedTransitions = penilaianKinerja_model_1.VALID_TRANSITIONS[currentStatus];
            if (!allowedTransitions || !allowedTransitions.includes(targetStatus)) {
                throw new errors_1.AppError(`Transisi tidak valid: "${currentStatus}" → "${targetStatus}". ` +
                    `Status yang diizinkan: ${(allowedTransitions || []).join(', ') || 'tidak ada'}`, 400);
            }
            const db = await (0, db_1.openDb)();
            await db.run('UPDATE penilaian_kinerja SET status = ? WHERE id = ?', targetStatus, id);
            await this.triggerNotification(review, currentStatus, targetStatus);
            const updatedRow = await penilaianKinerja_repository_1.PenilaianKinerjaRepository.findById(id);
            return updatedRow;
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            throw new errors_1.AppError(`Error transitioning status: ${error.message}`, 500);
        }
    }
    static async triggerNotification(review, fromStatus, toStatus) {
        try {
            const employeeNip = review.employeeId;
            let supervisorNip = null;
            try {
                const db = await (0, db_1.openDb)();
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
            }
            catch { }
            switch (toStatus) {
                case 'Awaiting SA':
                    await notifikasi_repository_1.NotifikasiRepository.create({
                        employee_id: employeeNip,
                        message: `📋 Penilaian kinerja periode ${review.period} sudah dibuat. Silakan isi self-assessment sebelum ${review.selfAssessmentDeadline ? new Date(review.selfAssessmentDeadline).toLocaleDateString('id-ID') : 'batas waktu'}.`,
                        type: 'kinerja',
                        related_entity: 'penilaian_kinerja',
                        related_entity_id: review.id,
                    });
                    break;
                case 'SA Submitted':
                    if (supervisorNip) {
                        await notifikasi_repository_1.NotifikasiRepository.create({
                            employee_id: supervisorNip,
                            message: `✅ Self-assessment dari ${review.employeeName} (periode ${review.period}) sudah dikirim. Silakan review.`,
                            type: 'kinerja',
                            related_entity: 'penilaian_kinerja',
                            related_entity_id: review.id,
                        });
                    }
                    break;
                case 'Completed':
                    await notifikasi_repository_1.NotifikasiRepository.create({
                        employee_id: employeeNip,
                        message: `🏆 Penilaian kinerja Anda periode ${review.period} sudah direview oleh atasan. Skor: ${review.overallScore || '-'}. Silakan lihat hasilnya.`,
                        type: 'kinerja',
                        related_entity: 'penilaian_kinerja',
                        related_entity_id: review.id,
                    });
                    break;
                case 'Finalized':
                    await notifikasi_repository_1.NotifikasiRepository.create({
                        employee_id: employeeNip,
                        message: `📌 Penilaian kinerja periode ${review.period} sudah ditetapkan sebagai final.`,
                        type: 'kinerja',
                        related_entity: 'penilaian_kinerja',
                        related_entity_id: review.id,
                    });
                    break;
            }
        }
        catch (error) {
            console.error('Notification trigger error:', error);
        }
    }
    static async submitSelfAssessment(id, data) {
        try {
            const review = await penilaianKinerja_repository_1.PenilaianKinerjaRepository.findById(id);
            if (!review)
                throw new errors_1.AppError('Performance review not found', 404);
            const allowedStatuses = ['Awaiting SA', 'Draft', 'SA Submitted'];
            if (review.status === 'Finalized' || review.status === 'Completed') {
                throw new errors_1.AppError('Penilaian sudah selesai — self-assessment tidak bisa diubah', 400);
            }
            if (review.selfAssessmentStatus === 'submitted' && data.selfAssessmentStatus === 'submitted') {
                throw new errors_1.AppError('Self-assessment sudah dikirim sebelumnya', 400);
            }
            if (data.selfAssessmentStatus === 'submitted' && review.selfAssessmentDeadline) {
                const deadline = new Date(review.selfAssessmentDeadline);
                const now = new Date();
                if (now > deadline) {
                    throw new errors_1.AppError(`Batas waktu self-assessment sudah lewat (${deadline.toLocaleDateString('id-ID')}). Hubungi HR untuk perpanjangan.`, 400);
                }
            }
            const result = await penilaianKinerja_repository_1.PenilaianKinerjaRepository.submitSelfAssessment(id, data);
            if (data.selfAssessmentStatus === 'submitted') {
                const db = await (0, db_1.openDb)();
                await db.run("UPDATE penilaian_kinerja SET status = 'SA Submitted' WHERE id = ?", id);
                await this.triggerNotification({ ...review, ...result }, review.status, 'SA Submitted');
            }
            return await penilaianKinerja_repository_1.PenilaianKinerjaRepository.findById(id);
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            throw new errors_1.AppError(`Error submitting self-assessment: ${error.message}`, 500);
        }
    }
}
exports.default = KinerjaService;
//# sourceMappingURL=kinerja.service.js.map