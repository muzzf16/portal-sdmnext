"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const activity_library_repository_1 = require("./activity-library.repository");
const errors_1 = require("../../utils/errors");
class ActivityLibraryService {
    static async getAll(filters) {
        try {
            return await activity_library_repository_1.ActivityLibraryRepository.findAll(filters);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving activity library: ${error.message}`, 500);
        }
    }
    static async getByPosition(position) {
        try {
            return await activity_library_repository_1.ActivityLibraryRepository.findByPosition(position);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving activities for position: ${error.message}`, 500);
        }
    }
    static async getById(id) {
        const item = await activity_library_repository_1.ActivityLibraryRepository.findById(id);
        if (!item)
            throw new errors_1.AppError('Activity not found', 404);
        return item;
    }
    static async getPositions() {
        try {
            const rows = await activity_library_repository_1.ActivityLibraryRepository.getPositions();
            return rows.map((r) => r.position);
        }
        catch (error) {
            throw new errors_1.AppError(`Error retrieving positions: ${error.message}`, 500);
        }
    }
    static async create(data) {
        if (!data.activityName || !data.position) {
            throw new errors_1.AppError('activityName and position are required', 400);
        }
        try {
            return await activity_library_repository_1.ActivityLibraryRepository.create(data);
        }
        catch (error) {
            throw new errors_1.AppError(`Error creating activity: ${error.message}`, 500);
        }
    }
    static async update(id, data) {
        try {
            const updated = await activity_library_repository_1.ActivityLibraryRepository.update(id, data);
            if (!updated)
                throw new errors_1.AppError('Activity not found', 404);
            return updated;
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            throw new errors_1.AppError(`Error updating activity: ${error.message}`, 500);
        }
    }
    static async delete(id) {
        try {
            const deleted = await activity_library_repository_1.ActivityLibraryRepository.delete(id);
            if (!deleted)
                throw new errors_1.AppError('Activity not found', 404);
            return { message: 'Activity deleted successfully' };
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            if (error.message && error.message.includes('SQLITE_CONSTRAINT')) {
                throw new errors_1.AppError('Tidak dapat menghapus aktivitas karena sudah digunakan oleh log pegawai / beban kerja.', 400);
            }
            throw new errors_1.AppError(`Error deleting activity: ${error.message}`, 500);
        }
    }
}
exports.default = ActivityLibraryService;
//# sourceMappingURL=activity-library.service.js.map