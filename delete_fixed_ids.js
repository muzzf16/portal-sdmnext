const sqlite3 = require('sqlite3').verbose();
const dbPath = '/data/database.sqlite';
const db = new sqlite3.Database(dbPath);

db.run("DELETE FROM activity_library WHERE id LIKE 'acti-fix-%'", function(err) {
    if (err) {
        console.error(err);
    } else {
        console.log(`Successfully deleted ${this.changes} rows.`);
    }
    db.close();
});
