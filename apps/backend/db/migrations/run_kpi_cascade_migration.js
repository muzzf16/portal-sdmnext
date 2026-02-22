/**
 * Migration: Cascading KPI Targets (Gap 7) + Evidence URL (Gap 5)
 * 
 * Creates optional organizational/department KPI tables and adds
 * parentKpiId + evidenceUrl columns to kpi_targets.
 * 
 * Run: node db/migrations/run_kpi_cascade_migration.js
 */
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

(async () => {
    const db = await open({ filename: './database.sqlite', driver: sqlite3.Database });

    // 1. Create organizational_kpi table (optional — for future cascading targets)
    const createOrgKpi = `
        CREATE TABLE IF NOT EXISTS organizational_kpi (
            id TEXT PRIMARY KEY,
            year INTEGER NOT NULL,
            kpiName TEXT NOT NULL,
            targetValue REAL DEFAULT 0,
            targetUnit TEXT DEFAULT '%',
            weight REAL DEFAULT 0,
            actualValue REAL DEFAULT 0,
            score REAL DEFAULT 0,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // 2. Create department_kpi table (linked to organizational_kpi)
    const createDeptKpi = `
        CREATE TABLE IF NOT EXISTS department_kpi (
            id TEXT PRIMARY KEY,
            orgKpiId TEXT,
            department TEXT NOT NULL,
            year INTEGER NOT NULL,
            kpiName TEXT NOT NULL,
            targetValue REAL DEFAULT 0,
            targetUnit TEXT DEFAULT '%',
            weight REAL DEFAULT 0,
            actualValue REAL DEFAULT 0,
            score REAL DEFAULT 0,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (orgKpiId) REFERENCES organizational_kpi(id) ON DELETE SET NULL
        )
    `;

    // 3. ALTER kpi_targets to add optional parentKpiId + evidenceUrl
    const alterStatements = [
        "ALTER TABLE kpi_targets ADD COLUMN parentKpiId TEXT",
        "ALTER TABLE kpi_targets ADD COLUMN evidenceUrl TEXT"
    ];

    // Execute creates
    try {
        await db.run(createOrgKpi);
        console.log('OK: Created organizational_kpi table');
    } catch (e) {
        console.log('SKIP:', e.message);
    }

    try {
        await db.run(createDeptKpi);
        console.log('OK: Created department_kpi table');
    } catch (e) {
        console.log('SKIP:', e.message);
    }

    // Execute alters (safe — skip if column already exists)
    for (const s of alterStatements) {
        try {
            await db.run(s);
            console.log('OK:', s.substring(0, 65));
        } catch (e) {
            console.log('SKIP (exists):', s.substring(0, 65), '-', e.message);
        }
    }

    // Verify
    const cols = await db.all("PRAGMA table_info(kpi_targets)");
    const colNames = cols.map(c => c.name);
    console.log('\nkpi_targets columns:', colNames.join(', '));

    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%kpi%'");
    console.log('KPI-related tables:', tables.map(t => t.name).join(', '));

    await db.close();
    console.log('\nMigration complete.');
})();
