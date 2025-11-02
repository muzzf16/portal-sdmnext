import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';

async function exportPegawai() {
  // buka koneksi database SQLite
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  // ambil semua data dari tabel pegawai
  const rows = await db.all('SELECT * FROM employees');

  // simpan ke file JSON
  fs.writeFileSync('pegawai.seed.json', JSON.stringify(rows, null, 2), 'utf-8');

  console.log(`✅ Berhasil mengekspor ${rows.length} data pegawai ke file pegawai.seed.json`);
  await db.close();
}

exportPegawai().catch(console.error);
