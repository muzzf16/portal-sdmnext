
// src/modules/cuti/permintaanCuti.repository.ts
import { openDb } from '../../config/db';
import { PegawaiRepository } from '../pegawai/pegawai.repository'; // Assuming PegawaiRepository is available

// Helper to parse JSON fields from DB results (if any, though permintaanCuti doesn't seem to have them)
const parseJsonFields = (rows: any[]) => {
  return rows; // No JSON fields to parse in permintaanCuti model based on current data
};

// Helper to calculate leave duration (simple example, might need more complex logic for weekends/holidays)
const calculateLeaveDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end day
};

export const PermintaanCutiRepository = {
  async findAll(query: any = {}) {
    const db = await openDb();
    let sql = 'SELECT * FROM permintaan_cuti';
    const params: any[] = [];
    const whereClauses: string[] = [];

    if (query.employeeId) {
      whereClauses.push('employeeId = ?');
      params.push(query.employeeId);
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    const rows = await db.all(sql, params);
    return parseJsonFields(rows);
  },

  async findById(id: string) {
    const db = await openDb();
    const row = await db.get('SELECT * FROM permintaan_cuti WHERE id = ?', id);
    if (!row) return null;
    return parseJsonFields([row])[0];
  },

  async findByEmployeeId(employeeId: string) {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM permintaan_cuti WHERE employeeId = ?', employeeId);
    return parseJsonFields(rows);
  },

  async findApprovedByEmployeeId(employeeId: string) {
    const db = await openDb();
    // Gunakan pencocokan case-insensitive untuk status Disetujui
    const rows = await db.all(
      'SELECT * FROM permintaan_cuti WHERE employeeId = ? AND LOWER(status) = ?',
      employeeId,
      'disetujui'
    );
    return parseJsonFields(rows);
  },

  async create(data: any) {
    const db = await openDb();
    const newId = data.id || `cuti-${Date.now()}`;
    const jumlahHari = calculateLeaveDuration(data.startDate, data.endDate);
    const request = {
      id: newId,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      jumlahHari: jumlahHari,
      reason: data.reason,
      status: 'menunggu',
      supportingDocument: data.supportingDocument || null,
      rejectionReason: data.rejectionReason || null,
    };

    await db.run(
      'INSERT INTO permintaan_cuti (id, employeeId, employeeName, leaveType, startDate, endDate, jumlahHari, reason, status, supportingDocument, rejectionReason) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      request.id, request.employeeId, request.employeeName, request.leaveType, 
      request.startDate, request.endDate, request.jumlahHari, request.reason, request.status, request.supportingDocument, request.rejectionReason
    );

    const newRow = await db.get('SELECT * FROM permintaan_cuti WHERE id = ?', newId);
    return parseJsonFields([newRow])[0];
  },

  async updateStatus(id: string, status: string, rejectionReason: string | null = null) {
    const db = await openDb();
    await db.run('BEGIN TRANSACTION');

    try {
      const request = await this.findById(id);
      if (!request) {
        await db.run('ROLLBACK');
        throw new Error('Leave request not found');
      }

      const result = await db.run(
        `UPDATE permintaan_cuti SET status = ?, rejectionReason = ? WHERE id = ?`,
        status, rejectionReason, id
      );
      if (result.changes === 0) {
        await db.run('ROLLBACK');
        throw new Error('Leave request not found during update');
      }

      if (status === 'Disetujui' && request.leaveType === 'Cuti Tahunan') {
        const employee = await PegawaiRepository.findById(request.employeeId);
        if (employee) {
          const duration = calculateLeaveDuration(request.startDate, request.endDate);
          const newBalance = employee.leaveBalance - duration;
          await db.run("UPDATE pegawai SET leaveBalance = ? WHERE id = ?", newBalance, request.employeeId);
        }
      }

      await db.run('COMMIT');
      return { message: 'Leave request updated' };
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  },

  async delete(id: string) {
    const db = await openDb();
    const result = await db.run('DELETE FROM permintaan_cuti WHERE id = ?', id);
    return !!(result.changes && result.changes > 0);
  },

  // New method for finding recently processed leave requests
  async findRecentlyProcessed() {
    const db = await openDb();
    const rows = await db.all(`
      SELECT * FROM permintaan_cuti 
      WHERE status IN ('Disetujui', 'Ditolak')
      AND datetime('now') - datetime(createdAt) <= 86400  -- Last 24 hours
      ORDER BY createdAt DESC
    `);
    return parseJsonFields(rows);
  }
};
