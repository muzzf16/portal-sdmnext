const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/data/database.sqlite');

db.get("SELECT COUNT(*) as cnt FROM activity_library WHERE id IS NULL OR id = ''", (err, row) => {
    if (err) { console.error(err); db.close(); return; }
    console.log(`Ditemukan ${row.cnt} data dengan ID null/kosong.`);
    if (row.cnt > 0) {
        db.run("DELETE FROM activity_library WHERE id IS NULL OR id = ''", function(err2) {
            if (err2) console.error(err2);
            else console.log(`Berhasil menghapus ${this.changes} data.`);
            db.close();
        });
    } else {
        console.log('Tidak ada data bermasalah. Database bersih.');
        db.close();
    }
});
