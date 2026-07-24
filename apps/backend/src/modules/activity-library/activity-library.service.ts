import { JabatanRepository } from '../jabatan/jabatan.repository';
import { AppError } from '../../utils/errors';
import { ActivityLibraryRepository } from './activity-library.repository';
import {
    ActivityLibraryFilters,
    ActivityLibraryItem,
    CreateActivityLibraryPayload,
    UpdateActivityLibraryPayload,
} from './activity-library.types';

const normalizeText = (value: unknown) => String(value ?? '').trim();

const normalizeOptionalText = (value: unknown) => {
    const normalized = normalizeText(value);
    return normalized;
};

const normalizeDuration = (value: unknown) => {
    const duration = Number(value ?? 0);

    if (!Number.isFinite(duration) || duration < 0) {
        throw new AppError('durationMinutes harus berupa angka 0 atau lebih', 400);
    }

    return duration;
};

export default class ActivityLibraryService {
    private static buildPayload(data: Partial<CreateActivityLibraryPayload>): CreateActivityLibraryPayload {
        const payload: CreateActivityLibraryPayload = {
            id: normalizeOptionalText(data.id) || undefined,
            position: normalizeText(data.position),
            department: normalizeOptionalText(data.department),
            activityName: normalizeText(data.activityName),
            durationMinutes: normalizeDuration(data.durationMinutes),
            outputUnit: normalizeOptionalText(data.outputUnit),
            category: normalizeOptionalText(data.category),
        };

        if (!payload.position) {
            throw new AppError('position is required', 400);
        }

        if (!payload.activityName) {
            throw new AppError('activityName is required', 400);
        }

        return payload;
    }

    static async getAll(filters?: ActivityLibraryFilters): Promise<ActivityLibraryItem[]> {
        try {
            const normalizedFilters: ActivityLibraryFilters | undefined = filters
                ? {
                    position: normalizeOptionalText(filters.position) || undefined,
                    department: normalizeOptionalText(filters.department) || undefined,
                    category: normalizeOptionalText(filters.category) || undefined,
                }
                : undefined;

            return await ActivityLibraryRepository.findAll(normalizedFilters);
        } catch (error: unknown) {
            if (error instanceof AppError) throw error;
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new AppError(`Error retrieving activity library: ${message}`, 500);
        }
    }

    static async getByPosition(position: string): Promise<ActivityLibraryItem[]> {
        const normalizedPosition = normalizeText(position);
        if (!normalizedPosition) {
            throw new AppError('position is required', 400);
        }

        try {
            return await ActivityLibraryRepository.findByPosition(normalizedPosition);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new AppError(`Error retrieving activities for position: ${message}`, 500);
        }
    }

    static async getById(id: string): Promise<ActivityLibraryItem> {
        const normalizedId = normalizeText(id);
        if (!normalizedId) {
            throw new AppError('Activity id is required', 400);
        }

        const item = await ActivityLibraryRepository.findById(normalizedId);
        if (!item) {
            throw new AppError('Activity not found', 404);
        }

        return item;
    }

    static async getPositions(): Promise<string[]> {
        try {
            return await ActivityLibraryRepository.getPositions();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new AppError(`Error retrieving positions: ${message}`, 500);
        }
    }

    static async create(data: CreateActivityLibraryPayload): Promise<ActivityLibraryItem> {
        const payload = this.buildPayload(data);

        try {
            if (payload.position === 'Semua Jabatan') {
                const allJabatan = await JabatanRepository.findAll();
                if (allJabatan.length === 0) {
                    throw new AppError('Daftar jabatan belum tersedia', 400);
                }

                let firstCreated: ActivityLibraryItem | null = null;

                for (const jabatan of allJabatan) {
                    const jabatanName = normalizeText(jabatan.nama);
                    const existing = await ActivityLibraryRepository.findExact(jabatanName, payload.activityName);
                    if (existing) continue;

                    const created = await ActivityLibraryRepository.create({
                        ...payload,
                        position: jabatanName,
                        department: normalizeOptionalText(jabatan.department),
                        id: undefined,
                    });

                    if (!firstCreated && created) {
                        firstCreated = created;
                    }
                }

                if (!firstCreated) {
                    throw new AppError('Gagal membuat aktivitas untuk semua jabatan (mungkin karena aktivitas sudah ada di semua jabatan).', 400);
                }

                return firstCreated;
            }

            const existing = await ActivityLibraryRepository.findExact(payload.position, payload.activityName);
            if (existing) {
                throw new AppError(`Aktivitas dengan nama "${payload.activityName}" sudah ada untuk jabatan ini.`, 400);
            }

            const created = await ActivityLibraryRepository.create(payload);
            if (!created) {
                throw new AppError('Failed to create activity', 500);
            }

            return created;
        } catch (error: unknown) {
            if (error instanceof AppError) throw error;
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new AppError(`Error creating activity: ${message}`, 500);
        }
    }

    static async update(id: string, data: UpdateActivityLibraryPayload): Promise<ActivityLibraryItem> {
        const existing = await this.getById(id);
        const payload = this.buildPayload({
            ...existing,
            ...data,
        });

        try {
            const updated = await ActivityLibraryRepository.update(existing.id, payload);
            if (!updated) {
                throw new AppError('Activity not found', 404);
            }

            return updated;
        } catch (error: unknown) {
            if (error instanceof AppError) throw error;
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new AppError(`Error updating activity: ${message}`, 500);
        }
    }

    static async delete(id: string) {
        const existing = await this.getById(id);

        try {
            const deleted = await ActivityLibraryRepository.delete(existing.id);
            if (!deleted) {
                throw new AppError('Activity not found', 404);
            }

            return { message: 'Activity deleted successfully' };
        } catch (error: unknown) {
            if (error instanceof AppError) throw error;
            const message = error instanceof Error ? error.message : 'Unknown error';
            if (message.includes('SQLITE_CONSTRAINT')) {
                await ActivityLibraryRepository.softDelete(existing.id);
                return { message: 'Aktivitas sedang digunakan oleh log WLA. Aktivitas telah dinonaktifkan (disembunyikan) agar tidak bisa dipilih lagi.' };
            }
            throw new AppError(`Error deleting activity: ${message}`, 500);
        }
    }
}
