"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationService = void 0;
const db_1 = require("../../config/db");
exports.IntegrationService = {
    async getEmployees() {
        const db = await (0, db_1.openDb)();
        const employees = await db.all(`
            SELECT 
                id as external_id,
                nip,
                name,
                jenis_kelamin as gender,
                email,
                phone as phone_number,
                position,
                department,
                statusKaryawan as employment_status,
                joinDate as join_date
            FROM pegawai
            WHERE statusKaryawan = 'aktif'
            ORDER BY name ASC
        `);
        return employees;
    },
    async getAttendances(options) {
        const db = await (0, db_1.openDb)();
        let query = `
            SELECT 
                a.id as attendance_id,
                a.employeeId as employee_external_id,
                p.nip,
                a.date,
                a.clockIn as clock_in,
                a.clockOut as clock_out,
                a.status as attendance_status,
                a.workDuration as work_duration,
                a.notes
            FROM absensi a
            JOIN pegawai p ON a.employeeId = p.id
            WHERE 1=1
        `;
        const params = [];
        if (options?.employeeId) {
            query += ` AND a.employeeId = ?`;
            params.push(options.employeeId);
        }
        if (options?.startDate) {
            query += ` AND a.date >= ?`;
            params.push(options.startDate);
        }
        if (options?.endDate) {
            query += ` AND a.date <= ?`;
            params.push(options.endDate);
        }
        query += ` ORDER BY a.date DESC`;
        const attendances = await db.all(query, ...params);
        return attendances;
    },
    async getLeaves(options) {
        const db = await (0, db_1.openDb)();
        let query = `
            SELECT 
                c.id as leave_id,
                c.employeeId as employee_external_id,
                p.nip,
                c.leaveType as leave_type,
                c.startDate as start_date,
                c.endDate as end_date,
                c.jumlahHari as total_days,
                c.reason,
                c.status as leave_status,
                c.createdAt as created_at
            FROM permintaan_cuti c
            JOIN pegawai p ON c.employeeId = p.id
            WHERE 1=1
        `;
        const params = [];
        if (options?.employeeId) {
            query += ` AND c.employeeId = ?`;
            params.push(options.employeeId);
        }
        if (options?.status) {
            query += ` AND c.status = ?`;
            params.push(options.status);
        }
        if (options?.startDate) {
            query += ` AND c.startDate >= ?`;
            params.push(options.startDate);
        }
        if (options?.endDate) {
            query += ` AND c.endDate <= ?`;
            params.push(options.endDate);
        }
        query += ` ORDER BY c.createdAt DESC`;
        const leaves = await db.all(query, ...params);
        return leaves;
    },
    async insertInboundAttendance(payload) {
        const db = await (0, db_1.openDb)();
        const pegawai = await db.get('SELECT id, name FROM pegawai WHERE nip = ? AND statusKaryawan = "aktif"', payload.nip);
        if (!pegawai) {
            throw new Error(`Pegawai aktif dengan NIP ${payload.nip} tidak ditemukan.`);
        }
        const existingAbsensi = await db.get('SELECT id FROM absensi WHERE employeeId = ? AND date = ?', [pegawai.id, payload.date]);
        const status = payload.status || 'hadir';
        const notes = payload.notes || 'via API Integration';
        let result;
        if (existingAbsensi) {
            result = await db.run(`
                UPDATE absensi 
                SET clockIn = ?, clockOut = ?, status = ?, notes = ?
                WHERE id = ?
            `, [payload.clockIn, payload.clockOut || null, status, notes, existingAbsensi.id]);
        }
        else {
            const newId = 'att-' + Date.now() + Math.floor(Math.random() * 1000);
            result = await db.run(`
                INSERT INTO absensi (id, employeeId, employeeName, date, clockIn, clockOut, status, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [newId, pegawai.id, pegawai.name, payload.date, payload.clockIn, payload.clockOut || null, status, notes]);
        }
        return {
            action: existingAbsensi ? 'UPDATE' : 'INSERT',
            employeeName: pegawai.name,
            date: payload.date
        };
    },
    async insertInboundDailyActivity(payload) {
        const db = await (0, db_1.openDb)();
        const pegawai = await db.get('SELECT id as id_pegawai, id as employeeId FROM pegawai WHERE nip = ? AND statusKaryawan = "aktif"', payload.nip);
        if (!pegawai) {
            throw new Error(`Pegawai aktif dengan NIP ${payload.nip} tidak ditemukan.`);
        }
        let activity = await db.get('SELECT id FROM activity_library WHERE activityName = ? COLLATE NOCASE', payload.activityName);
        let id_activity = null;
        if (activity) {
            id_activity = activity.id;
        }
        else {
            const insertActivity = await db.run(`
                INSERT INTO activity_library (position, department, activityName, durationMinutes, category)
                VALUES (?, ?, ?, ?, ?)
            `, ['All', 'Umum', payload.activityName, payload.durationMinutes, 'operasional']);
            id_activity = insertActivity.lastID;
        }
        const result = await db.run(`
            INSERT INTO log_aktivitas_harian (
                id_pegawai, tanggal, id_activity_library, frekuensi, total_durasi_terhitung, status_approval, catatan
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            pegawai.id_pegawai,
            payload.date,
            id_activity,
            1,
            payload.durationMinutes,
            'pending',
            payload.notes || 'via API Integration'
        ]);
        return {
            log_id: result.lastID,
            activityName: payload.activityName,
            status: 'pending'
        };
    }
};
//# sourceMappingURL=integration.service.js.map