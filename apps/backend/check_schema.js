const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

(async () => {
    try {
        const db = await open({ filename: './database.sqlite', driver: sqlite3.Database });

        // Cek struktur tabel pegawai
        console.log('--- PEGAWAI SCH ---');
        const sch = await db.all("PRAGMA table_info(pegawai);");
        console.table(sch);

        await db.close();
    } catch (e) {
        console.error(e);
    }
})();
