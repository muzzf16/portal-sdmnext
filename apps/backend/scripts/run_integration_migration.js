const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const sqlPath = path.resolve(__dirname, '../db/migrations/20260301_create_integration_tables.sql');

console.log('Connecting to database:', dbPath);
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});

const sql = fs.readFileSync(sqlPath, 'utf8');

db.exec(sql, (err) => {
    if (err) {
        console.error('Error running migration:', err.message);
        db.close();
        process.exit(1);
    }
    console.log('Migration completed successfully. Created api_keys and integration_logs tables.');

    // Create a dummy API key for testing
    const bcrypt = require('bcryptjs');
    const saltRounds = 10;
    const rawKey = 'test-api-key-12345';

    bcrypt.hash(rawKey, saltRounds, (err, hash) => {
        if (err) {
            console.error('Error hashing dummy key:', err);
            db.close();
        } else {
            console.log(`Creating dummy API key... (Raw key: ${rawKey})`);
            db.run(
                `INSERT INTO api_keys (name, key_hash, status) VALUES (?, ?, ?)`,
                ['Sistem Test', hash, 'aktif'],
                function (err) {
                    if (err) {
                        console.error('Error inserting dummy key:', err.message);
                    } else {
                        console.log(`Dummy API key created successfully with ID: ${this.lastID}`);
                    }
                    db.close((err) => {
                        if (err) {
                            console.error('Error closing database:', err.message);
                        } else {
                            console.log('Database connection closed.');
                        }
                    });
                }
            );
        }
    });
});
