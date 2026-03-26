import { openDb } from '../../core/database/sqlite';
import { ChangelogEntry } from './changelog.model';

export const ChangelogRepository = {
  async create(payload: ChangelogEntry) {
    const db = await openDb();
    const result = await db.run(
      `INSERT INTO release_changelog (release_tag, module, type, description, impacted_files, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      payload.release_tag,
      payload.module,
      payload.type,
      payload.description,
      JSON.stringify(payload.impacted_files || []),
      payload.created_by || 'system'
    );

    return db.get('SELECT * FROM release_changelog WHERE id = ?', result.lastID);
  },

  async findAll(limit = 50) {
    const db = await openDb();
    return db.all(
      `SELECT * FROM release_changelog
       ORDER BY released_at DESC, id DESC
       LIMIT ?`,
      limit
    );
  }
};
