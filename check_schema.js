const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = '/data/database.sqlite';
const db = new sqlite3.Database(dbPath);

db.all("PRAGMA table_info(activity_library)", (err, rows) => {
    if (err) console.error(err);
    else console.log("Columns:", rows.map(r => r.name));
});

db.all("SELECT * FROM activity_library LIMIT 3", (err, rows) => {
    if (err) console.error(err);
    else console.log("Rows:", rows);
});
