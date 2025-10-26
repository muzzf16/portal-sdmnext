// apps/backend/db/seed.ts
import { openDb } from '../src/config/db';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import config from '../src/config/config';

export const seedDatabase = async (dbJsonSeedSource: string) => {
  const db = await openDb();

  const row = await db.get("SELECT COUNT(*) as count FROM pengguna");
  if (row.count === 0) {
    console.log("Database is empty. Seeding from db.json...");
    try {
      const seedData = JSON.parse(fs.readFileSync(dbJsonSeedSource, 'utf8'));

      const insertStmt = (table: string, keys: string[]) => `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;

      // Seed Users
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync('password123', salt); // Default password for all
      for (const u of seedData.users) {
        await db.run(insertStmt('pengguna', ['id', 'name', 'email', 'password', 'role', 'employeeId']),
          u.id, u.name, u.email, hashedPassword, u.role, u.employeeDetails.id);
      }

      // Seed Employees
      for (const e of seedData.employees) {
        await db.run(insertStmt('pegawai', ['id', 'name', 'nip', 'position', 'pangkat', 'golongan', 'department', 'joinDate', 'avatarUrl', 'leaveBalance', 'isActive', 'address', 'phone', 'pob', 'dob', 'religion', 'maritalStatus', 'numberOfChildren', 'educationHistory', 'workHistory', 'trainingCertificates', 'payrollInfo']),
          e.id, e.name, e.nip, e.position, e.pangkat, e.golongan, e.department, e.joinDate, e.avatarUrl, e.leaveBalance, e.isActive ? 1 : 0, e.address, e.phone, e.pob, e.dob, e.religion, e.maritalStatus, e.numberOfChildren, JSON.stringify(e.educationHistory), JSON.stringify(e.workHistory), JSON.stringify(e.trainingCertificates), JSON.stringify(e.payrollInfo));
      }

      // Seed Leave Requests
      for (const r of seedData.leaveRequests) {
        await db.run(insertStmt('permintaan_cuti', ['id', 'employeeId', 'employeeName', 'leaveType', 'startDate', 'endDate', 'reason', 'status', 'supportingDocument', 'rejectionReason']),
          r.id, r.employeeId, r.employeeName, r.leaveType, r.startDate, r.endDate, r.reason, r.status, r.supportingDocument, r.rejectionReason);
      }

      // Seed Payrolls
      for (const p of seedData.payrolls) {
        await db.run(insertStmt('penggajian', ['id', 'employeeId', 'employeeName', 'period', 'baseSalary', 'incomes', 'deductions', 'totalIncome', 'totalDeductions', 'netSalary']),
          p.id, p.employeeId, p.employeeName, p.period, p.baseSalary, JSON.stringify(p.incomes), JSON.stringify(p.deductions), p.totalIncome, p.totalDeductions, p.netSalary);
      }

      // Seed Performance Reviews
      for (const pr of seedData.performanceReviews) {
        await db.run(insertStmt('penilaian_kinerja', ['id', 'employeeId', 'employeeName', 'period', 'reviewerName', 'reviewDate', 'overallScore', 'status', 'strengths', 'areasForImprovement', 'employeeFeedback', 'kpis']),
          pr.id, pr.employeeId, pr.employeeName, pr.period, pr.reviewerName, pr.reviewDate, pr.overallScore, pr.status, pr.strengths, pr.areasForImprovement, pr.employeeFeedback, JSON.stringify(pr.kpis));
      }

      // Seed Attendance
      for (const a of seedData.attendance) {
        await db.run(insertStmt('absensi', ['id', 'employeeId', 'employeeName', 'date', 'clockIn', 'clockOut', 'status', 'workDuration']),
          a.id, a.employeeId, a.employeeName, a.date, a.clockIn, a.clockOut, a.status, a.workDuration);
      }

      console.log("Database seeded successfully.");
    } catch (seedErr: any) {
      console.error("Error reading or parsing seed file:", seedErr);
    }
  } else {
    console.log("Database already contains data. Skipping seed.");
  }
};

if (require.main === module) {
  (async () => {
    try {
      // Assuming db.json is the default seed source
      await seedDatabase(path.join(__dirname, '..', 'db.json'));
      console.log('Database seeding complete.');
    } catch (error) {
      console.error('Database seeding failed:', error);
      process.exit(1);
    }
  })();
}