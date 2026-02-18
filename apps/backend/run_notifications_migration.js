const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const migrationPath = path.resolve(__dirname, 'db/migrations/20260218_notifications_schema.sql');
const migrationSql = fs.readFileSync(migrationPath, 'utf8');

db.serialize(() => {
    // Split by semicolon to handle multiple statements if needed, though exec usually handles it
    db.exec(migrationSql, (err) => {
        if (err) {
            // Ignore error if column already exists (duplicate column name)
            if (err.message.includes('duplicate column name')) {
                console.log('Column created_at already exists. Skipping...');
            } else {
                console.error('Migration failed:', err.message);
                process.exit(1);
            }
        } else {
            console.log('Migration successful: created_at column added to notifications');
        }
        db.close();
    });
});
