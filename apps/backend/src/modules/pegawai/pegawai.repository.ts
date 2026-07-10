// src/modules/pegawai/pegawai.repository.ts
import { openDb } from '../../config/db';

// Helper to parse JSON fields from DB results
const parseJsonFields = (rows: any[]) => {
  return rows.map(row => ({
    ...row,
    educationHistory: row.educationHistory ? JSON.parse(row.educationHistory) : [],
    workHistory: row.workHistory ? JSON.parse(row.workHistory) : [],
    trainingCertificates: row.trainingCertificates ? JSON.parse(row.trainingCertificates) : [],
    payrollInfo: row.payrollInfo ? JSON.parse(row.payrollInfo) : { baseSalary: 0, incomes: [], deductions: [] },
    position: row.jabatanNama || row.position, // Override the out-of-sync string column with the actual foreign key value
    department: row.jabatanDepartment || row.department,
  }));
};

export const PegawaiRepository = {
  async findAll(options?: { includeDirectors?: boolean }) {
    const db = await openDb();
    const excludeCondition = !options?.includeDirectors
      ? `WHERE (j.department != 'Direksi' OR j.department IS NULL)
         AND COALESCE(p.position, '') NOT IN ('Direktur UTAMA', 'Direktur Utama', 'Direktur YMFK')`
      : '';
    const rows = await db.all(`
      SELECT p.*, 
        j.nama as jabatanNama, j.level as jabatanLevel, j.department as jabatanDepartment,
        a.name as atasanNama
      FROM pegawai p
      LEFT JOIN jabatan j ON p.jabatan_id = j.id
      LEFT JOIN pegawai a ON p.atasan_id = a.id
      ${excludeCondition}
      ORDER BY 
        CASE WHEN p.nip IS NULL OR p.nip = '' THEN 1 ELSE 0 END ASC,
        p.nip ASC, 
        p.name ASC
    `);
    return parseJsonFields(rows);
  },

  async findById(id: string) {
    const db = await openDb();
    const row = await db.get(`
      SELECT p.*, 
        j.nama as jabatanNama, j.level as jabatanLevel, j.department as jabatanDepartment,
        a.name as atasanNama, a.nip as atasanNip
      FROM pegawai p
      LEFT JOIN jabatan j ON p.jabatan_id = j.id
      LEFT JOIN pegawai a ON p.atasan_id = a.id
      WHERE p.id = ?
    `, id);
    if (!row) return null;
    return parseJsonFields([row])[0];
  },

  async findByEmail(email: string) {
    const db = await openDb();
    const row = await db.get('SELECT * FROM pegawai WHERE email = ?', email);
    if (!row) return null;
    return parseJsonFields([row])[0];
  },

  async findByNip(nip: string) {
    const db = await openDb();
    const row = await db.get('SELECT * FROM pegawai WHERE nip = ?', nip);
    if (!row) return null;
    return parseJsonFields([row])[0];
  },

  async generateNip() {
    const db = await openDb();
    const year = new Date().getFullYear();
    const result = await db.get(
      'SELECT COUNT(*) as count FROM pegawai WHERE nip LIKE ?',
      `${year}%`
    );
    const seq = (result?.count || 0) + 1;
    return `${year}${String(seq).padStart(4, '0')}`;
  },

  async create(data: any) {
    const db = await openDb();
    const newId = data.id || `emp-${Date.now()}`;
    const rawNip = data.nip ? String(data.nip).trim() : '';
    const isEmptyNip = !rawNip || rawNip === '-' || rawNip.toUpperCase() === 'N/A';
    const nip = isEmptyNip ? null : rawNip;

    // Normalize atasan_id: empty string/whitespace to NULL
    const atasanRaw = data.atasan_id;
    const atasanId = (typeof atasanRaw === 'string' ? atasanRaw.trim() : atasanRaw);
    const normalizedAtasanId = (!atasanId || atasanId === '-' || atasanId.toUpperCase() === 'N/A' || atasanId === 'null') ? null : atasanId;

    // Normalize jabatan_id: empty string, NaN, <= 0 to NULL
    const jabRaw = data.jabatan_id;
    const normalizedJabatanId = (jabRaw === '' || jabRaw === null || jabRaw === undefined || isNaN(Number(jabRaw)) || Number(jabRaw) <= 0 || jabRaw === 'null') ? null : Number(jabRaw);

    const pegawaiData = {
      id: newId,
      name: data.name,
      nip,
      email: data.email,
      position: data.position || 'N/A',
      pangkat: data.pangkat || 'N/A',
      golongan: data.golongan || 'N/A',
      department: data.department || 'N/A',
      joinDate: data.joinDate || new Date().toISOString().split('T')[0],
      avatarUrl: data.avatarUrl || '/avatars/default-avatar.jpg',
      jenis_kelamin: data.jenis_kelamin || null,
      leaveBalance: data.leaveBalance ?? 18,
      isActive: data.hasOwnProperty('isActive') ? (data.isActive ? 1 : 0) : 1,
      address: data.address || '',
      phone: data.phone || '',
      pob: data.pob || '',
      dob: data.dob || '',
      religion: data.religion || 'Lainnya',
      maritalStatus: data.maritalStatus || 'Lajang',
      numberOfChildren: data.numberOfChildren ?? 0,
      educationHistory: JSON.stringify(data.educationHistory || []),
      workHistory: JSON.stringify(data.workHistory || []),
      trainingCertificates: JSON.stringify(data.trainingCertificates || []),
      payrollInfo: JSON.stringify(data.payrollInfo || { baseSalary: 0, incomes: [], deductions: [] }),
      tanggalKeluar: data.tanggal_keluar || null, // For turnover analysis
      jabatan_id: normalizedJabatanId,
      atasan_id: normalizedAtasanId,
      tanggalCalonPegawai: data.tanggalCalonPegawai || null,
      tanggalKenaikanPangkatTerakhir: data.tanggalKenaikanPangkatTerakhir || null,
      tanggalKenaikanPangkatSelanjutnya: data.tanggalKenaikanPangkatSelanjutnya || null,
      tanggalKenaikanGajiBerkala: data.tanggalKenaikanGajiBerkala || null,
    };

    const columns = Object.keys(pegawaiData);
    const placeholders = columns.map(() => '?').join(',');
    const values = Object.values(pegawaiData);

    await db.run(`INSERT INTO pegawai (${columns.join(',')}) VALUES (${placeholders})`, values);

    const newRow = await db.get('SELECT * FROM pegawai WHERE id = ?', newId);
    return parseJsonFields([newRow])[0];
  },

  async update(id: string, data: any) {
    const db = await openDb();

    const validColumns = [
      'name', 'nip', 'email', 'position', 'pangkat', 'golongan', 'department',
      'joinDate', 'avatarUrl', 'leaveBalance', 'isActive', 'address', 'phone',
      'pob', 'dob', 'religion', 'maritalStatus', 'numberOfChildren',
      'educationHistory', 'workHistory', 'trainingCertificates', 'payrollInfo',
      'jenis_kelamin', 'tanggalKeluar', 'jabatan_id', 'atasan_id',
      'tanggalCalonPegawai', 'tanggalKenaikanPangkatTerakhir', 
      'tanggalKenaikanPangkatSelanjutnya', 'tanggalKenaikanGajiBerkala'
    ];

    const fieldsToUpdate: any = {};
    for (const key of Object.keys(data)) {
      if (validColumns.includes(key)) {
        fieldsToUpdate[key] = data[key];
      }
    }

    // Normalize NIP: treat '-', '', 'N/A', whitespace-only as NULL to avoid UNIQUE conflicts
    if (fieldsToUpdate.hasOwnProperty('nip')) {
      const nipVal = String(fieldsToUpdate.nip || '').trim();
      if (!nipVal || nipVal === '-' || nipVal.toUpperCase() === 'N/A') {
        fieldsToUpdate.nip = null;
      }
    }

    // Normalize atasan_id: empty string/whitespace to NULL
    if (fieldsToUpdate.hasOwnProperty('atasan_id')) {
      const atasanVal = typeof fieldsToUpdate.atasan_id === 'string' ? fieldsToUpdate.atasan_id.trim() : fieldsToUpdate.atasan_id;
      if (!atasanVal || atasanVal === '-' || atasanVal.toUpperCase() === 'N/A' || atasanVal === 'null') {
        fieldsToUpdate.atasan_id = null;
      }
    }

    // Normalize jabatan_id: empty string, NaN, <= 0 to NULL
    if (fieldsToUpdate.hasOwnProperty('jabatan_id')) {
      const jabVal = fieldsToUpdate.jabatan_id;
      if (jabVal === '' || jabVal === null || jabVal === undefined || isNaN(Number(jabVal)) || Number(jabVal) <= 0 || jabVal === 'null') {
        fieldsToUpdate.jabatan_id = null;
      } else {
        fieldsToUpdate.jabatan_id = Number(jabVal);
      }
    }

    // Special handling for JSON fields
    if (fieldsToUpdate.hasOwnProperty('educationHistory')) {
      fieldsToUpdate.educationHistory = JSON.stringify(fieldsToUpdate.educationHistory || []);
    }
    if (fieldsToUpdate.hasOwnProperty('workHistory')) {
      fieldsToUpdate.workHistory = JSON.stringify(fieldsToUpdate.workHistory || []);
    }
    if (fieldsToUpdate.hasOwnProperty('trainingCertificates')) {
      fieldsToUpdate.trainingCertificates = JSON.stringify(fieldsToUpdate.trainingCertificates || []);
    }
    if (fieldsToUpdate.hasOwnProperty('payrollInfo')) {
      fieldsToUpdate.payrollInfo = JSON.stringify(fieldsToUpdate.payrollInfo || {});
    }

    // Special handling for isActive
    if (fieldsToUpdate.hasOwnProperty('isActive')) {
      fieldsToUpdate.isActive = fieldsToUpdate.isActive ? 1 : 0;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      const currentRow = await this.findById(id);
      if (!currentRow) throw new Error('Employee not found');
      return currentRow;
    }

    const setClause = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(fieldsToUpdate), id];

    const result = await db.run(`UPDATE pegawai SET ${setClause} WHERE id = ?`, values);

    if (result.changes === 0) {
      const existing = await this.findById(id);
      if (!existing) throw new Error('Employee not found');
    }

    const updatedRow = await db.get('SELECT * FROM pegawai WHERE id = ?', id);
    return parseJsonFields([updatedRow])[0];
  },

  async delete(id: string) {
    const db = await openDb();

    // 1. Delete linked records from child tables to prevent FOREIGN KEY constraint failures
    // Tables with employeeId
    const tablesWithEmployeeId = ['absensi', 'permintaan_cuti', 'penggajian', 'penilaian_kinerja', 'kontrak', 'data_change_requests', 'analisis_beban_kerja', 'kpi_targets'];
    for (const table of tablesWithEmployeeId) {
      try { await db.run(`DELETE FROM ${table} WHERE employeeId = ?`, id); } catch (e) {}
    }
    
    // Tables with pegawai_id
    const tablesWithPegawaiId = ['pelatihan', 'riwayat_jabatan'];
    for (const table of tablesWithPegawaiId) {
      try { await db.run(`DELETE FROM ${table} WHERE pegawai_id = ?`, id); } catch (e) {}
    }

    // Tables with employee_id
    const tablesWithEmployeeUnderscoreId = ['tugas_orientasi', 'notifications', 'assigned_tasks'];
    for (const table of tablesWithEmployeeUnderscoreId) {
      try { await db.run(`DELETE FROM ${table} WHERE employee_id = ?`, id); } catch (e) {}
    }

    // Tables with id_pegawai
    const tablesWithIdPegawai = ['log_aktivitas_harian', 'pinjaman_karyawan', 'daily_activities'];
    for (const table of tablesWithIdPegawai) {
      try { await db.run(`DELETE FROM ${table} WHERE id_pegawai = ?`, id); } catch (e) {}
    }

    // Table users which references nip
    try {
      const pegawai = await db.get('SELECT nip FROM pegawai WHERE id = ?', id);
      if (pegawai && pegawai.nip) {
        await db.run(`DELETE FROM users WHERE employeeId = ?`, pegawai.nip);
      }
    } catch (e) {}

    // 2. Remove employee as supervisor for others
    try { await db.run(`UPDATE pegawai SET atasan_id = NULL WHERE atasan_id = ?`, id); } catch (e) {}

    // 3. Delete the employee itself
    const result = await db.run('DELETE FROM pegawai WHERE id = ?', id);
    return !!(result.changes && result.changes > 0);
  },

  async updatePayrollInfo(id: string, payrollInfo: any) {
    const db = await openDb();
    const result = await db.run(
      `UPDATE pegawai SET payrollInfo = ? WHERE id = ?`,
      JSON.stringify(payrollInfo), id
    );
    if (result.changes === 0) throw new Error('Employee not found');
    return { message: 'Payroll info updated' };
  },

  async getGenderDistribution() {
    const db = await openDb();
    const rows = await db.all('SELECT jenis_kelamin FROM pegawai WHERE jenis_kelamin IS NOT NULL');

    const genderCount: { [key: string]: number } = { 'L': 0, 'P': 0, 'Other': 0 };

    rows.forEach(row => {
      if (row.jenis_kelamin === 'L') {
        genderCount['L']++;
      } else if (row.jenis_kelamin === 'P') {
        genderCount['P']++;
      } else {
        genderCount['Other']++;
      }
    });

    return [
      { name: 'Laki-laki', value: genderCount['L'] },
      { name: 'Perempuan', value: genderCount['P'] },
      ...(genderCount['Other'] > 0 ? [{ name: 'Lainnya', value: genderCount['Other'] }] : [])
    ];
  },

  async getEducationDistribution() {
    const db = await openDb();
    const rows = await db.all('SELECT educationHistory FROM pegawai WHERE educationHistory IS NOT NULL AND educationHistory != \'[]\'');

    const educationCount: { [key: string]: number } = {};

    rows.forEach(row => {
      if (row.educationHistory && row.educationHistory !== '[]') {
        try {
          const educationHistory = JSON.parse(row.educationHistory);
          if (Array.isArray(educationHistory) && educationHistory.length > 0) {
            educationHistory.forEach(edu => {
              const level = edu.level || edu.jenjang_pendidikan || 'Tidak Diketahui';
              educationCount[level] = (educationCount[level] || 0) + 1;
            });
          }
        } catch (e) {
          console.error('Error parsing educationHistory:', e);
        }
      }
    });

    return Object.entries(educationCount).map(([name, employees]) => ({ name, employees }));
  },

  async getDepartmentDistribution() {
    const db = await openDb();
    const rows = await db.all(`
      SELECT COALESCE(j.department, p.department, 'Belum Ditetapkan') as dept, COUNT(*) as count
      FROM pegawai p
      LEFT JOIN jabatan j ON p.jabatan_id = j.id
      WHERE p.isActive = 1 OR p.statusKaryawan = 'aktif'
      GROUP BY dept
      ORDER BY count DESC
    `);
    return rows.map((r: any) => ({ name: r.dept, value: r.count }));
  },

  // Additional method for comprehensive employee report data
  async getEmployeeReportData() {
    const db = await openDb();
    const rows = await db.all(`
      SELECT id, nip, name, email, position, department, joinDate, jenis_kelamin, isActive, tanggalKeluar
      FROM pegawai
      ORDER BY name ASC
    `);
    return rows;
  },

  // === SUPERVISOR METHODS ===

  async findByAtasanId(atasanId: string) {
    const db = await openDb();

    const supervisor = await db.get('SELECT jabatan_id FROM pegawai WHERE id = ?', atasanId);
    if (!supervisor || !supervisor.jabatan_id) return [];

    // Recursive CTE: collect all jabatan IDs in the hierarchy below the supervisor's jabatan
    const rows = await db.all(`
      WITH RECURSIVE sub_jabatan(id) AS (
        -- Seed: direct children of supervisor's jabatan
        SELECT id FROM jabatan WHERE parent_id = ?
        UNION ALL
        -- Recursion: children of children
        SELECT j.id FROM jabatan j INNER JOIN sub_jabatan s ON j.parent_id = s.id
      )
      SELECT p.*,
        j.nama as jabatanNama, j.level as jabatanLevel, j.department as jabatanDepartment
      FROM pegawai p
      LEFT JOIN jabatan j ON p.jabatan_id = j.id
      WHERE p.jabatan_id IN (SELECT id FROM sub_jabatan)
        AND (p.isActive = 1 OR p.statusKaryawan = 'aktif')
      ORDER BY j.level ASC, p.name ASC
    `, supervisor.jabatan_id);
    return parseJsonFields(rows);
  },

  async getSupervisorStats(atasanId: string) {
    const db = await openDb();

    const supervisor = await db.get('SELECT jabatan_id FROM pegawai WHERE id = ?', atasanId);
    if (!supervisor || !supervisor.jabatan_id) {
      return { totalTeam: 0, presentToday: 0, onLeaveToday: 0, pendingLeaves: 0 };
    }
    const supervisorJabatanId = supervisor.jabatan_id;

    // Shared CTE fragment: all jabatan IDs in the hierarchy below the supervisor
    const subJabatanCTE = `
      WITH RECURSIVE sub_jabatan(id) AS (
        SELECT id FROM jabatan WHERE parent_id = ?
        UNION ALL
        SELECT j.id FROM jabatan j INNER JOIN sub_jabatan s ON j.parent_id = s.id
      )
    `;

    // Total subordinates (all levels)
    const total = await db.get(
      `${subJabatanCTE}
       SELECT COUNT(*) as count
       FROM pegawai p
       WHERE p.jabatan_id IN (SELECT id FROM sub_jabatan)
         AND (p.isActive = 1 OR p.statusKaryawan = 'aktif')`,
      supervisorJabatanId
    );

    // Attendance today (present)
    const today = new Date().toISOString().split('T')[0];
    const present = await db.get(
      `${subJabatanCTE}
       SELECT COUNT(a.id) as count
       FROM absensi a
       JOIN pegawai p ON a.employeeId = p.id
       WHERE p.jabatan_id IN (SELECT id FROM sub_jabatan)
         AND a.date = ? AND a.status = 'hadir'`,
      supervisorJabatanId, today
    );

    // On leave/sick/permission today
    const onLeave = await db.get(
      `${subJabatanCTE}
       SELECT COUNT(a.id) as count
       FROM absensi a
       JOIN pegawai p ON a.employeeId = p.id
       WHERE p.jabatan_id IN (SELECT id FROM sub_jabatan)
         AND a.date = ? AND a.status IN ('izin', 'sakit', 'cuti')`,
      supervisorJabatanId, today
    );

    // Pending leave requests
    const pendingLeaves = await db.get(
      `${subJabatanCTE}
       SELECT COUNT(c.id) as count
       FROM permintaan_cuti c
       JOIN pegawai p ON c.employeeId = p.id
       WHERE p.jabatan_id IN (SELECT id FROM sub_jabatan)
         AND c.status = 'menunggu'`,
      supervisorJabatanId
    );

    return {
      totalTeam: total?.count || 0,
      presentToday: present?.count || 0,
      onLeaveToday: onLeave?.count || 0,
      pendingLeaves: pendingLeaves?.count || 0
    };
  }
};
