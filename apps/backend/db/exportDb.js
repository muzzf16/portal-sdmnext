const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');

async function exportPegawai() {
  try {
    // buka koneksi database SQLite
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    console.log('Connected to database.');

    // Cek tabel yang ada dulu
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables found:', tables.map(t => t.name).join(', '));

    // Coba ambil data pegawai
    const rows = await db.all('SELECT * FROM pegawai');

    // simpan ke file JSON
    fs.writeFileSync('pegawai.seed.json', JSON.stringify(rows, null, 2), 'utf-8');

    console.log(`✅ Berhasil mengekspor ${rows.length} data pegawai ke file pegawai.seed.json`);
    await db.close();
  } catch (error) {
    console.error('Error exporting database:', error);
  }
}

exportPegawai();
