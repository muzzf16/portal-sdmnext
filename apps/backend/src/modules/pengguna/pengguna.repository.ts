
import { openDb } from '../../config/db';
import bcrypt from 'bcrypt';
import { PegawaiRepository } from '../pegawai/pegawai.repository'; // Assuming PegawaiRepository is available

export const PenggunaRepository = {
  async findAll() {
    const db = await openDb();
    return db.all('SELECT * FROM pengguna');
  },

  async findById(id: string) {
    const db = await openDb();
    return db.get('SELECT * FROM pengguna WHERE id = ?', id);
  },

  async findByEmail(email: string) {
    const db = await openDb();
    return db.get('SELECT * FROM pengguna WHERE email = ?', email);
  },

  async create(userData: any) {
    const db = await openDb();
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newUserId = `user-${Date.now()}`;

    // Start transaction
    await db.run('BEGIN TRANSACTION');

    try {
      if (userData.employeeId) {
        // If employeeId is provided, link to existing employee
        await db.run(
          'INSERT INTO pengguna (id, name, email, password, role, employeeId) VALUES (?,?,?,?,?,?)',
          [newUserId, userData.name, userData.email, hashedPassword, userData.role || 'employee', userData.employeeId]
        );
      } else {
        // If no employeeId provided, create both user and employee record
        const newEmployeeId = `emp-${Date.now()}`;

        // Create a new employee record
        const newEmployeeData = {
          id: newEmployeeId,
          name: userData.name,
          nip: `NIP${Date.now().toString().slice(-4)}`,
          position: 'Staf Junior',
          pangkat: 'Staf',
          golongan: 'II/a',
          department: 'Belum Ditentukan',
          joinDate: new Date().toISOString().split('T')[0],
          avatarUrl: `/avatars/default-avatar.jpg`,
          leaveBalance: 18,
          isActive: 1,
          address: '',
          phone: '',
          pob: '',
          dob: '',
          religion: 'Lainnya',
          maritalStatus: 'Lajang',
          numberOfChildren: 0,
          educationHistory: '[]',
          workHistory: '[]',
          trainingCertificates: '[]',
          payrollInfo: JSON.stringify({ baseSalary: 5000000, incomes: [], deductions: [] })
        };

        // Insert employee
        const empColumns = Object.keys(newEmployeeData);
        const empPlaceholders = empColumns.map(() => '?').join(',');
        await db.run(
          `INSERT INTO pegawai (${empColumns.join(',')}) VALUES (${empPlaceholders})`,
          Object.values(newEmployeeData)
        );

        // Insert user
        await db.run(
          'INSERT INTO pengguna (id, name, email, password, role, employeeId) VALUES (?,?,?,?,?,?)',
          [newUserId, userData.name, userData.email, hashedPassword, userData.role || 'employee', newEmployeeId]
        );
      }

      await db.run('COMMIT');

      // Return the created user with employee details (if any)
      const user = await db.get('SELECT * FROM pengguna WHERE id = ?', newUserId);
      if (user.employeeId) {
        const employee = await PegawaiRepository.findById(user.employeeId);
        user.employeeDetails = employee;
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  },

  async authenticate(email: string, password: string) {
    const db = await openDb();
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error("User not found.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials.");
    }

    const employee = await PegawaiRepository.findById(user.employeeId);
    user.employeeDetails = employee;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async findAdminUsers() {
    const db = await openDb();
    return db.all("SELECT * FROM pengguna WHERE role = 'admin'");
  },

  async update(id: string, data: any) {
    const db = await openDb();

    // Filter allowed fields
    const allowedFields = ['name', 'email', 'role', 'employeeId', 'avatarUrl'];
    const updates: string[] = [];
    const values: any[] = [];

    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key) && data[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    if (updates.length === 0) return await this.findById(id);

    values.push(id);

    const result = await db.run(
      `UPDATE pengguna SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.changes === 0) throw new Error('User not found');

    const updatedUser = await this.findById(id);
    return updatedUser;
  },

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const db = await openDb();
    const user = await db.get('SELECT * FROM pengguna WHERE id = ?', id);
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error('Password saat ini salah');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.run('UPDATE pengguna SET password = ? WHERE id = ?', [hashedPassword, id]);
    return { message: 'Password berhasil diubah' };
  },

  async delete(id: string) {
    const db = await openDb();
    const result = await db.run('DELETE FROM pengguna WHERE id = ?', id);
    return !!(result.changes && result.changes > 0);
  }
};
