
// src/modules/pelatihan/pelatihan.repository.ts
import { openDb } from '../../config/db';

export const PelatihanRepository = {
  async findByEmployeeId(employeeId: string) {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM pelatihan WHERE pegawai_id = ?', employeeId);
    return rows;
  },

  async create(employeeId: string, data: { nama_pelatihan: string, penyelenggara: string, tanggal_mulai: string, tanggal_selesai: string, nomor_sertifikat: string }) {
    const db = await openDb();
    const { nama_pelatihan, penyelenggara, tanggal_mulai, tanggal_selesai, nomor_sertifikat } = data;
    await db.run(
      'INSERT INTO pelatihan (pegawai_id, nama_pelatihan, penyelenggara, tanggal_mulai, tanggal_selesai, nomor_sertifikat) VALUES (?, ?, ?, ?, ?, ?)',
      employeeId, nama_pelatihan, penyelenggara, tanggal_mulai, tanggal_selesai, nomor_sertifikat
    );
    return { message: 'Pelatihan added successfully' };
  }
};
