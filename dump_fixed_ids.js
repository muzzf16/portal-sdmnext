const sqlite3 = require('sqlite3').verbose();
const dbPath = '/data/database.sqlite';
const db = new sqlite3.Database(dbPath);

db.all("SELECT * FROM activity_library WHERE id LIKE 'acti-fix-%' OR id IS NULL OR id = '' LIMIT 50", (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log(`Found ${rows.length} rows.`);
        console.log(JSON.stringify(rows, null, 2));
    }
    db.close();
});
