
// src/modules/penggajian/penggajian.repository.ts
import { openDb } from '../../config/db';

// Helper to parse JSON fields from DB results
const parseJsonFields = (rows: any[]) => {
  return rows.map(row => {
    const grossSalary = row.baseSalary + row.totalIncome;
    return {
      ...row,
      incomes: row.incomes ? JSON.parse(row.incomes) : [],
      deductions: row.deductions ? JSON.parse(row.deductions) : [],
      grossSalary,
    };
  });
};

export const PenggajianRepository = {
  async findAll(query: any = {}) {
    const db = await openDb();
    let sql = 'SELECT * FROM penggajian';
    const params: any[] = [];
    const whereClauses: string[] = [];

    if (query.employeeId) {
      whereClauses.push('employeeId = ?');
      params.push(query.employeeId);
    }
    if (query.search) {
      whereClauses.push('employeeName LIKE ?');
      params.push(`%${query.search}%`);
    }
    if (query.period) {
      whereClauses.push('period = ?');
      params.push(query.period);
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    const rows = await db.all(sql, params);
    return parseJsonFields(rows);
  },

  async findById(id: string) {
    const db = await openDb();
    const row = await db.get('SELECT * FROM penggajian WHERE id = ?', id);
    if (!row) return null;
    return parseJsonFields([row])[0];
  },

  async findByEmployeeId(employeeId: string) {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM penggajian WHERE employeeId = ?', employeeId);
    return parseJsonFields(rows);
  },

  async findByEmployeeIdAndPeriod(employeeId: string, period: string) {
    const db = await openDb();
    const row = await db.get('SELECT * FROM penggajian WHERE employeeId = ? AND period = ?', [employeeId, period]);
    if (!row) return null;
    return parseJsonFields([row])[0];
  },

  async create(data: any) {
    const db = await openDb();
    const newId = data.id || `payroll-${Date.now()}`;

    // Calculate totals if not provided
    const totalIncome = data.incomes?.reduce((sum: number, inc: any) => sum + inc.amount, 0) || 0;
    const totalDeductions = data.deductions?.reduce((sum: number, ded: any) => sum + ded.amount, 0) || 0;
    const netSalary = data.baseSalary + totalIncome - totalDeductions;

    const payrollData = {
      id: newId,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      period: data.period,
      baseSalary: data.baseSalary,
      incomes: JSON.stringify(data.incomes || []),
      deductions: JSON.stringify(data.deductions || []),
      totalIncome,
      totalDeductions,
      netSalary,
      status: data.status || 'Draft',
      totalAttendance: data.totalAttendance || 0,
      totalOvertime: data.totalOvertime || 0,
      totalLateness: data.totalLateness || 0
    };

    await db.run(
      'INSERT INTO penggajian (id, employeeId, employeeName, period, baseSalary, incomes, deductions, totalIncome, totalDeductions, netSalary, status, totalAttendance, totalOvertime, totalLateness) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      Object.values(payrollData)
    );

    const newRow = await db.get('SELECT * FROM penggajian WHERE id = ?', newId);
    return parseJsonFields([newRow])[0];
  },

  async update(id: string, data: any) {
    const db = await openDb();
    // Calculate totals if not provided
    const totalIncome = data.incomes?.reduce((sum: number, inc: any) => sum + inc.amount, 0) || 0;
    const totalDeductions = data.deductions?.reduce((sum: number, ded: any) => sum + ded.amount, 0) || 0;
    const netSalary = data.baseSalary + totalIncome - totalDeductions;

    // Create payroll data with only the fields that exist as columns in the database
    // Exclude calculated fields like grossSalary that are not stored in the database
    const payrollData: any = {
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      period: data.period,
      baseSalary: data.baseSalary,
      incomes: JSON.stringify(data.incomes || []),
      deductions: JSON.stringify(data.deductions || []),
      totalIncome,
      totalDeductions,
      netSalary
    };

    // Add new fields if present in data
    if (data.status) payrollData.status = data.status;
    if (data.totalAttendance !== undefined) payrollData.totalAttendance = data.totalAttendance;
    if (data.totalOvertime !== undefined) payrollData.totalOvertime = data.totalOvertime;
    if (data.totalLateness !== undefined) payrollData.totalLateness = data.totalLateness;

    const setClause = Object.keys(payrollData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(payrollData), id];

    const result = await db.run(`UPDATE penggajian SET ${setClause} WHERE id = ?`, values);
    if (result.changes === 0) throw new Error('Payroll not found');

    const updatedRow = await db.get('SELECT * FROM penggajian WHERE id = ?', id);
    return parseJsonFields([updatedRow])[0];
  },

  async delete(id: string) {
    const db = await openDb();
    const result = await db.run('DELETE FROM penggajian WHERE id = ?', id);
    return !!(result.changes && result.changes > 0);
  },

  // New method for finding recently processed payrolls
  async findRecentlyProcessed() {
    const db = await openDb();
    const rows = await db.all(`
      SELECT * FROM penggajian 
      WHERE datetime('now') - datetime(created_at) <= 86400  -- Last 24 hours
      ORDER BY created_at DESC
    `);
    return parseJsonFields(rows);
  }
};
