
// src/modules/perekrutan/kandidat.repository.ts
import { openDb } from '../../config/db';

export const KandidatRepository = {
  async findAll() {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM kandidat');
    return rows;
  },

  async findById(id: string) {
    const db = await openDb();
    const row = await db.get('SELECT * FROM kandidat WHERE id = ?', id);
    return row;
  },

  async create(data: { name: string, email: string, phone: string, position_applied: string, status: string, resume_url: string }) {
    const db = await openDb();
    const { name, email, phone, position_applied, status, resume_url } = data;
    const result = await db.run(
      'INSERT INTO kandidat (name, email, phone, position_applied, status, resume_url) VALUES (?, ?, ?, ?, ?, ?)',
      name, email, phone, position_applied, status, resume_url
    );
    return { id: result.lastID, ...data };
  },

  async update(id: string, data: { name: string, email: string, phone: string, position_applied: string, status: string, resume_url: string }) {
    const db = await openDb();
    const { name, email, phone, position_applied, status, resume_url } = data;
    const result = await db.run(
      'UPDATE kandidat SET name = ?, email = ?, phone = ?, position_applied = ?, status = ?, resume_url = ? WHERE id = ?',
      name, email, phone, position_applied, status, resume_url, id
    );
    if (result.changes === 0) throw new Error('Candidate not found');
    return { id, ...data };
  },

  async delete(id: string) {
    const db = await openDb();
    const result = await db.run('DELETE FROM kandidat WHERE id = ?', id);
    return !!(result.changes && result.changes > 0);
  }
};
