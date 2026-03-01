import { openDb } from '../../config/db';

/**
 * Service untuk memproses logika bisnis terkait modul Integrasi
 */
export const IntegrationService = {
    /**
     * Mendapatkan daftar pegawai dalam format kontrak data baku untuk integrasi (M2M)
     */
    async getEmployees() {
        const db = await openDb();

        // Pilih field yang tidak terlalu sensitif untuk di-expose via API
        // Dan alias name disesuaikan dengan format snake_case sesuai panduan
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

    /**
     * Mendapatkan daftar absensi dalam format kontrak data baku untuk integrasi (M2M)
     * @param options startDate dan endDate (optional)
     */
    async getAttendances(options?: { startDate?: string; endDate?: string; employeeId?: string }) {
        const db = await openDb();

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
        const params: any[] = [];

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

    /**
     * Mendapatkan daftar pengajuan cuti dalam format kontrak data baku untuk integrasi (M2M)
     * @param options startDate dan endDate (optional)
     */
    async getLeaves(options?: { startDate?: string; endDate?: string; employeeId?: string; status?: string }) {
        const db = await openDb();

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
        const params: any[] = [];

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

    /**
     * Memasukkan data absensi (Inbound) ke dalam database Portal SDM.
     * Jika data absensi pada tanggal tersebut untuk pegawai terkait sudah ada, maka akan dilakukan UPDATE.
     * @param payload NIP, tanggal, clockIn, clockOut
     */
    async insertInboundAttendance(payload: { nip: string; date: string; clockIn: string; clockOut?: string; status?: string; notes?: string }) {
        const db = await openDb();

        // 1. Cari Pegawai berdasarkan NIP
        const pegawai = await db.get('SELECT id, name FROM pegawai WHERE nip = ? AND statusKaryawan = "aktif"', payload.nip);
        if (!pegawai) {
            throw new Error(`Pegawai aktif dengan NIP ${payload.nip} tidak ditemukan.`);
        }

        // 2. Cek apakah absensi sudah ada
        const existingAbsensi = await db.get('SELECT id FROM absensi WHERE employeeId = ? AND date = ?', [pegawai.id, payload.date]);

        const status = payload.status || 'hadir';
        const notes = payload.notes || 'via API Integration';

        let result;
        if (existingAbsensi) {
            // Update
            result = await db.run(`
                UPDATE absensi 
                SET clockIn = ?, clockOut = ?, status = ?, notes = ?
                WHERE id = ?
            `, [payload.clockIn, payload.clockOut || null, status, notes, existingAbsensi.id]);
        } else {
            // Insert
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

    /**
     * Memasukkan data log aktivitas harian (Inbound) misal untuk Kunjungan Nasabah.
     * Otomatis membuat master 'activity_library' jika belum ada.
     */
    async insertInboundDailyActivity(payload: { nip: string; date: string; activityName: string; durationMinutes: number; notes?: string }) {
        const db = await openDb();

        // 1. Cari Pegawai
        const pegawai = await db.get('SELECT id as id_pegawai, id as employeeId FROM pegawai WHERE nip = ? AND statusKaryawan = "aktif"', payload.nip);
        if (!pegawai) {
            throw new Error(`Pegawai aktif dengan NIP ${payload.nip} tidak ditemukan.`);
        }

        // 2. Cari atau Buat Master Activity
        let activity = await db.get('SELECT id FROM activity_library WHERE activityName = ? COLLATE NOCASE', payload.activityName);
        let id_activity = null;

        if (activity) {
            id_activity = activity.id;
        } else {
            // Buat baru jika tidak ada (Auto-creation)
            // Menggunakan position dan department default karena tidak diketahui dari API Eksternal
            const insertActivity = await db.run(`
                INSERT INTO activity_library (position, department, activityName, durationMinutes, category)
                VALUES (?, ?, ?, ?, ?)
            `, ['All', 'Umum', payload.activityName, payload.durationMinutes, 'operasional']);

            id_activity = insertActivity.lastID;
        }

        // 3. Masukkan ke log_aktivitas_harian
        const result = await db.run(`
            INSERT INTO log_aktivitas_harian (
                id_pegawai, tanggal, id_activity_library, frekuensi, total_durasi_terhitung, status_approval, catatan
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            pegawai.id_pegawai,
            payload.date,
            id_activity,
            1, // frekuensi default 1 per trigger
            payload.durationMinutes,
            'pending', // harus di-approve atasan
            payload.notes || 'via API Integration'
        ]);

        return {
            log_id: result.lastID,
            activityName: payload.activityName,
            status: 'pending'
        };
    }
};
