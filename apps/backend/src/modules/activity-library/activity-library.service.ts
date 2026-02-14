import { ActivityLibraryRepository } from './activity-library.repository';
import { AppError } from '../../utils/errors';

export default class ActivityLibraryService {

    static async getAll(filters?: { position?: string; department?: string; category?: string }) {
        try {
            return await ActivityLibraryRepository.findAll(filters);
        } catch (error: any) {
            throw new AppError(`Error retrieving activity library: ${error.message}`, 500);
        }
    }

    static async getByPosition(position: string) {
        try {
            return await ActivityLibraryRepository.findByPosition(position);
        } catch (error: any) {
            throw new AppError(`Error retrieving activities for position: ${error.message}`, 500);
        }
    }

    static async getById(id: string) {
        const item = await ActivityLibraryRepository.findById(id);
        if (!item) throw new AppError('Activity not found', 404);
        return item;
    }

    static async getPositions() {
        try {
            const rows = await ActivityLibraryRepository.getPositions();
            return rows.map((r: any) => r.position);
        } catch (error: any) {
            throw new AppError(`Error retrieving positions: ${error.message}`, 500);
        }
    }

    static async create(data: any) {
        if (!data.activityName || !data.position) {
            throw new AppError('activityName and position are required', 400);
        }
        try {
            return await ActivityLibraryRepository.create(data);
        } catch (error: any) {
            throw new AppError(`Error creating activity: ${error.message}`, 500);
        }
    }

    static async update(id: string, data: any) {
        try {
            const updated = await ActivityLibraryRepository.update(id, data);
            if (!updated) throw new AppError('Activity not found', 404);
            return updated;
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(`Error updating activity: ${error.message}`, 500);
        }
    }

    static async delete(id: string) {
        try {
            const deleted = await ActivityLibraryRepository.delete(id);
            if (!deleted) throw new AppError('Activity not found', 404);
            return { message: 'Activity deleted successfully' };
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(`Error deleting activity: ${error.message}`, 500);
        }
    }
}
