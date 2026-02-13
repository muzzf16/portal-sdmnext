
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const migrationPath = path.resolve(__dirname, 'db/migrations/20260213_create_workload_tables.sql');
const migrationSql = fs.readFileSync(migrationPath, 'utf8');

db.serialize(() => {
    db.exec(migrationSql, (err) => {
        if (err) {
            console.error('Migration failed:', err.message);
        } else {
            console.log('Migration successful');
        }
        db.close();
    });
});
