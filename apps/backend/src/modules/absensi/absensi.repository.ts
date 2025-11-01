
// src/modules/absensi/absensi.repository.ts
import { openDb } from '../../config/db';

// Helper to parse JSON fields from DB results (if any, though attendance doesn't seem to have them)
const parseJsonFields = (rows: any[]) => {
  return rows; // No JSON fields to parse in attendance model based on current data
};

export const AbsensiRepository = {
  async findAll() {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM absensi');
    return parseJsonFields(rows);
  },

  async findById(id: string) {
    const db = await openDb();
    const row = await db.get('SELECT * FROM absensi WHERE id = ?', id);
    if (!row) return null;
    return parseJsonFields([row])[0];
  },

  async findByEmployeeId(employeeId: string) {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM absensi WHERE employeeId = ?', employeeId);
    return parseJsonFields(rows);
  },

  async findByDate(employeeId: string, date: string) {
    const db = await openDb();
    const row = await db.get('SELECT * FROM absensi WHERE employeeId = ? AND date = ?', [employeeId, date]);
    if (!row) return null;
    return parseJsonFields([row])[0];
  },

  async clockIn(employeeId: string, employeeName: string) {
    const db = await openDb();
    const today = new Date().toISOString().split('T')[0];
    const existingRecord = await this.findByDate(employeeId, today);
    if (existingRecord) throw new Error('Already clocked in today.');

    const clockInTime = new Date().toLocaleTimeString('en-GB');
    const isLate = clockInTime > '09:00:00';
    
    const newRecord = {
      id: `att-${Date.now()}`,
      employeeId,
      employeeName,
      date: today,
      clockIn: clockInTime,
      clockOut: null,
      status: isLate ? 'terlambat' : 'hadir', // Use 'terlambat' for late arrivals, 'hadir' for on-time
      workDuration: null
    };

    await db.run(
      'INSERT INTO absensi (id, employeeId, employeeName, date, clockIn, clockOut, status, workDuration) VALUES (?,?,?,?,?,?,?,?)',
      Object.values(newRecord)
    );
    
    return newRecord;
  },

  async clockOut(employeeId: string) {
    const db = await openDb();
    const today = new Date().toISOString().split('T')[0];
    const record = await db.get(
      "SELECT * FROM absensi WHERE employeeId = ? AND date = ? AND clockIn IS NOT NULL AND clockOut IS NULL", 
      [employeeId, today]
    );
    
    if (!record) throw new Error('No active clock-in record found for today.');

    const clockOutTime = new Date().toLocaleTimeString('en-GB');
    const startTime = new Date(`${today}T${record.clockIn}`);
    const endTime = new Date(`${today}T${clockOutTime}`);
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    const workDuration = `${diffHrs}j ${diffMins}m`;
    
    await db.run(
      "UPDATE absensi SET clockOut = ?, workDuration = ? WHERE id = ?", 
      [clockOutTime, workDuration, record.id]
    );
    
    return { message: 'Clock out successful' };
  },

  async create(data: any) {
    const db = await openDb();
    const newId = data.id || `att-${Date.now()}`;
    
    const attendanceData = {
      id: newId,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      date: data.date,
      clockIn: data.clockIn,
      clockOut: data.clockOut,
      status: data.status,
      workDuration: data.workDuration || null
    };

    await db.run(
      'INSERT INTO absensi (id, employeeId, employeeName, date, clockIn, clockOut, status, workDuration) VALUES (?,?,?,?,?,?,?,?)',
      Object.values(attendanceData)
    );

    const newRow = await db.get('SELECT * FROM absensi WHERE id = ?', newId);
    return parseJsonFields([newRow])[0];
  },

  async update(id: string, data: any) {
    const db = await openDb();
    delete data.id; // Prevent updating the primary key

    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    const result = await db.run(`UPDATE absensi SET ${setClause} WHERE id = ?`, values);
    if (result.changes && result.changes === 0) throw new Error('Attendance record not found');

    const updatedRow = await db.get('SELECT * FROM absensi WHERE id = ?', id);
    return parseJsonFields([updatedRow])[0];
  },

  async delete(id: string) {
    const db = await openDb();
    const result = await db.run('DELETE FROM absensi WHERE id = ?', id);
    return !!(result.changes && result.changes > 0);
  }
};
