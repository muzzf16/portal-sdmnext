import { JabatanRepository } from './jabatan.repository';
import { AppError } from '../../utils/errors';

class JabatanService {
    static async getAll() {
        try {
            return await JabatanRepository.findAll();
        } catch (error: any) {
            throw new AppError(`Error mengambil data jabatan: ${error.message}`, 500);
        }
    }

    static async getById(id: number) {
        try {
            const jabatan = await JabatanRepository.findById(id);
            if (!jabatan) throw new AppError('Jabatan tidak ditemukan', 404);
            return jabatan;
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(`Error mengambil data jabatan: ${error.message}`, 500);
        }
    }

    static async getByLevel(level: number) {
        try {
            return await JabatanRepository.findByLevel(level);
        } catch (error: any) {
            throw new AppError(`Error mengambil jabatan per level: ${error.message}`, 500);
        }
    }

    static async getTree() {
        try {
            return await JabatanRepository.getTree();
        } catch (error: any) {
            throw new AppError(`Error mengambil hierarki jabatan: ${error.message}`, 500);
        }
    }

    static async getTreeWithEmployees() {
        try {
            return await JabatanRepository.getTreeWithEmployees();
        } catch (error: any) {
            throw new AppError(`Error mengambil struktur organisasi: ${error.message}`, 500);
        }
    }

    static async getSubordinates(pegawaiId: string) {
        try {
            return await JabatanRepository.getSubordinates(pegawaiId);
        } catch (error: any) {
            throw new AppError(`Error mengambil data bawahan: ${error.message}`, 500);
        }
    }

    static async getAllSubordinates(pegawaiId: string) {
        try {
            return await JabatanRepository.getAllSubordinates(pegawaiId);
        } catch (error: any) {
            throw new AppError(`Error mengambil data bawahan: ${error.message}`, 500);
        }
    }

    static async create(data: any) {
        try {
            if (!data.nama || data.nama.trim().length < 2) {
                throw new AppError('Nama jabatan harus minimal 2 karakter', 400);
            }
            if (!data.level || data.level < 1 || data.level > 10) {
                throw new AppError('Level jabatan harus antara 1-10', 400);
            }
            // Verify parent exists if provided
            if (data.parent_id) {
                const parent = await JabatanRepository.findById(data.parent_id);
                if (!parent) throw new AppError('Jabatan induk tidak ditemukan', 404);
                if (parent.level >= data.level) {
                    throw new AppError('Level jabatan harus lebih tinggi (angka lebih besar) dari jabatan induk', 400);
                }
            }
            return await JabatanRepository.create(data);
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(`Error membuat jabatan: ${error.message}`, 500);
        }
    }

    static async update(id: number, data: any) {
        try {
            const existing = await JabatanRepository.findById(id);
            if (!existing) throw new AppError('Jabatan tidak ditemukan', 404);

            if (data.nama !== undefined && data.nama.trim().length < 2) {
                throw new AppError('Nama jabatan harus minimal 2 karakter', 400);
            }
            // Prevent circular reference
            if (data.parent_id === id) {
                throw new AppError('Jabatan tidak bisa menjadi induk dari dirinya sendiri', 400);
            }

            return await JabatanRepository.update(id, data);
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(`Error mengupdate jabatan: ${error.message}`, 500);
        }
    }

    static async delete(id: number) {
        try {
            const existing = await JabatanRepository.findById(id);
            if (!existing) throw new AppError('Jabatan tidak ditemukan', 404);

            const deleted = await JabatanRepository.delete(id);
            if (!deleted) throw new AppError('Gagal menghapus jabatan', 500);
            return { message: 'Jabatan berhasil dihapus' };
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(`Error menghapus jabatan: ${error.message}`, 500);
        }
    }
}

export default JabatanService;
