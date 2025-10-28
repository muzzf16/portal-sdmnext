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
  }));
};

export const PegawaiRepository = {
  async findAll() {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM pegawai ORDER BY name ASC');
    return parseJsonFields(rows);
  },

  async findById(id: string) {
    const db = await openDb();
    const row = await db.get('SELECT * FROM pegawai WHERE id = ?', id);
    if (!row) return null;
    return parseJsonFields([row])[0];
  },

  async findByEmail(email: string) {
    const db = await openDb();
    const row = await db.get('SELECT * FROM pegawai WHERE email = ?', email);
    if (!row) return null;
    return parseJsonFields([row])[0];
  },

  async create(data: any) {
    const db = await openDb();
    const newId = data.id || `emp-${Date.now()}`;
    const pegawaiData = {
      id: newId,
      name: data.name,
      nip: data.nip || `NIP${Date.now().toString().slice(-4)}`,
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
      'jenis_kelamin'
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
  }
};
