// src/modules/arsip-dokumen/arsip-dokumen.repository.ts
import { openDb } from '../../config/db';
import { ArsipDokumen, ArsipDokumenFilters, CreateArsipDokumenDto, UpdateArsipDokumenDto, RAHASIA_ALLOWED_ROLES } from './arsip-dokumen.model';

const parseTags = (row: any): ArsipDokumen => {
  if (!row) return row;
  return {
    ...row,
    tags: (() => {
      try {
        return JSON.parse(row.tags || '[]');
      } catch {
        return [];
      }
    })(),
  };
};

const parseRows = (rows: any[]): ArsipDokumen[] => rows.map(parseTags);

/** Apakah role ini boleh melihat dokumen RAHASIA/SANGAT_RAHASIA */
const canViewRahasia = (role?: string): boolean =>
  !!role && (RAHASIA_ALLOWED_ROLES as readonly string[]).includes(role);

export const ArsipDokumenRepository = {
  async findAll(filters: ArsipDokumenFilters = {}) {
    const db = await openDb();
    const {
      kategori,
      status,
      tingkatKerahasiaan,
      search,
      tanggalDari,
      tanggalSampai,
      page = 1,
      limit = 20,
      _userRole,
    } = filters;

    const conditions: string[] = [];
    const params: any[] = [];

    // ── KERAHASIAAN FILTER (server-side enforcement) ──────────────────────
    if (!canViewRahasia(_userRole)) {
      // Employee dan role lain tidak melihat RAHASIA & SANGAT_RAHASIA
      conditions.push("tingkatKerahasiaan NOT IN ('RAHASIA', 'SANGAT_RAHASIA')");
    } else if (tingkatKerahasiaan) {
      // Role berwenang bisa filter spesifik
      conditions.push('tingkatKerahasiaan = ?');
      params.push(tingkatKerahasiaan);
    }

    if (kategori) {
      conditions.push('kategori = ?');
      params.push(kategori);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(judul LIKE ? OR nomorDokumen LIKE ? OR penerbit LIKE ? OR deskripsi LIKE ?)');
      const q = `%${search}%`;
      params.push(q, q, q, q);
    }
    if (tanggalDari) {
      conditions.push('tanggalTerbit >= ?');
      params.push(tanggalDari);
    }
    if (tanggalSampai) {
      conditions.push('tanggalTerbit <= ?');
      params.push(tanggalSampai);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const totalRow = await db.get<{ total: number }>(
      `SELECT COUNT(*) as total FROM arsip_dokumen ${where}`,
      ...params,
    );
    const total = totalRow?.total ?? 0;

    const rows = await db.all(
      `SELECT * FROM arsip_dokumen ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      ...params,
      limit,
      offset,
    );

    return { data: parseRows(rows), total, page, limit };
  },

  async findById(id: string, userRole?: string): Promise<ArsipDokumen | null> {
    const db = await openDb();
    const row = await db.get('SELECT * FROM arsip_dokumen WHERE id = ?', id);
    if (!row) return null;

    // Cegah akses langsung ke dokumen rahasia oleh role tidak berwenang
    if (!canViewRahasia(userRole) &&
        (row.tingkatKerahasiaan === 'RAHASIA' || row.tingkatKerahasiaan === 'SANGAT_RAHASIA')) {
      return null; // Seolah-olah tidak ada
    }

    return parseTags(row);
  },

  async findByKategori(kategori: string, userRole?: string): Promise<ArsipDokumen[]> {
    const db = await openDb();
    const rahasiaClause = !canViewRahasia(userRole)
      ? "AND tingkatKerahasiaan NOT IN ('RAHASIA', 'SANGAT_RAHASIA')"
      : '';
    const rows = await db.all(
      `SELECT * FROM arsip_dokumen WHERE kategori = ? ${rahasiaClause} ORDER BY createdAt DESC`,
      kategori,
    );
    return parseRows(rows);
  },

  async findExpiring(days: number = 30, userRole?: string): Promise<ArsipDokumen[]> {
    const db = await openDb();
    const rahasiaClause = !canViewRahasia(userRole)
      ? "AND tingkatKerahasiaan NOT IN ('RAHASIA', 'SANGAT_RAHASIA')"
      : '';
    const rows = await db.all(
      `SELECT * FROM arsip_dokumen
       WHERE status = 'aktif'
         AND tanggalKadaluarsa IS NOT NULL
         AND tanggalKadaluarsa BETWEEN date('now') AND date('now', '+' || ? || ' days')
         ${rahasiaClause}
       ORDER BY tanggalKadaluarsa ASC`,
      days,
    );
    return parseRows(rows);
  },

  async getStats(userRole?: string) {
    const db = await openDb();
    const rahasiaClause = !canViewRahasia(userRole)
      ? "WHERE tingkatKerahasiaan NOT IN ('RAHASIA', 'SANGAT_RAHASIA')"
      : '';
    const rahasiaAnd = !canViewRahasia(userRole)
      ? "AND tingkatKerahasiaan NOT IN ('RAHASIA', 'SANGAT_RAHASIA')"
      : '';

    const byKategori = await db.all(
      `SELECT kategori, COUNT(*) as jumlah FROM arsip_dokumen ${rahasiaClause} GROUP BY kategori`,
    );
    const byStatus = await db.all(
      `SELECT status, COUNT(*) as jumlah FROM arsip_dokumen ${rahasiaClause} GROUP BY status`,
    );
    const totalExpiring = await db.get<{ jumlah: number }>(
      `SELECT COUNT(*) as jumlah FROM arsip_dokumen
       WHERE status = 'aktif'
         AND tanggalKadaluarsa IS NOT NULL
         AND tanggalKadaluarsa BETWEEN date('now') AND date('now', '+30 days')
         ${rahasiaAnd}`,
    );
    return { byKategori, byStatus, expiringIn30Days: totalExpiring?.jumlah ?? 0 };
  },

  async findByNomorDokumen(nomorDokumen: string, excludeId?: string): Promise<ArsipDokumen | null> {
    const db = await openDb();
    const query = excludeId
      ? 'SELECT * FROM arsip_dokumen WHERE nomorDokumen = ? AND id != ? LIMIT 1'
      : 'SELECT * FROM arsip_dokumen WHERE nomorDokumen = ? LIMIT 1';
    const params = excludeId ? [nomorDokumen, excludeId] : [nomorDokumen];
    const row = await db.get(query, ...params);
    return row ? parseTags(row) : null;
  },

  async create(data: CreateArsipDokumenDto & { filePath?: string; ukuranFile?: number; tipeFile?: string }): Promise<ArsipDokumen> {
    const db = await openDb();
    const id = `arsip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const tags = JSON.stringify(data.tags ?? []);

    await db.run(
      `INSERT INTO arsip_dokumen
        (id, judul, kategori, nomorDokumen, tanggalTerbit, tanggalBerlaku, tanggalKadaluarsa,
         penerbit, deskripsi, filePath, ukuranFile, tipeFile, tags, status,
         tingkatKerahasiaan, uploadedBy, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      data.judul,
      data.kategori,
      data.nomorDokumen ?? null,
      data.tanggalTerbit ?? null,
      data.tanggalBerlaku ?? null,
      data.tanggalKadaluarsa ?? null,
      data.penerbit ?? null,
      data.deskripsi ?? null,
      data.filePath ?? null,
      data.ukuranFile ?? null,
      data.tipeFile ?? null,
      tags,
      data.status ?? 'aktif',
      data.tingkatKerahasiaan ?? 'PUBLIK',
      data.uploadedBy ?? null,
      now,
      now,
    );

    const row = await db.get('SELECT * FROM arsip_dokumen WHERE id = ?', id);
    return parseTags(row);
  },

  async update(id: string, data: UpdateArsipDokumenDto & { filePath?: string; ukuranFile?: number; tipeFile?: string }): Promise<ArsipDokumen | null> {
    const db = await openDb();
    const existing = await db.get('SELECT * FROM arsip_dokumen WHERE id = ?', id);
    if (!existing) return null;

    const now = new Date().toISOString();

    const judul = data.judul ?? existing.judul;
    const kategori = data.kategori ?? existing.kategori;
    const nomorDokumen = data.nomorDokumen !== undefined ? data.nomorDokumen : existing.nomorDokumen;
    const tanggalTerbit = data.tanggalTerbit !== undefined ? data.tanggalTerbit : existing.tanggalTerbit;
    const tanggalBerlaku = data.tanggalBerlaku !== undefined ? data.tanggalBerlaku : existing.tanggalBerlaku;
    const tanggalKadaluarsa = data.tanggalKadaluarsa !== undefined ? data.tanggalKadaluarsa : existing.tanggalKadaluarsa;
    const penerbit = data.penerbit !== undefined ? data.penerbit : existing.penerbit;
    const deskripsi = data.deskripsi !== undefined ? data.deskripsi : existing.deskripsi;
    const filePath = data.filePath !== undefined ? data.filePath : existing.filePath;
    const ukuranFile = data.ukuranFile !== undefined ? data.ukuranFile : existing.ukuranFile;
    const tipeFile = data.tipeFile !== undefined ? data.tipeFile : existing.tipeFile;
    const tags = data.tags !== undefined ? JSON.stringify(data.tags) : existing.tags;
    const status = data.status ?? existing.status;
    const tingkatKerahasiaan = data.tingkatKerahasiaan ?? existing.tingkatKerahasiaan;

    await db.run(
      `UPDATE arsip_dokumen SET
        judul = ?, kategori = ?, nomorDokumen = ?, tanggalTerbit = ?, tanggalBerlaku = ?,
        tanggalKadaluarsa = ?, penerbit = ?, deskripsi = ?, filePath = ?, ukuranFile = ?,
        tipeFile = ?, tags = ?, status = ?, tingkatKerahasiaan = ?, updatedAt = ?
       WHERE id = ?`,
      judul, kategori, nomorDokumen, tanggalTerbit, tanggalBerlaku,
      tanggalKadaluarsa, penerbit, deskripsi, filePath, ukuranFile,
      tipeFile, tags, status, tingkatKerahasiaan, now,
      id,
    );

    const row = await db.get('SELECT * FROM arsip_dokumen WHERE id = ?', id);
    return parseTags(row);
  },

  async delete(id: string): Promise<boolean> {
    const db = await openDb();
    const result = await db.run('DELETE FROM arsip_dokumen WHERE id = ?', id);
    return (result.changes ?? 0) > 0;
  },
};
