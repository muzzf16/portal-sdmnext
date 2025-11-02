import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';

interface UserSeed {
  id?: number;
  nama?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  employeeId?: number | null;
  createdAt?: string;
}

async function importUsersToPengguna() {
  // buka koneksi database SQLite
  const db = await open({
    filename: './database.sqlite', // sesuaikan path jika perlu
    driver: sqlite3.Database
  });

  // pastikan file seed ada
  if (!fs.existsSync('users.seed.json')) {
    console.error('❌ File users.seed.json tidak ditemukan.');
    process.exit(1);
  }

  // baca file JSON
  const raw = fs.readFileSync('users.seed.json', 'utf-8');
  const users: UserSeed[] = JSON.parse(raw);

  if (!Array.isArray(users) || users.length === 0) {
    console.error('⚠️ File users.seed.json kosong atau tidak valid.');
    await db.close();
    return;
  }

  console.log(`🟡 Menyisipkan ${users.length} data ke tabel pengguna...`);

  // opsional: bersihkan tabel pengguna dulu
  await db.exec('DELETE FROM pengguna;');

  // mulai transaksi
  await db.exec('BEGIN TRANSACTION');

  try {
    const insertSQL = `
      INSERT INTO pengguna (id, name, email, password, role, employeeId, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    for (const user of users) {
      await db.run(insertSQL, [
        user.id ?? null,
        user.name ?? user.nama ?? 'Tanpa Nama',
        user.email ?? null,
        user.password ?? null,
        user.role ?? 'employee',
        user.employeeId ?? null,
        user.createdAt ?? new Date().toISOString()
      ]);
    }

    await db.exec('COMMIT');
    console.log('✅ Data users berhasil diimpor ke tabel pengguna!');
  } catch (error) {
    await db.exec('ROLLBACK');
    console.error('❌ Gagal impor data pengguna:', error);
  }

  await db.close();
}

importUsersToPengguna().catch(err => console.error(err));
