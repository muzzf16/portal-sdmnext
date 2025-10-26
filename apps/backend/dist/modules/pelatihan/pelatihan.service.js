"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pelatihan_repository_1 = require("./pelatihan.repository");
const errors_1 = require("../../utils/errors");
class PelatihanService {
    static async getPelatihanByEmployeeId(employeeId) {
        try {
            return await pelatihan_repository_1.PelatihanRepository.findByEmployeeId(employeeId);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving pelatihan: ${error.message}`, 500);
        }
    }
    static async addPelatihan(employeeId, pelatihanData) {
        try {
            return await pelatihan_repository_1.PelatihanRepository.create(employeeId, pelatihanData);
        }
        catch (error) {
            throw new errors_1.AppError(`Error adding pelatihan: ${error.message}`, 500);
        }
    }
}
exports.default = PelatihanService;
//# sourceMappingURL=pelatihan.service.js.map