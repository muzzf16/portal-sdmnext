/**
 * Script: Sinkronisasi data pegawai ke jabatan
 * Assign jabatan_id berdasarkan matching position pegawai → nama jabatan
 * 
 * Usage: node db/migrations/sync_pegawai_jabatan.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Mapping posisi pegawai → nama jabatan di tabel jabatan
// Adjust these mappings based on actual data
const positionToJabatanMap = {
    // Level 2: Kepala Bidang
    'PE PELAYANAN & UMUM': 'KABID Umum & SDM',
    'KABID PEMASARAN DAN ANALIS KREDIT': 'KABID Kredit',
    'KABID PEMBINAAN NASABAH': 'KABID Dana',
    'PE KEPATUHAN & MENRISK': 'KABID Kepatuhan',

    // Level 3: Kasubid
    'KASUBID ADMIN KREDIT': 'Kasubid Adminitrasi Kredit',
    'KASUBID KANTOR KAS': 'Kasubid Umum Kepala kantor kas',
    'KASUBID CS': 'Kasubid CS',
    'KASUBID TELLER': 'Kasubid Teller',

    // Level 4: Staf
    'STAF PEMBINAAN NASABAH': 'Funding Officer',
    'STAF IT': 'Staf Pelaporan Dan IT',
    'STAF UMUM': 'Staf Umum',
    'STAF MARKETING': 'Account Officer',
    'STAF ADMIN KREDIT': 'Account Officer',
    'TELLER': 'Teller',
    'CUSTOMER SERVICE': 'Customer Service',
    'STAF SDM': 'Staf SDM',
    'STAF KEPATUHAN': 'Staf Kepatuhan',
};

db.serialize(() => {
    console.log('=== Sinkronisasi Pegawai → Jabatan ===\n');

    // 1. Load all jabatan
    db.all('SELECT id, nama, level, department FROM jabatan', (err, jabatanList) => {
        if (err) { console.error('Error loading jabatan:', err); return; }

        console.log(`Jabatan tersedia: ${jabatanList.length} records\n`);

        // 2. Load all pegawai
        db.all('SELECT id, name, position, department, jabatan_id FROM pegawai', (err, pegawaiList) => {
            if (err) { console.error('Error loading pegawai:', err); return; }

            console.log(`Pegawai ditemukan: ${pegawaiList.length} records\n`);

            let matched = 0;
            let skipped = 0;
            let alreadySet = 0;

            const stmt = db.prepare('UPDATE pegawai SET jabatan_id = ?, position = ?, department = ? WHERE id = ?');

            pegawaiList.forEach(pegawai => {
                // Skip if already assigned
                if (pegawai.jabatan_id) {
                    alreadySet++;
                    console.log(`  ✓ ${pegawai.name} - sudah di-assign (jabatan_id=${pegawai.jabatan_id})`);
                    return;
                }

                const posUpper = (pegawai.position || '').toUpperCase().trim();

                // Try direct map first
                let jabatanNama = positionToJabatanMap[posUpper];

                // Try case-insensitive search in mapping
                if (!jabatanNama) {
                    for (const [key, val] of Object.entries(positionToJabatanMap)) {
                        if (posUpper.includes(key) || key.includes(posUpper)) {
                            jabatanNama = val;
                            break;
                        }
                    }
                }

                if (jabatanNama) {
                    // Find jabatan by name (case-insensitive)
                    const jabatan = jabatanList.find(j => j.nama.toLowerCase() === jabatanNama.toLowerCase());
                    if (jabatan) {
                        stmt.run(jabatan.id, jabatan.nama, jabatan.department, pegawai.id);
                        matched++;
                        console.log(`  ✅ ${pegawai.name}: "${pegawai.position}" → jabatan_id=${jabatan.id} (${jabatan.nama})`);
                    } else {
                        skipped++;
                        console.log(`  ⚠️  ${pegawai.name}: mapping "${jabatanNama}" not found in jabatan table`);
                    }
                } else {
                    skipped++;
                    console.log(`  ❌ ${pegawai.name}: "${pegawai.position}" - tidak ada mapping`);
                }
            });

            stmt.finalize(() => {
                console.log(`\n=== Hasil ===`);
                console.log(`  Matched & updated: ${matched}`);
                console.log(`  Already set: ${alreadySet}`);
                console.log(`  Skipped (no mapping): ${skipped}`);
                console.log(`  Total: ${pegawaiList.length}`);
                db.close();
            });
        });
    });
});
