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
    }
};
