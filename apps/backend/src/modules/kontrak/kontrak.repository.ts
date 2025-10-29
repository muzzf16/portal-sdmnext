// src/modules/kontrak/kontrak.repository.ts
import { openDb } from '../../config/db';

// Helper to parse JSON fields from DB results (if any)
const parseJsonFields = (rows: any[]) => {
  return rows; // No JSON fields to parse in contract model based on current data
};

export const KontrakRepository = {
  async findAll() {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM kontrak ORDER BY startDate DESC');
    return parseJsonFields(rows);
  },

  async findById(id: string) {
    const db = await openDb();
    const row = await db.get('SELECT * FROM kontrak WHERE id = ?', id);
    if (!row) return null;
    return parseJsonFields([row])[0];
  },

  async findByEmployeeId(employeeId: string) {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM kontrak WHERE employeeId = ? ORDER BY startDate DESC', employeeId);
    return parseJsonFields(rows);
  },

  async create(contractData: any) {
    const db = await openDb();
    const result = await db.run(
      `INSERT INTO kontrak (employeeId, contractNumber, contractType, startDate, endDate, status, contractFile, terms, salary, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      contractData.employeeId,
      contractData.contractNumber,
      contractData.contractType,
      contractData.startDate,
      contractData.endDate,
      contractData.status,
      contractData.contractFile,
      contractData.terms,
      contractData.salary,
      contractData.notes
    );
    return { id: result.lastID, ...contractData };
  },

  async update(id: string, contractData: any) {
    const db = await openDb();
    await db.run(
      `UPDATE kontrak SET employeeId = ?, contractNumber = ?, contractType = ?, startDate = ?, endDate = ?, 
       status = ?, contractFile = ?, terms = ?, salary = ?, notes = ? WHERE id = ?`,
      contractData.employeeId,
      contractData.contractNumber,
      contractData.contractType,
      contractData.startDate,
      contractData.endDate,
      contractData.status,
      contractData.contractFile,
      contractData.terms,
      contractData.salary,
      contractData.notes,
      id
    );
    return { id, ...contractData };
  },

  async delete(id: string) {
    const db = await openDb();
    await db.run('DELETE FROM kontrak WHERE id = ?', id);
    return { id };
  },

  // New method for finding expiring contracts
  async findExpiringContracts() {
    const db = await openDb();
    // Find contracts expiring in 30, 14, and 7 days
    const rows = await db.all(`
      SELECT * FROM kontrak 
      WHERE status = 'active' 
      AND endDate IN (
        date('now', '+30 days'),
        date('now', '+14 days'),
        date('now', '+7 days')
      )
    `);
    return parseJsonFields(rows);
  }
};