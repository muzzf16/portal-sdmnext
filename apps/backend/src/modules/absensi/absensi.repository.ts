
import { openDb } from '../../config/db';
import { Absensi, AbsensiCreatePayload, AbsensiFilters, AbsensiUpdatePayload } from './absensi.model';

type AttendanceDatabase = Awaited<ReturnType<typeof openDb>>;

const resolveDb = async (db?: AttendanceDatabase) => db ?? openDb();

const mapAbsensiRow = (row: any): Absensi => ({
  id: String(row.id),
  employeeId: String(row.employeeId),
  employeeName: String(row.employeeName ?? ''),
  date: String(row.date),
  clockIn: row.clockIn ? String(row.clockIn) : null,
  clockOut: row.clockOut ? String(row.clockOut) : null,
  status: String(row.status ?? 'hadir'),
  workDuration: row.workDuration ? String(row.workDuration) : null,
  notes: row.notes ? String(row.notes) : null
});

const buildWhereClause = (filters: AbsensiFilters) => {
  const conditions: string[] = [];
  const params: string[] = [];

  if (filters.employeeId) {
    conditions.push('employeeId = ?');
    params.push(filters.employeeId);
  }

  if (filters.startDate) {
    conditions.push('date >= ?');
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    conditions.push('date <= ?');
    params.push(filters.endDate);
  }

  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  };
};

export const AbsensiRepository = {
  async findAll(filters: AbsensiFilters = {}, db?: AttendanceDatabase) {
    const connection = await resolveDb(db);
    const { whereClause, params } = buildWhereClause(filters);
    const rows = await connection.all(
      `SELECT * FROM absensi
       ${whereClause}
       ORDER BY date DESC, employeeName ASC, clockIn DESC`,
      ...params
    );

    return rows.map(mapAbsensiRow);
  },

  async findById(id: string, db?: AttendanceDatabase) {
    const connection = await resolveDb(db);
    const row = await connection.get('SELECT * FROM absensi WHERE id = ?', id);
    return row ? mapAbsensiRow(row) : null;
  },

  async findByEmployeeId(employeeId: string, filters: Omit<AbsensiFilters, 'employeeId'> = {}, db?: AttendanceDatabase) {
    const connection = await resolveDb(db);
    return this.findAll({ ...filters, employeeId }, connection);
  },

  async findByDate(employeeId: string, date: string, db?: AttendanceDatabase) {
    const connection = await resolveDb(db);
    const row = await connection.get(
      'SELECT * FROM absensi WHERE employeeId = ? AND date = ?',
      employeeId,
      date
    );

    return row ? mapAbsensiRow(row) : null;
  },

  async findActiveClockInByDate(employeeId: string, date: string, db?: AttendanceDatabase) {
    const connection = await resolveDb(db);
    const row = await connection.get(
      `SELECT * FROM absensi
       WHERE employeeId = ?
         AND date = ?
         AND clockIn IS NOT NULL
         AND clockOut IS NULL`,
      employeeId,
      date
    );

    return row ? mapAbsensiRow(row) : null;
  },

  async create(data: AbsensiCreatePayload, db?: AttendanceDatabase) {
    const connection = await resolveDb(db);
    const newId = data.id || `att-${Date.now()}`;

    await connection.run(
      `INSERT INTO absensi (
        id, employeeId, employeeName, date, clockIn, clockOut, status, workDuration, notes
      ) VALUES (?,?,?,?,?,?,?,?,?)`,
      newId,
      data.employeeId,
      data.employeeName,
      data.date,
      data.clockIn ?? null,
      data.clockOut ?? null,
      data.status ?? 'hadir',
      data.workDuration ?? null,
      data.notes ?? null
    );

    const newRow = await connection.get('SELECT * FROM absensi WHERE id = ?', newId);
    return mapAbsensiRow(newRow);
  },

  async update(id: string, data: AbsensiUpdatePayload, db?: AttendanceDatabase) {
    const connection = await resolveDb(db);
    const entries = Object.entries(data).filter(([, value]) => value !== undefined);

    if (entries.length === 0) {
      return this.findById(id, connection);
    }

    const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([, value]) => value ?? null);
    const result = await connection.run(
      `UPDATE absensi SET ${setClause} WHERE id = ?`,
      ...values,
      id
    );

    if (!result.changes) {
      return null;
    }

    const updatedRow = await connection.get('SELECT * FROM absensi WHERE id = ?', id);
    return updatedRow ? mapAbsensiRow(updatedRow) : null;
  },

  async delete(id: string, db?: AttendanceDatabase) {
    const connection = await resolveDb(db);
    const result = await connection.run('DELETE FROM absensi WHERE id = ?', id);
    return !!result.changes;
  }
};
