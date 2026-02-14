
// src/modules/perekrutan/kandidat.repository.ts
import { openDb } from '../../config/db';

export const KandidatRepository = {
  async findAll() {
    const db = await openDb();
    return db.all('SELECT * FROM kandidat ORDER BY created_at DESC');
  },

  async findById(id: string) {
    const db = await openDb();
    return db.get('SELECT * FROM kandidat WHERE id = ?', id);
  },

  async create(data: {
    name: string;
    email: string;
    phone?: string;
    position_applied: string;
    status?: string;
    resume_url?: string;
    cover_letter?: string;
    application_date?: string;
    notes?: string;
  }) {
    const db = await openDb();
    const {
      name, email, phone = '', position_applied,
      status = 'Melamar', resume_url = '', cover_letter = '',
      application_date = new Date().toISOString().split('T')[0],
      notes = ''
    } = data;
    const result = await db.run(
      `INSERT INTO kandidat (name, email, phone, position_applied, status, resume_url, cover_letter, application_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      name, email, phone, position_applied, status, resume_url, cover_letter, application_date, notes
    );
    return { id: result.lastID, ...data, status, application_date };
  },

  async update(id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    position_applied?: string;
    status?: string;
    resume_url?: string;
    cover_letter?: string;
    application_date?: string;
    notes?: string;
  }) {
    const db = await openDb();
    const existing = await db.get('SELECT * FROM kandidat WHERE id = ?', id);
    if (!existing) throw new Error('Candidate not found');

    const merged = { ...existing, ...data };
    const result = await db.run(
      `UPDATE kandidat SET name = ?, email = ?, phone = ?, position_applied = ?, status = ?, resume_url = ?, cover_letter = ?, application_date = ?, notes = ? WHERE id = ?`,
      merged.name, merged.email, merged.phone, merged.position_applied, merged.status, merged.resume_url, merged.cover_letter, merged.application_date, merged.notes, id
    );
    if (result.changes === 0) throw new Error('Candidate not found');
    return { id, ...merged };
  },

  async delete(id: string) {
    const db = await openDb();
    const result = await db.run('DELETE FROM kandidat WHERE id = ?', id);
    return !!(result.changes && result.changes > 0);
  }
};
