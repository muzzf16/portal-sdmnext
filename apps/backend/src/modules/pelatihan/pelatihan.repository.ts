// src/modules/pelatihan/pelatihan.repository.ts
import { openDb } from '../../config/db';

const mapToCamelCase = (row: any) => ({
  id: row.id,
  employeeId: row.pegawai_id,
  pegawai_id: row.pegawai_id,
  trainingName: row.nama_pelatihan,
  nama_pelatihan: row.nama_pelatihan,
  organizer: row.penyelenggara,
  penyelenggara: row.penyelenggara,
  startDate: row.tanggal_mulai,
  tanggal_mulai: row.tanggal_mulai,
  endDate: row.tanggal_selesai,
  tanggal_selesai: row.tanggal_selesai,
  certificate: row.nomor_sertifikat,
  nomor_sertifikat: row.nomor_sertifikat,
  suratJalan: row.surat_jalan,
  surat_jalan: row.surat_jalan,
  sppd: row.surat_jalan,
  suratPenawaran: row.surat_penawaran,
  surat_penawaran: row.surat_penawaran,
  namaPeserta: row.employee_name || row.nama_peserta || '',
  nama_peserta: row.employee_name || row.nama_peserta || '',
});

const ensureColumns = async (db: any) => {
  try {
    await db.run('ALTER TABLE pelatihan ADD COLUMN surat_jalan TEXT');
  } catch (err: any) {
    // Column already exists - ignore
  }
  try {
    await db.run('ALTER TABLE pelatihan ADD COLUMN surat_penawaran TEXT');
  } catch (err: any) {
    // Column already exists - ignore
  }
};

export const PelatihanRepository = {
  async findAll() {
    const db = await openDb();
    await ensureColumns(db);
    const rows = await db.all(`
      SELECT p.*, e.name AS employee_name
      FROM pelatihan p
      LEFT JOIN pegawai e ON p.pegawai_id = e.id
      ORDER BY p.id DESC
    `);
    return rows.map(mapToCamelCase);
  },

  async findByEmployeeId(employeeId: string) {
    const db = await openDb();
    await ensureColumns(db);
    const rows = await db.all(`
      SELECT p.*, e.name AS employee_name
      FROM pelatihan p
      LEFT JOIN pegawai e ON p.pegawai_id = e.id
      WHERE p.pegawai_id = ?
      ORDER BY p.id DESC
    `, employeeId);
    return rows.map(mapToCamelCase);
  },

  async findById(id: string | number) {
    const db = await openDb();
    await ensureColumns(db);
    const row = await db.get(`
      SELECT p.*, e.name AS employee_name
      FROM pelatihan p
      LEFT JOIN pegawai e ON p.pegawai_id = e.id
      WHERE p.id = ?
    `, id);
    return row ? mapToCamelCase(row) : null;
  },

  async create(employeeId: string, data: { nama_pelatihan: string, penyelenggara: string, tanggal_mulai: string, tanggal_selesai: string, nomor_sertifikat?: string, surat_jalan?: string, sppd?: string, surat_penawaran?: string }) {
    const db = await openDb();
    await ensureColumns(db);
    const { nama_pelatihan, penyelenggara, tanggal_mulai, tanggal_selesai, nomor_sertifikat = null, surat_jalan = null, sppd = null, surat_penawaran = null } = data;
    const finalSuratJalan = surat_jalan || sppd || null;
    
    const result = await db.run(
      'INSERT INTO pelatihan (pegawai_id, nama_pelatihan, penyelenggara, tanggal_mulai, tanggal_selesai, nomor_sertifikat, surat_jalan, surat_penawaran) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      employeeId, nama_pelatihan, penyelenggara, tanggal_mulai, tanggal_selesai, nomor_sertifikat, finalSuratJalan, surat_penawaran
    );
    return { id: result.lastID, message: 'Pelatihan added successfully' };
  },

  async update(id: string | number, data: any) {
    const db = await openDb();
    await ensureColumns(db);
    const existing = await db.get('SELECT * FROM pelatihan WHERE id = ?', id);
    if (!existing) {
      throw new Error('Pelatihan not found');
    }

    const pegawai_id = data.pegawai_id || data.employeeId || existing.pegawai_id;
    const nama_pelatihan = data.nama_pelatihan || data.trainingName || existing.nama_pelatihan;
    const penyelenggara = data.penyelenggara || data.organizer || existing.penyelenggara;
    const tanggal_mulai = data.tanggal_mulai || data.startDate || existing.tanggal_mulai;
    const tanggal_selesai = data.tanggal_selesai || data.endDate || existing.tanggal_selesai;
    const nomor_sertifikat = data.nomor_sertifikat !== undefined ? data.nomor_sertifikat : existing.nomor_sertifikat;
    const surat_jalan = data.surat_jalan !== undefined ? data.surat_jalan : (data.sppd !== undefined ? data.sppd : existing.surat_jalan);
    const surat_penawaran = data.surat_penawaran !== undefined ? data.surat_penawaran : existing.surat_penawaran;

    await db.run(
      `UPDATE pelatihan SET 
        pegawai_id = ?, 
        nama_pelatihan = ?, 
        penyelenggara = ?, 
        tanggal_mulai = ?, 
        tanggal_selesai = ?, 
        nomor_sertifikat = ?, 
        surat_jalan = ?, 
        surat_penawaran = ? 
      WHERE id = ?`,
      pegawai_id, nama_pelatihan, penyelenggara, tanggal_mulai, tanggal_selesai, nomor_sertifikat, surat_jalan, surat_penawaran, id
    );

    return { message: 'Pelatihan updated successfully' };
  },

  async delete(id: string | number) {
    const db = await openDb();
    await ensureColumns(db);
    await db.run('DELETE FROM pelatihan WHERE id = ?', id);
    return { message: 'Pelatihan deleted successfully' };
  }
};
