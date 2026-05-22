/**
 * Database Health Check Script
 * Runs inside Docker container to verify database integrity.
 * 
 * Usage (from host):
 *   docker cp apps/backend/scripts/check_db.js portal_sdm_backend:/app/check_db.js
 *   docker exec portal_sdm_backend node /app/check_db.js
 * 
 * Or via deploy.ps1:
 *   .\deploy.ps1 -CheckDb
 */
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const DB_PATH = process.env.DB_SOURCE || '/data/database.sqlite';
const FIX_MODE = process.argv.includes('--fix');

let exitCode = 0;

function ok(msg) { console.log(`  ✓ ${msg}`); }
function warn(msg) { console.log(`  ⚠ ${msg}`); exitCode = 1; }
function info(msg) { console.log(`  ℹ ${msg}`); }

(async () => {
    console.log(`\n=== Database Health Check ===`);
    console.log(`DB: ${DB_PATH}`);
    console.log(`Mode: ${FIX_MODE ? 'FIX (will auto-repair)' : 'CHECK ONLY (use --fix to repair)'}\n`);

    const db = await open({ filename: DB_PATH, driver: sqlite3.Database });

    // 1. Check all expected tables exist
    console.log('--- Table Check ---');
    const expectedTables = [
        'pegawai', 'pengguna', 'users', 'absensi', 'permintaan_cuti',
        'penggajian', 'penilaian_kinerja', 'kontrak', 'pelatihan',
        'riwayat_jabatan', 'tugas_orientasi', 'notifications',
        'pinjaman_karyawan', 'activity_library', 'kpi_targets',
        'log_aktivitas_harian', 'company_settings',
        'kredit_berkas', 'kredit_berkas_tracking'
    ];

    const existingTables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames = existingTables.map(t => t.name);

    for (const t of expectedTables) {
        if (tableNames.includes(t)) {
            const count = await db.get(`SELECT COUNT(*) as cnt FROM "${t}"`);
            ok(`${t} (${count.cnt} rows)`);
        } else {
            warn(`MISSING: ${t}`);
        }
    }

    // 2. Check for NULL primary keys in key tables
    console.log('\n--- NULL Primary Key Check ---');
    const pkChecks = [
        { table: 'pegawai', pk: 'id' },
        { table: 'activity_library', pk: 'id' },
        { table: 'users', pk: 'id' },
        { table: 'absensi', pk: 'id' },
        { table: 'penggajian', pk: 'id' },
        { table: 'kpi_targets', pk: 'id_kpi_target' },
        { table: 'kredit_berkas', pk: 'id' },
    ];

    for (const { table, pk } of pkChecks) {
        if (!tableNames.includes(table)) continue;

        try {
            const nullCount = await db.get(
                `SELECT COUNT(*) as cnt FROM "${table}" WHERE "${pk}" IS NULL OR "${pk}" = ''`
            );

            if (nullCount.cnt > 0) {
                warn(`${table}.${pk}: ${nullCount.cnt} NULL/empty values found!`);

                if (FIX_MODE) {
                    // Auto-fix by generating IDs
                    const nullRows = await db.all(`SELECT rowid FROM "${table}" WHERE "${pk}" IS NULL OR "${pk}" = ''`);
                    for (const row of nullRows) {
                        const abbr = table.substring(0, 4);
                        const newId = `${abbr}-fix-${row.rowid}`;
                        await db.run(`UPDATE "${table}" SET "${pk}" = ? WHERE rowid = ?`, newId, row.rowid);
                    }
                    ok(`  Fixed ${nullCount.cnt} records in ${table}`);
                }
            } else {
                ok(`${table}.${pk}: all values present`);
            }
        } catch (e) {
            // Column might not exist
            info(`${table}.${pk}: column check skipped (${e.message})`);
        }
    }

    // 3. Check schema details for activity_library
    console.log('\n--- Activity Library Schema ---');
    if (tableNames.includes('activity_library')) {
        const schema = await db.get("SELECT sql FROM sqlite_master WHERE name='activity_library'");
        const cols = await db.all("PRAGMA table_info(activity_library)");
        const colNames = cols.map(c => `${c.name}(${c.type}${c.pk ? ',PK' : ''})`);
        info(`Columns: ${colNames.join(', ')}`);
    }

    // 4. Foreign key check
    console.log('\n--- Foreign Key Integrity ---');
    try {
        const fkErrors = await db.all("PRAGMA foreign_key_check");
        if (fkErrors.length === 0) {
            ok('All foreign keys valid');
        } else {
            warn(`${fkErrors.length} foreign key violations found`);
            fkErrors.slice(0, 5).forEach(e => info(`  ${e.table} row ${e.rowid} -> ${e.parent}`));
        }
    } catch (e) {
        info('Foreign key check skipped');
    }

    await db.close();

    console.log(`\n=== Health Check Complete (exit: ${exitCode}) ===\n`);
    process.exit(exitCode);
})();
