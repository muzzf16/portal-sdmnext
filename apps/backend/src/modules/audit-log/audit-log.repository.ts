import { openDb } from '../../core/database/sqlite';
import { AuditLogEntry, AuditLogFilters } from './audit-log.model';

export const AuditLogRepository = {
  async create(payload: AuditLogEntry) {
    const db = await openDb();
    const result = await db.run(
      `INSERT INTO audit_logs (user_id, action, module, description, metadata, request_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      payload.user_id,
      payload.action,
      payload.module,
      payload.description,
      JSON.stringify(payload.metadata || {}),
      payload.request_id || null
    );

    return db.get('SELECT * FROM audit_logs WHERE id = ?', result.lastID);
  },

  async findAll(filters: AuditLogFilters = {}) {
    const db = await openDb();
    const conditions: string[] = [];
    const params: Array<string | number> = [];

    if (filters.module) {
      conditions.push('module = ?');
      params.push(filters.module);
    }

    if (filters.action) {
      conditions.push('action = ?');
      params.push(filters.action);
    }

    if (filters.userId) {
      conditions.push('user_id = ?');
      params.push(filters.userId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit ?? 100;

    return db.all(
      `SELECT * FROM audit_logs
       ${whereClause}
       ORDER BY created_at DESC, id DESC
       LIMIT ?`,
      ...params,
      limit
    );
  }
};
