// src/modules/kontrak/kontrak.repository.ts
import { openDb } from '../../config/db';

// Helper to parse JSON fields from DB results (if any)
const parseJsonFields = (rows: any[]) => {
  return rows; // No JSON fields to parse in contract model based on current data
};

export const KontrakRepository = {
  async findAll() {
    const db = await openDb();
    const rows = await db.all(`
      SELECT k.*, p.name as employeeName, p.position, p.department
      FROM kontrak k 
      LEFT JOIN pegawai p ON k.employeeId = p.id 
      ORDER BY k.startDate DESC
    `);
    return parseJsonFields(rows);
  },

  async findById(id: string) {
    const db = await openDb();
    const row = await db.get(`
      SELECT k.*, p.name as employeeName, p.position, p.department
      FROM kontrak k 
      LEFT JOIN pegawai p ON k.employeeId = p.id 
      WHERE k.id = ?
    `, id);
    if (!row) return null;
    return parseJsonFields([row])[0];
  },

  async findByEmployeeId(employeeId: string) {
    const db = await openDb();
    const rows = await db.all(`
      SELECT k.*, p.name as employeeName, p.position, p.department
      FROM kontrak k 
      LEFT JOIN pegawai p ON k.employeeId = p.id 
      WHERE k.employeeId = ? 
      ORDER BY k.startDate DESC
    `, employeeId);
    return parseJsonFields(rows);
  },

  async create(contractData: any) {
    const db = await openDb();
    
    // Generate unique ID
    const id = contractData.id || `kontrak-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate contract number if not provided
    const contractNumber = contractData.contractNumber || `CNT-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    // Set createdAt
    const createdAt = new Date().toISOString();
    
    // Get employee name for return value
    let employeeName = contractData.employeeName;
    if (!employeeName && contractData.employeeId) {
      const employee = await db.get('SELECT name FROM pegawai WHERE id = ?', contractData.employeeId);
      employeeName = employee?.name || null;
    }
    
    await db.run(
      `INSERT INTO kontrak (id, employeeId, contractNumber, contractType, startDate, endDate, status, contractFile, terms, salary, notes, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      contractData.employeeId,
      contractNumber,
      contractData.contractType,
      contractData.startDate,
      contractData.endDate,
      contractData.status,
      contractData.contractFile || null,
      contractData.terms || null,
      contractData.salary || null,
      contractData.notes || null,
      createdAt
    );
    
    // Fetch the created contract with employee name, position, and department to return complete data
    const newRow = await db.get(`
      SELECT k.*, p.name as employeeName, p.position, p.department
      FROM kontrak k 
      LEFT JOIN pegawai p ON k.employeeId = p.id 
      WHERE k.id = ?
    `, id);
    return parseJsonFields([newRow])[0];
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