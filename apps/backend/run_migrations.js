/**
 * Safe Migration Runner for Docker
 * 
 * Improvements over previous version:
 * - Checks existing schema before running CREATE TABLE
 * - Skips seed INSERT if data already exists
 * - Tracks which migrations have been applied
 * - Logs all operations
 * 
 * Usage:
 *   docker exec portal_sdm_backend node /app/run_migrations.js
 *   
 * Or via deploy.ps1:
 *   .\deploy.ps1 -RunMigration
 */
const fs = require('fs');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const DB_PATH = process.env.DB_SOURCE || '/data/database.sqlite';
const MIGRATIONS_DIR = path.join(__dirname, 'db', 'migrations');

function ok(msg) { console.log(`  ✓ ${msg}`); }
function skip(msg) { console.log(`  ⊘ ${msg}`); }
function info(msg) { console.log(`  ℹ ${msg}`); }
function err(msg) { console.log(`  ✗ ${msg}`); }

(async () => {
    console.log('\n=== Safe Migration Runner ===');
    console.log(`DB: ${DB_PATH}\n`);

    const db = await open({ filename: DB_PATH, driver: sqlite3.Database });

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');

    // Create migration tracking table if not exists
    await db.exec(`
        CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT UNIQUE NOT NULL,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Get existing tables
    const existingTables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames = existingTables.map(t => t.name);
    info(`Existing tables: ${tableNames.length}`);

    // Get already-applied migrations
    const applied = await db.all('SELECT filename FROM _migrations');
    const appliedSet = new Set(applied.map(m => m.filename));

    // Find SQL migration files (sorted by name)
    const sqlFiles = fs.readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith('.sql'))
        .sort();

    console.log(`\nFound ${sqlFiles.length} SQL migration files\n`);

    for (const filename of sqlFiles) {
        console.log(`--- ${filename} ---`);

        if (appliedSet.has(filename)) {
            skip('Already applied');
            continue;
        }

        const filepath = path.join(MIGRATIONS_DIR, filename);
        const sql = fs.readFileSync(filepath, 'utf8');
        const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

        let executed = 0;
        let skipped = 0;
        let errors = 0;

        for (const stmt of statements) {
            const upperStmt = stmt.toUpperCase();

            try {
                // Check if it's a CREATE TABLE IF NOT EXISTS — safe to run
                if (upperStmt.includes('CREATE TABLE IF NOT EXISTS')) {
                    await db.exec(stmt);
                    executed++;
                }
                // Skip INSERT INTO if table already has data (seed protection)
                else if (upperStmt.startsWith('INSERT INTO') || upperStmt.startsWith('INSERT OR IGNORE INTO')) {
                    const match = stmt.match(/INSERT\s+(?:OR\s+\w+\s+)?INTO\s+(\w+)/i);
                    if (match) {
                        const tableName = match[1];
                        const count = await db.get(`SELECT COUNT(*) as cnt FROM "${tableName}"`);
                        if (count && count.cnt > 0) {
                            skipped++;
                            continue; // Skip seed — data already exists
                        }
                    }
                    await db.exec(stmt);
                    executed++;
                }
                // ALTER TABLE, CREATE INDEX, etc — try and catch
                else {
                    await db.exec(stmt);
                    executed++;
                }
            } catch (e) {
                // Common safe-to-skip errors
                if (e.message.includes('already exists') ||
                    e.message.includes('duplicate column') ||
                    e.message.includes('UNIQUE constraint')) {
                    skipped++;
                } else {
                    err(`${e.message} (${stmt.substring(0, 60)}...)`);
                    errors++;
                }
            }
        }

        // Record migration as applied
        try {
            await db.run('INSERT INTO _migrations (filename) VALUES (?)', filename);
        } catch (e) {
            // Already exists, ignore
        }

        ok(`Executed: ${executed}, Skipped: ${skipped}, Errors: ${errors}`);
    }

    // Final table count
    const finalTables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log(`\n=== Done. Total tables: ${finalTables.length} ===`);
    console.log('Tables:', finalTables.map(t => t.name).join(', '));

    await db.close();
})();
