// apps/backend/db/reset.ts
import { openDb } from '../src/config/db';
import fs from 'fs';
import path from 'path';
import { seedDatabase } from './seed';

export const resetDatabase = async () => {
  const db = await openDb();

  // List of tables to clear
  const tables = [
    'absensi', 'penilaian_kinerja', 'penggajian', 'permintaan_cuti', 
    'pengguna', 'pegawai', 'riwayat_jabatan', 'pelatihan', 'kandidat', 
    'tugas_orientasi', 'notifikasi', 'kontrak'
  ];

  // Clear all tables
  for (const table of tables) {
    try {
      await db.run(`DELETE FROM ${table}`);
      console.log(`Cleared table: ${table}`);
    } catch (err) {
      console.log(`Table ${table} might not exist yet:`, err);
    }
  }

  // Run seed after clearing tables
  await seedDatabase(path.join(__dirname, '..', 'db.json'));
};

if (require.main === module) {
  (async () => {
    try {
      await resetDatabase();
      console.log('Database reset and seeded successfully.');
    } catch (error) {
      console.error('Database reset failed:', error);
      process.exit(1);
    }
  })();
}