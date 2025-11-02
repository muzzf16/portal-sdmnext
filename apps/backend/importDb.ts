import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';

interface Pegawai {
  [key: string]: any;
}

async function importPegawai() {
  // buka koneksi database SQLite
  const db = await open({
    filename: './database.sqlite', // ubah path jika perlu
    driver: sqlite3.Database
  });

  // baca file seed JSON
  const raw = fs.readFileSync('pegawai.seed.json', 'utf-8');
  const data: Pegawai[] = JSON.parse(raw);

  if (!Array.isArray(data) || data.length === 0) {
    console.log('⚠️ Tidak ada data di file pegawai.seed.json');
    return;
  }

  // ambil nama kolom dari data pertama
  const columns = Object.keys(data[0]);
  const placeholders = columns.map(() => '?').join(',');
  const insertSQL = `INSERT INTO pegawai (${columns.join(',')}) VALUES (${placeholders})`;

  console.log(`🟡 Menyisipkan ${data.length} data pegawai...`);

  // mulai transaksi
  await db.exec('BEGIN TRANSACTION');

  try {
    for (const row of data) {
      const values = columns.map(c => row[c]);
      await db.run(insertSQL, values);
    }

    await db.exec('COMMIT');
    console.log('✅ Data pegawai berhasil diimpor!');
  } catch (error) {
    await db.exec('ROLLBACK');
    console.error('❌ Gagal impor data pegawai:', error);
  }

  await db.close();
}

importPegawai().catch(err => console.error(err));
