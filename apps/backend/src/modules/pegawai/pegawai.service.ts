import { PegawaiRepository } from './pegawai.repository';
import { AppError } from '../../utils/errors';
import { PenggunaRepository } from '../pengguna/pengguna.repository';
import { JabatanRepository } from '../jabatan/jabatan.repository';
import { openDb, withTransaction } from '../../config/db';

class PegawaiService {
  static async getAllPegawai(options?: { includeDirectors?: boolean }) {
    try {
      return await PegawaiRepository.findAll(options);
    } catch (error: any) {
      throw new AppError(`Error retrieving employees: ${error.message}`, 500);
    }
  }

  static async getPegawaiById(id: string) {
    try {
      const pegawai = await PegawaiRepository.findById(id);
      if (!pegawai) {
        throw new AppError('Employee not found', 404);
      }
      return pegawai;
    } catch (error: any) {
      if (error.message === 'Employee not found') {
        throw error;
      }
      throw new AppError(`Error retrieving employee: ${error.message}`, 500);
    }
  }

  // === Input Validation ===
  private static validatePegawaiData(data: any, isUpdate = false) {
    const errors: string[] = [];

    if (!isUpdate) {
      // Required fields for create
      if (!data.name || data.name.trim().length < 2) {
        errors.push('Nama harus minimal 2 karakter');
      }
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Format email tidak valid');
      }
    } else {
      // Optional but validated if present
      if (data.name !== undefined && data.name.trim().length < 2) {
        errors.push('Nama harus minimal 2 karakter');
      }
      if (data.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Format email tidak valid');
      }
    }

    if (data.jenis_kelamin && !['L', 'P'].includes(data.jenis_kelamin)) {
      errors.push('Jenis kelamin harus L (Laki-laki) atau P (Perempuan)');
    }

    if (data.phone && !/^[0-9+\-\s()]*$/.test(data.phone)) {
      errors.push('Format nomor telepon tidak valid');
    }

    if (data.dob && !/^\d{4}-\d{2}-\d{2}$/.test(data.dob)) {
      errors.push('Format tanggal lahir harus YYYY-MM-DD');
    }

    if (data.joinDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.joinDate)) {
      errors.push('Format tanggal masuk harus YYYY-MM-DD');
    }

    if (errors.length > 0) {
      throw new AppError(errors.join('; '), 400);
    }
  }

  // Resolve jabatan → auto-fill position & department
  private static async resolveJabatanFields(data: any): Promise<any> {
    if (data.jabatan_id) {
      const jabatan = await JabatanRepository.findById(Number(data.jabatan_id));
      if (jabatan) {
        data.position = jabatan.nama;
        data.department = jabatan.department || data.department;
      }
    }
    return data;
  }

  static async createPegawai(name: string, email: string, pegawaiData: any) {
    try {
      // Validate input
      PegawaiService.validatePegawaiData({ ...pegawaiData, name, email });

      // Check email uniqueness
      const existingByEmail = await PegawaiRepository.findByEmail(email);
      if (existingByEmail) {
        throw new AppError('Email sudah terdaftar', 400);
      }

      // Check NIP uniqueness if provided
      if (pegawaiData.nip) {
        const existingByNip = await PegawaiRepository.findByNip(pegawaiData.nip);
        if (existingByNip) {
          throw new AppError('NIP sudah terdaftar', 400);
        }
      }

      // Auto-sync position/department from jabatan if jabatan_id provided
      const enrichedData = await PegawaiService.resolveJabatanFields({ ...pegawaiData, name, email });

      const newPegawai = await PegawaiRepository.create(enrichedData);

      return newPegawai;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error creating employee: ${error.message}`, 500);
    }
  }

  static async updatePegawai(id: string, name: string, email: string, pegawaiData: any) {
    try {
      // Validate input
      PegawaiService.validatePegawaiData({ ...pegawaiData, name, email }, true);

      // Check if employee exists
      const existing = await PegawaiRepository.findById(id);
      if (!existing) {
        throw new AppError('Pegawai tidak ditemukan', 404);
      }

      // Check email uniqueness if email changed
      if (email && email !== existing.email) {
        const existingByEmail = await PegawaiRepository.findByEmail(email);
        if (existingByEmail && existingByEmail.id !== id) {
          throw new AppError('Email sudah digunakan pegawai lain', 400);
        }
      }

      // Auto-sync position/department from jabatan if jabatan_id provided
      const enrichedData = await PegawaiService.resolveJabatanFields({ ...pegawaiData, name, email });

      // Update employee data
      const updatedPegawai = await PegawaiRepository.update(id, enrichedData);

      // Sync user data if name or email changed
      try {
        const db = await openDb();
        const linkedUser = await db.get('SELECT * FROM pengguna WHERE employeeId = ?', id);
        if (linkedUser) {
          const syncData: any = {};
          if (name) syncData.name = name;
          if (email) syncData.email = email;
          if (Object.keys(syncData).length > 0) {
            await PenggunaRepository.update(linkedUser.id, syncData);
          }
        }
      } catch (syncError: any) {
        console.error('Warning: Failed to sync user data:', syncError.message);
        // Don't fail the main operation if user sync fails
      }

      return updatedPegawai;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error updating employee: ${error.message}`, 500);
    }
  }

  static async deletePegawai(id: string) {
    try {
      const existing = await PegawaiRepository.findById(id);
      if (!existing) {
        throw new AppError('Pegawai tidak ditemukan', 404);
      }

      return await withTransaction(async (db) => {
        await db.run('UPDATE pegawai SET atasan_id = NULL WHERE atasan_id = ?', id);

        const linkedUsers = await db.all('SELECT id FROM pengguna WHERE employeeId = ?', id);
        for (const user of linkedUsers) {
          await db.run('DELETE FROM pengguna WHERE id = ?', user.id);
        }

        if (existing.nip) {
          await db.run('DELETE FROM users WHERE employeeId = ?', existing.nip);
        }
        await db.run('DELETE FROM users WHERE employeeId = ?', id);

        await db.run('DELETE FROM absensi WHERE employeeId = ?', id);
        await db.run('DELETE FROM penggajian WHERE employeeId = ?', id);
        await db.run('DELETE FROM kontrak WHERE employeeId = ?', id);
        await db.run('DELETE FROM penilaian_kinerja WHERE employeeId = ?', id);
        await db.run('DELETE FROM permintaan_cuti WHERE employeeId = ?', id);
        await db.run('DELETE FROM pelatihan WHERE pegawai_id = ?', id);
        await db.run('DELETE FROM riwayat_jabatan WHERE pegawai_id = ?', id);
        await db.run('DELETE FROM tugas_orientasi WHERE employee_id = ?', id);
        await db.run('DELETE FROM notifications WHERE employee_id = ?', id);
        await db.run('DELETE FROM pinjaman_karyawan WHERE id_pegawai = ?', id);
        await db.run('DELETE FROM data_change_requests WHERE employeeId = ?', id);
        await db.run('DELETE FROM analisis_beban_kerja WHERE employeeId = ?', id);
        await db.run('DELETE FROM kpi_targets WHERE id_pegawai = ?', id);
        await db.run('DELETE FROM daily_activities WHERE id_pegawai = ?', id);
        await db.run('DELETE FROM department_kpi WHERE employeeId = ?', id);
        await db.run('DELETE FROM organizational_kpi WHERE employeeId = ?', id);
        await db.run('DELETE FROM assigned_tasks WHERE employeeId = ?', id);

        const result = await db.run('DELETE FROM pegawai WHERE id = ?', id);
        if (!result.changes) {
          throw new AppError('Gagal menghapus pegawai', 500);
        }

        return { message: 'Pegawai dan akun terkait berhasil dihapus' };
      });
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Error deleting employee: ${error.message}`, 500);
    }
  }

  static async updatePegawaiPayrollInfo(id: string, payrollInfo: any) {
    try {
      return await PegawaiRepository.updatePayrollInfo(id, payrollInfo);
    } catch (error: any) {
      if (error.message === 'Employee not found') {
        throw new AppError('Employee not found', 404);
      }
      throw new AppError(`Error updating employee payroll info: ${error.message}`, 500);
    }
  }

  static async getGenderDistribution() {
    try {
      return await PegawaiRepository.getGenderDistribution();
    } catch (error: any) {
      throw new AppError(`Error retrieving gender distribution: ${error.message}`, 500);
    }
  }

  static async getEducationDistribution() {
    try {
      return await PegawaiRepository.getEducationDistribution();
    } catch (error: any) {
      throw new AppError(`Error retrieving education distribution: ${error.message}`, 500);
    }
  }

  static async getDepartmentDistribution() {
    try {
      return await PegawaiRepository.getDepartmentDistribution();
    } catch (error: any) {
      throw new AppError(`Error retrieving department distribution: ${error.message}`, 500);
    }
  }
}

export default PegawaiService;