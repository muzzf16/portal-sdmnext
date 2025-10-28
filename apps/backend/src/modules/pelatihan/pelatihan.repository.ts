
// src/modules/pelatihan/pelatihan.repository.ts
import { openDb } from '../../config/db';

const mapToCamelCase = (row: any) => ({
  id: row.id,
  employeeId: row.pegawai_id,
  trainingName: row.nama_pelatihan,
  organizer: row.penyelenggara,
  startDate: row.tanggal_mulai,
  endDate: row.tanggal_selesai,
  certificate: row.nomor_sertifikat,
});

export const PelatihanRepository = {
  async findAll() {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM pelatihan');
    return rows.map(mapToCamelCase);
  },

  async findByEmployeeId(employeeId: string) {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM pelatihan WHERE pegawai_id = ?', employeeId);
    return rows.map(mapToCamelCase);
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
