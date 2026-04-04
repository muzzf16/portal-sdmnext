import { openDb } from '../../config/db';

export const DashboardRepository = {
  async getRecentActivity() {
    const db = await openDb();
    const newEmployees = await db.all(`
      SELECT 'Pegawai baru ditambahkan' as action, name as user, createdAt as time
      FROM pegawai
      ORDER BY createdAt DESC
      LIMIT 5
    `);
    const leaveRequests = await db.all(`
      SELECT 'Pengajuan cuti ' || lower(status) as action, employeeName as user, createdAt as time
      FROM permintaan_cuti
      WHERE status IN ('Disetujui', 'Ditolak', 'disetujui', 'ditolak')
      ORDER BY createdAt DESC
      LIMIT 5
    `);
    const payrolls = await db.all(`
      SELECT 'Gaji ' || period || ' diproses' as action, 'Sistem' as user, createdAt as time
      FROM penggajian
      ORDER BY createdAt DESC
      LIMIT 5
    `);
    const contracts = await db.all(`
      SELECT 'Kontrak ' || k.contractType || ' diperpanjang' as action,
             COALESCE(p.name, k.employeeId) as user,
             k.createdAt as time
      FROM kontrak k
      LEFT JOIN pegawai p ON k.employeeId = p.id
      WHERE k.status = 'active'
      ORDER BY k.createdAt DESC
      LIMIT 5
    `);

    const activities = [...newEmployees, ...leaveRequests, ...payrolls, ...contracts];
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    return activities.slice(0, 10);
  }
};