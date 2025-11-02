import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';

async function exportUsers() {
  // buka koneksi ke database SQLite
  const db = await open({
    filename: './database.sqlite', // ubah path jika perlu
    driver: sqlite3.Database
  });

  console.log('🟡 Mengambil data dari tabel users...');

  // ambil semua data dari tabel users
  const users = await db.all('SELECT * FROM users');

  if (!users || users.length === 0) {
    console.log('⚠️ Tidak ada data di tabel users.');
    await db.close();
    return;
  }

  // simpan ke file JSON
  fs.writeFileSync('users.seed.json', JSON.stringify(users, null, 2), 'utf-8');

  console.log(`✅ Berhasil mengekspor ${users.length} data users ke file users.seed.json`);

  await db.close();
}

exportUsers().catch(err => console.error(err));
