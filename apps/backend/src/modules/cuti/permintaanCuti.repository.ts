import { openDb } from '../../config/db';
import {
  CreateLeaveRequestInput,
  EmployeeLeaveBalanceRecord,
  LeaveRequestFilters,
  LeaveRequestRecord,
  normalizeLeaveStatus
} from './cuti.types';

type LeaveDatabase = Awaited<ReturnType<typeof openDb>>;

const resolveDb = async (db?: LeaveDatabase) => db ?? openDb();

const calculateLeaveDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};

const mapLeaveRequestRow = (row: any): LeaveRequestRecord => ({
  id: row.id,
  employeeId: row.employeeId,
  employeeName: row.employeeName,
  leaveType: row.leaveType,
  startDate: row.startDate,
  endDate: row.endDate,
  jumlahHari: row.jumlahHari,
  reason: row.reason,
  status: row.status,
  supportingDocument: row.supportingDocument,
  rejectionReason: row.rejectionReason,
  createdAt: row.createdAt
});

export const PermintaanCutiRepository = {
  calculateLeaveDuration,

  async findAll(filters: LeaveRequestFilters = {}, db?: LeaveDatabase) {
    const connection = await resolveDb(db);
    const conditions: string[] = [];
    const params: string[] = [];

    if (filters.employeeId) {
      conditions.push('employeeId = ?');
      params.push(filters.employeeId);
    }

    if (filters.status) {
      conditions.push('LOWER(status) = ?');
      params.push(normalizeLeaveStatus(filters.status));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await connection.all(
      `SELECT * FROM permintaan_cuti ${whereClause} ORDER BY createdAt DESC, startDate DESC`,
      ...params
    );

    return rows.map(mapLeaveRequestRow);
  },

  async findById(id: string, db?: LeaveDatabase) {
    const connection = await resolveDb(db);
    const row = await connection.get('SELECT * FROM permintaan_cuti WHERE id = ?', id);
    return row ? mapLeaveRequestRow(row) : null;
  },

  async findByEmployeeId(employeeId: string, db?: LeaveDatabase) {
    return this.findAll({ employeeId }, db);
  },

  async findApprovedByEmployeeId(employeeId: string, db?: LeaveDatabase) {
    return this.findAll({ employeeId, status: 'disetujui' }, db);
  },

  async create(data: CreateLeaveRequestInput, db?: LeaveDatabase) {
    const connection = await resolveDb(db);
    const requestId = data.id || `cuti-${Date.now()}`;
    const jumlahHari = calculateLeaveDuration(data.startDate, data.endDate);

    await connection.run(
      `INSERT INTO permintaan_cuti (
        id, employeeId, employeeName, leaveType, startDate, endDate, jumlahHari,
        reason, status, supportingDocument, rejectionReason
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      requestId,
      data.employeeId,
      data.employeeName,
      data.leaveType,
      data.startDate,
      data.endDate,
      jumlahHari,
      data.reason,
      'menunggu',
      data.supportingDocument || null,
      data.rejectionReason || null
    );

    const created = await this.findById(requestId, connection);
    if (!created) {
      throw new Error('Failed to create leave request');
    }

    return created;
  },

  async updateStatus(id: string, status: string, rejectionReason: string | null = null, db?: LeaveDatabase) {
    const connection = await resolveDb(db);
    const result = await connection.run(
      'UPDATE permintaan_cuti SET status = ?, rejectionReason = ? WHERE id = ?',
      normalizeLeaveStatus(status),
      rejectionReason || null,
      id
    );

    if (!result.changes) {
      throw new Error('Leave request not found');
    }

    const updated = await this.findById(id, connection);
    if (!updated) {
      throw new Error('Leave request not found');
    }

    return updated;
  },

  async delete(id: string, db?: LeaveDatabase) {
    const connection = await resolveDb(db);
    const result = await connection.run('DELETE FROM permintaan_cuti WHERE id = ?', id);
    return !!(result.changes && result.changes > 0);
  },

  async findEmployeeLeaveBalance(employeeId: string, db?: LeaveDatabase): Promise<EmployeeLeaveBalanceRecord | null> {
    const connection = await resolveDb(db);
    const row = await connection.get(
      'SELECT id, COALESCE(leaveBalance, 0) as leaveBalance FROM pegawai WHERE id = ?',
      employeeId
    );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      leaveBalance: Number(row.leaveBalance || 0)
    };
  },

  async updateEmployeeLeaveBalance(employeeId: string, leaveBalance: number, db?: LeaveDatabase) {
    const connection = await resolveDb(db);
    await connection.run(
      'UPDATE pegawai SET leaveBalance = ? WHERE id = ?',
      leaveBalance,
      employeeId
    );
  },

  async findRecentlyProcessed(db?: LeaveDatabase) {
    const connection = await resolveDb(db);
    const rows = await connection.all(
      `SELECT * FROM permintaan_cuti
       WHERE LOWER(status) IN ('disetujui', 'ditolak')
       AND datetime(createdAt) >= datetime('now', '-1 day')
       ORDER BY createdAt DESC`
    );

    return rows.map(mapLeaveRequestRow);
  }
};
