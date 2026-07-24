import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = process.env.DB_SOURCE || path.resolve(__dirname, '../../database.sqlite');
console.log(`Using database: ${dbPath}`);
const db = new sqlite3.Database(dbPath);

const query = `
  SELECT DISTINCT al.position, 
         (SELECT COUNT(*) FROM pegawai p WHERE LOWER(p.position) = LOWER(al.position)) as pegawai_count,
         (SELECT COUNT(*) FROM jabatan j WHERE LOWER(j.nama) = LOWER(al.position)) as jabatan_count,
         (SELECT COUNT(*) FROM log_aktivitas_harian l WHERE l.id_activity_library IN (SELECT id FROM activity_library WHERE position = al.position)) as wla_count,
         (SELECT COUNT(*) FROM activity_library WHERE position = al.position) as activity_count
  FROM activity_library al
  ORDER BY al.position ASC;
`;

db.all(query, [], (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  
  const orphans = rows.filter((r: any) => r.pegawai_count === 0 && r.jabatan_count === 0);
  
  console.log(`\n--- ALL POSITIONS IN ACTIVITY LIBRARY ---`);
  rows.forEach((r: any) => {
    console.log(`- ${r.position}: ${r.activity_count} activities | ${r.pegawai_count} pegawai | ${r.jabatan_count} jabatan | ${r.wla_count} WLA logs`);
  });
  
  console.log(`\n--- ORPHANED POSITIONS (No Pegawai & No Jabatan) ---`);
  orphans.forEach((r: any) => {
    console.log(`- ${r.position}: ${r.activity_count} activities | ${r.wla_count} WLA logs`);
  });
  
  console.log(`\nTotal orphaned positions: ${orphans.length}`);
});
