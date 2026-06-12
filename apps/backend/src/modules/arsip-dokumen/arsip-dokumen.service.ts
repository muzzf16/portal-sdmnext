// src/modules/arsip-dokumen/arsip-dokumen.service.ts
import { ArsipDokumenRepository } from './arsip-dokumen.repository';
import { ArsipDokumenFilters, CreateArsipDokumenDto, UpdateArsipDokumenDto } from './arsip-dokumen.model';
import { AppError } from '../../utils/errors';

export class ArsipDokumenService {
  static async getAll(filters: ArsipDokumenFilters, userRole?: string) {
    try {
      return await ArsipDokumenRepository.findAll({ ...filters, _userRole: userRole });
    } catch (error: any) {
      throw new AppError(`Gagal mengambil daftar dokumen: ${error.message}`, 500);
    }
  }

  static async getById(id: string, userRole?: string) {
    try {
      const doc = await ArsipDokumenRepository.findById(id, userRole);
      if (!doc) throw new AppError('Dokumen tidak ditemukan', 404);
      return doc;
    } catch (error: any) {
      if (error.statusCode === 404) throw error;
      throw new AppError(`Gagal mengambil dokumen: ${error.message}`, 500);
    }
  }

  static async getStats(userRole?: string) {
    try {
      return await ArsipDokumenRepository.getStats(userRole);
    } catch (error: any) {
      throw new AppError(`Gagal mengambil statistik dokumen: ${error.message}`, 500);
    }
  }

  static async getExpiring(days: number = 30, userRole?: string) {
    try {
      return await ArsipDokumenRepository.findExpiring(days, userRole);
    } catch (error: any) {
      throw new AppError(`Gagal mengambil dokumen yang akan kadaluarsa: ${error.message}`, 500);
    }
  }

  static async create(
    data: CreateArsipDokumenDto & { filePath?: string; ukuranFile?: number; tipeFile?: string },
    uploadedByUserId?: string,
  ) {
    try {
      if (data.nomorDokumen) {
        const existing = await ArsipDokumenRepository.findByNomorDokumen(data.nomorDokumen);
        if (existing) {
          throw new AppError(`Nomor dokumen "${data.nomorDokumen}" sudah digunakan`, 409);
        }
      }

      const payload = {
        ...data,
        uploadedBy: uploadedByUserId ?? data.uploadedBy,
      };

      return await ArsipDokumenRepository.create(payload);
    } catch (error: any) {
      if (error.statusCode === 409) throw error;
      throw new AppError(`Gagal membuat dokumen: ${error.message}`, 500);
    }
  }

  static async update(
    id: string,
    data: UpdateArsipDokumenDto & { filePath?: string; ukuranFile?: number; tipeFile?: string },
  ) {
    try {
      // findById tanpa role restriction untuk operasi write (sudah dijaga di routes oleh restrictTo)
      const existing = await ArsipDokumenRepository.findById(id);
      if (!existing) throw new AppError('Dokumen tidak ditemukan', 404);

      if (data.nomorDokumen && data.nomorDokumen !== existing.nomorDokumen) {
        const conflict = await ArsipDokumenRepository.findByNomorDokumen(data.nomorDokumen, id);
        if (conflict) {
          throw new AppError(`Nomor dokumen "${data.nomorDokumen}" sudah digunakan`, 409);
        }
      }

      const updated = await ArsipDokumenRepository.update(id, data);
      if (!updated) throw new AppError('Gagal memperbarui dokumen', 500);
      return updated;
    } catch (error: any) {
      if (error.statusCode === 404 || error.statusCode === 409) throw error;
      throw new AppError(`Gagal memperbarui dokumen: ${error.message}`, 500);
    }
  }

  static async delete(id: string) {
    try {
      const existing = await ArsipDokumenRepository.findById(id);
      if (!existing) throw new AppError('Dokumen tidak ditemukan', 404);

      const deleted = await ArsipDokumenRepository.delete(id);
      if (!deleted) throw new AppError('Gagal menghapus dokumen', 500);

      return { id, filePath: existing.filePath };
    } catch (error: any) {
      if (error.statusCode === 404) throw error;
      throw new AppError(`Gagal menghapus dokumen: ${error.message}`, 500);
    }
  }
}
