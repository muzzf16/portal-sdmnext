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
  async findAll() {
    const db = await openDb();
    const rows = await db.all(`
      SELECT p.*, 
        j.nama as jabatanNama, j.level as jabatanLevel, j.department as jabatanDepartment,
        a.name as atasanNama
      FROM pegawai p
      LEFT JOIN jabatan j ON p.jabatan_id = j.id
      LEFT JOIN pegawai a ON p.atasan_id = a.id
      ORDER BY p.name ASC
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
    const nip = data.nip || await this.generateNip();
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
      'jenis_kelamin', 'tanggalKeluar', 'jabatan_id', 'atasan_id'
    ];

    const fieldsToUpdate: any = {};
    for (const key of Object.keys(data)) {
      if (validColumns.includes(key)) {
        fieldsToUpdate[key] = data[key];
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

    const rows = await db.all(`
      SELECT p.*, 
        j.nama as jabatanNama, j.level as jabatanLevel, j.department as jabatanDepartment
      FROM pegawai p
      LEFT JOIN jabatan j ON p.jabatan_id = j.id
      WHERE j.parent_id = ? AND (p.isActive = 1 OR p.statusKaryawan = 'aktif')
      ORDER BY p.name ASC
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

    // Total subordinates
    const total = await db.get(
      `SELECT COUNT(*) as count 
       FROM pegawai p
       JOIN jabatan j ON p.jabatan_id = j.id 
       WHERE j.parent_id = ? AND (p.isActive = 1 OR p.statusKaryawan = 'aktif')`,
      supervisorJabatanId
    );

    // Attendance today (present)
    const today = new Date().toISOString().split('T')[0];
    const present = await db.get(
      `SELECT COUNT(a.id) as count 
       FROM absensi a
       JOIN pegawai p ON a.employeeId = p.id
       JOIN jabatan j ON p.jabatan_id = j.id
       WHERE j.parent_id = ? AND a.date = ? AND a.status = 'hadir'`,
      supervisorJabatanId, today
    );

    // On leave/sick/permission today
    const onLeave = await db.get(
      `SELECT COUNT(a.id) as count 
       FROM absensi a
       JOIN pegawai p ON a.employeeId = p.id
       JOIN jabatan j ON p.jabatan_id = j.id
       WHERE j.parent_id = ? AND a.date = ? AND a.status IN ('izin', 'sakit', 'cuti')`,
      supervisorJabatanId, today
    );

    // Pending leave requests
    const pendingLeaves = await db.get(
      `SELECT COUNT(c.id) as count
       FROM permintaan_cuti c
       JOIN pegawai p ON c.employeeId = p.id
       JOIN jabatan j ON p.jabatan_id = j.id
       WHERE j.parent_id = ? AND c.status = 'menunggu'`,
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
