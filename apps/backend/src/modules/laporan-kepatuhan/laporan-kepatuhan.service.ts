import { LaporanKepatuhanRepository } from './laporan-kepatuhan.repository';
import { CreateLaporanKepatuhanPayload, UpdateLaporanKepatuhanPayload, LaporanStatus } from './laporan-kepatuhan.types';
import { AppError } from '../../utils/errors';

export default class LaporanKepatuhanService {
    static async create(payload: CreateLaporanKepatuhanPayload) {
        if (!payload.nama_laporan || !payload.batas_akhir) {
            throw new AppError('Nama laporan dan batas akhir wajib diisi', 400);
        }

        const date = new Date(payload.batas_akhir);
        if (Number.isNaN(date.getTime())) {
            throw new AppError('Format tanggal batas akhir tidak valid', 400);
        }

        return LaporanKepatuhanRepository.create(payload);
    }

    static async getAll(status?: LaporanStatus, employee_id?: string) {
        return LaporanKepatuhanRepository.findAll(status, employee_id);
    }

    static async getById(id: number) {
        const laporan = await LaporanKepatuhanRepository.findById(id);
        if (!laporan) {
            throw new AppError('Laporan tidak ditemukan', 404);
        }
        return laporan;
    }

    static async getByEmployeeId(employee_id: string, status?: LaporanStatus) {
        if (!employee_id) {
            throw new AppError('Employee ID wajib diisi', 400);
        }
        return LaporanKepatuhanRepository.findByEmployeeId(employee_id, status);
    }

    static async update(id: number, payload: UpdateLaporanKepatuhanPayload) {
        const laporan = await LaporanKepatuhanRepository.findById(id);
        if (!laporan) {
            throw new AppError('Laporan tidak ditemukan', 404);
        }

        if (payload.batas_akhir) {
            const date = new Date(payload.batas_akhir);
            if (Number.isNaN(date.getTime())) {
                throw new AppError('Format tanggal batas akhir tidak valid', 400);
            }
        }

        // If status changes to completed, set tanggal_diselesaikan to now if not provided
        if (payload.status === 'completed' && laporan.status !== 'completed' && !payload.tanggal_diselesaikan) {
            payload.tanggal_diselesaikan = new Date().toISOString();
        }

        return LaporanKepatuhanRepository.update(id, payload);
    }

    static async delete(id: number) {
        const laporan = await LaporanKepatuhanRepository.findById(id);
        if (!laporan) {
            throw new AppError('Laporan tidak ditemukan', 404);
        }
        return LaporanKepatuhanRepository.delete(id);
    }
}
