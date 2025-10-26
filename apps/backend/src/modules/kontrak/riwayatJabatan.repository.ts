
// src/modules/kontrak/riwayatJabatan.repository.ts
import { openDb } from '../../config/db';

export const RiwayatJabatanRepository = {
  async findByEmployeeId(employeeId: string) {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM riwayat_jabatan WHERE pegawai_id = ?', employeeId);
    return rows;
  },

  async create(employeeId: string, data: { jabatan_lama: string, jabatan_baru: string, tanggal_perubahan: string }) {
    const db = await openDb();
    const { jabatan_lama, jabatan_baru, tanggal_perubahan } = data;
    await db.run(
      'INSERT INTO riwayat_jabatan (pegawai_id, jabatan_lama, jabatan_baru, tanggal_perubahan) VALUES (?, ?, ?, ?)',
      employeeId, jabatan_lama, jabatan_baru, tanggal_perubahan
    );
    return { message: 'Riwayat jabatan added successfully' };
  }
};
