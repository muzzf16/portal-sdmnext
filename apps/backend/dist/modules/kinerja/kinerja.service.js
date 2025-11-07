"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const penilaianKinerja_repository_1 = require("./penilaianKinerja.repository");
const errors_1 = require("../../utils/errors");
class KinerjaService {
    static async getAllPenilaianKinerja() {
        try {
            return await penilaianKinerja_repository_1.PenilaianKinerjaRepository.findAll();
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
            if (error.message === 'Performance review not found') {
                throw error;
            }
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
            return await penilaianKinerja_repository_1.PenilaianKinerjaRepository.create(reviewData);
        }
        catch (error) {
            throw new errors_1.AppError(`Error creating performance review: ${error.message}`, 500);
        }
    }
    static async updatePenilaianKinerja(id, reviewData) {
        try {
            const updatedReview = await penilaianKinerja_repository_1.PenilaianKinerjaRepository.update(id, reviewData);
            if (!updatedReview) {
                throw new errors_1.AppError('Performance review not found', 404);
            }
            return updatedReview;
        }
        catch (error) {
            if (error.message === 'Performance review not found') {
                throw error;
            }
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
            const deleted = await penilaianKinerja_repository_1.PenilaianKinerjaRepository.delete(id);
            if (!deleted) {
                throw new errors_1.AppError('Performance review not found', 404);
            }
            return { message: 'Performance review deleted successfully' };
        }
        catch (error) {
            if (error.message === 'Performance review not found') {
                throw error;
            }
            throw new errors_1.AppError(`Error deleting performance review: ${error.message}`, 500);
        }
    }
}
exports.default = KinerjaService;
//# sourceMappingURL=kinerja.service.js.map