"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kandidat_repository_1 = require("./kandidat.repository");
const errors_1 = require("../../utils/errors");
class PerekrutanService {
    static async getAllKandidat() {
        try {
            return await kandidat_repository_1.KandidatRepository.findAll();
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving candidates: ${error.message}`, 500);
        }
    }
    static async getKandidatById(id) {
        try {
            const candidate = await kandidat_repository_1.KandidatRepository.findById(id);
            if (!candidate) {
                throw new errors_1.AppError('Candidate not found', 404);
            }
            return candidate;
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving candidate: ${error.message}`, 500);
        }
    }
    static async createKandidat(candidateData) {
        try {
            return await kandidat_repository_1.KandidatRepository.create(candidateData);
        }
        catch (error) {
            throw new errors_1.AppError(`Error creating candidate: ${error.message}`, 500);
        }
    }
    static async updateKandidat(id, candidateData) {
        try {
            return await kandidat_repository_1.KandidatRepository.update(id, candidateData);
        }
        catch (error) {
            throw new errors_1.AppError(`Error updating candidate: ${error.message}`, 500);
        }
    }
    static async deleteKandidat(id) {
        try {
            const deleted = await kandidat_repository_1.KandidatRepository.delete(id);
            if (!deleted) {
                throw new errors_1.AppError('Candidate not found', 404);
            }
            return { message: 'Candidate deleted successfully' };
        }
        catch (error) {
            throw new errors_1.AppError(`Error deleting candidate: ${error.message}`, 500);
        }
    }
}
exports.default = PerekrutanService;
//# sourceMappingURL=perekrutan.service.js.map