"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbsensiRepository = void 0;
const db_1 = require("../../config/db");
const parseJsonFields = (rows) => {
    return rows;
};
exports.AbsensiRepository = {
    async findAll() {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT * FROM absensi');
        return parseJsonFields(rows);
    },
    async findById(id) {
        const db = await (0, db_1.openDb)();
        const row = await db.get('SELECT * FROM absensi WHERE id = ?', id);
        if (!row)
            return null;
        return parseJsonFields([row])[0];
    },
    async findByEmployeeId(employeeId) {
        const db = await (0, db_1.openDb)();
        const rows = await db.all('SELECT * FROM absensi WHERE employeeId = ?', employeeId);
        return parseJsonFields(rows);
    },
    async findByDate(employeeId, date) {
        const db = await (0, db_1.openDb)();
        const row = await db.get('SELECT * FROM absensi WHERE employeeId = ? AND date = ?', [employeeId, date]);
        if (!row)
            return null;
        return parseJsonFields([row])[0];
    },
    async clockIn(employeeId, employeeName) {
        const db = await (0, db_1.openDb)();
        const today = new Date().toISOString().split('T')[0];
        const existingRecord = await this.findByDate(employeeId, today);
        if (existingRecord)
            throw new Error('Already clocked in today.');
        const clockInTime = new Date().toLocaleTimeString('en-GB');
        const isLate = clockInTime > '09:00:00';
        const newRecord = {
            id: `att-${Date.now()}`,
            employeeId,
            employeeName,
            date: today,
            clockIn: clockInTime,
            clockOut: null,
            status: isLate ? 'Terlambat' : 'Tepat Waktu',
            workDuration: null
        };
        await db.run('INSERT INTO absensi (id, employeeId, employeeName, date, clockIn, clockOut, status, workDuration) VALUES (?,?,?,?,?,?,?,?)', Object.values(newRecord));
        return newRecord;
    },
    async clockOut(employeeId) {
        const db = await (0, db_1.openDb)();
        const today = new Date().toISOString().split('T')[0];
        const record = await db.get("SELECT * FROM absensi WHERE employeeId = ? AND date = ? AND clockIn IS NOT NULL AND clockOut IS NULL", [employeeId, today]);
        if (!record)
            throw new Error('No active clock-in record found for today.');
        const clockOutTime = new Date().toLocaleTimeString('en-GB');
        const startTime = new Date(`${today}T${record.clockIn}`);
        const endTime = new Date(`${today}T${clockOutTime}`);
        const diffMs = endTime.getTime() - startTime.getTime();
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);
        const workDuration = `${diffHrs}j ${diffMins}m`;
        await db.run("UPDATE absensi SET clockOut = ?, workDuration = ? WHERE id = ?", [clockOutTime, workDuration, record.id]);
        return { message: 'Clock out successful' };
    },
    async create(data) {
        const db = await (0, db_1.openDb)();
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
        await db.run('INSERT INTO absensi (id, employeeId, employeeName, date, clockIn, clockOut, status, workDuration) VALUES (?,?,?,?,?,?,?,?)', Object.values(attendanceData));
        const newRow = await db.get('SELECT * FROM absensi WHERE id = ?', newId);
        return parseJsonFields([newRow])[0];
    },
    async update(id, data) {
        const db = await (0, db_1.openDb)();
        delete data.id;
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), id];
        const result = await db.run(`UPDATE absensi SET ${setClause} WHERE id = ?`, values);
        if (result.changes && result.changes === 0)
            throw new Error('Attendance record not found');
        const updatedRow = await db.get('SELECT * FROM absensi WHERE id = ?', id);
        return parseJsonFields([updatedRow])[0];
    },
    async delete(id) {
        const db = await (0, db_1.openDb)();
        const result = await db.run('DELETE FROM absensi WHERE id = ?', id);
        return !!(result.changes && result.changes > 0);
    }
};
//# sourceMappingURL=absensi.repository.js.map