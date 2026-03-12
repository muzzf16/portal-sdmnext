const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../apps/backend/database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

const templates = [
    // Bagian Account Officer (AO) / Kredit
    { d: 'Account Officer', n: 'Penyelesaian Kunjungan Nasabah Baru', c: 'process', v: 40, u: 'jumlah', w: 15, m: 'Laporan Kunjungan (CRM)' },
    { d: 'Account Officer', n: 'Review Portofolio Kredit Aktif', c: 'process', v: 100, u: '%', w: 10, m: 'Log Aktivitas Harian' },
    { d: 'Account Officer', n: 'Penyusunan Proposal Kredit (Nota Analisa)', c: 'process', v: 15, u: 'jumlah', w: 15, m: 'Sistem Kredit' },
    { d: 'Account Officer', n: 'Pertumbuhan Outstanding Kredit', c: 'outcome', v: 10, u: '%', w: 30, m: 'Laporan Keuangan' },
    { d: 'Account Officer', n: 'Rasio NPL (Non-Performing Loan)', c: 'outcome', v: 2, u: '%', w: 30, m: 'Laporan Kolektibilitas' },

    // Bagian Operasional & Teller
    { d: 'Operasional & Teller', n: 'Akurasi Transaksi Tunai (Tanpa Selisih)', c: 'process', v: 100, u: '%', w: 30, m: 'Laporan Teller/Kas' },
    { d: 'Operasional & Teller', n: 'Waktu Pelayanan per Nasabah', c: 'process', v: 3, u: 'menit', w: 20, m: 'Sistem Antrian' },
    { d: 'Operasional & Teller', n: 'Penyelesaian Rekonsiliasi Kas Harian', c: 'process', v: 100, u: '%', w: 20, m: 'Log Aktivitas Harian' },
    { d: 'Operasional & Teller', n: 'Tingkat Komplain Nasabah', c: 'outcome', v: 0, u: 'jumlah', w: 30, m: 'Buku Komplain / CS' },

    // Bagian Customer Service
    { d: 'Customer Service', n: 'Penyelesaian Pembukaan Rekening Baru', c: 'process', v: 15, u: 'menit', w: 20, m: 'Sistem Antrian / Log' },
    { d: 'Customer Service', n: 'Respon Komplain Nasabah (SLA < 24 jam)', c: 'process', v: 100, u: '%', w: 25, m: 'Ticketing System / Log' },
    { d: 'Customer Service', n: 'Penyelesaian Update Data KYC Nasabah', c: 'process', v: 50, u: 'jumlah', w: 15, m: 'Sistem Core Banking' },
    { d: 'Customer Service', n: 'Indeks Kepuasan Nasabah (CSAT)', c: 'outcome', v: 4.5, u: 'poin', w: 40, m: 'Survei Kepuasan' },

    // Bagian HRD & Umum
    { d: 'HRD & Umum', n: 'Penyelesaian Rekrutmen (SLA Permintaan)', c: 'process', v: 30, u: 'hari', w: 20, m: 'Sistem HR / Log' },
    { d: 'HRD & Umum', n: 'Kehadiran Karyawan (Tingkat Absensi)', c: 'outcome', v: 95, u: '%', w: 20, m: 'Sistem Absensi' },
    { d: 'HRD & Umum', n: 'Penyelesaian Perhitungan Payroll (Zero Error)', c: 'process', v: 100, u: '%', w: 30, m: 'Log Aktivitas / Payroll' },
    { d: 'HRD & Umum', n: 'Tingkat Turnover Karyawan', c: 'outcome', v: 5, u: '%', w: 30, m: 'Laporan HR' },

    // Bagian TI (Teknologi Informasi)
    { d: 'Teknologi Informasi', n: 'Uptime Sistem Core Banking & Aplikasi', c: 'outcome', v: 99.9, u: '%', w: 40, m: 'Monitoring Tools' },
    { d: 'Teknologi Informasi', n: 'Penyelesaian Tiket Bantuan (SLA < 2 jam)', c: 'process', v: 90, u: '%', w: 20, m: 'Helpdesk System' },
    { d: 'Teknologi Informasi', n: 'Penyelesaian Backup Data Harian', c: 'process', v: 100, u: '%', w: 20, m: 'Log Backup' },
    { d: 'Teknologi Informasi', n: 'Tidak Ada Insiden Keamanan (Zero Breach)', c: 'outcome', v: 100, u: '%', w: 20, m: 'Audit Trail / Log Keamanan' },

    // Bagian Akuntansi & Keuangan
    { d: 'Akuntansi & Keuangan', n: 'Penyelesaian Laporan Keuangan Harian', c: 'process', v: 100, u: '%', w: 30, m: 'Log Aktivitas Harian' },
    { d: 'Akuntansi & Keuangan', n: 'Akurasi Jurnal & Rekonsiliasi Antar Bank', c: 'process', v: 100, u: '%', w: 30, m: 'Audit/Laporan' },
    { d: 'Akuntansi & Keuangan', n: 'Penyelesaian Pelaporan Pajak Tepat Waktu', c: 'process', v: 100, u: '%', w: 20, m: 'Bukti Lapor Pajak' },
    { d: 'Akuntansi & Keuangan', n: 'Efisiensi Biaya Operasional (BOPO)', c: 'outcome', v: 80, u: '%', w: 20, m: 'Laporan Laba Rugi' },

    // Bagian Satuan Kerja Audit Internal (SKAI)
    { d: 'Audit Internal', n: 'Penyelesaian Rencana Audit Tahunan', c: 'process', v: 100, u: '%', w: 30, m: 'Laporan Realisasi Audit' },
    { d: 'Audit Internal', n: 'Waktu Penyelesaian Laporan Hasil Audit (LHA)', c: 'process', v: 14, u: 'hari', w: 20, m: 'Log Aktivitas' },
    { d: 'Audit Internal', n: 'Tindak Lanjut Temuan Audit oleh Auditee', c: 'outcome', v: 90, u: '%', w: 30, m: 'Register Tindak Lanjut' },
    { d: 'Audit Internal', n: 'Tidak Ada Temuan Mayor dari Eksternal Audit', c: 'outcome', v: 100, u: '%', w: 20, m: 'Laporan Auditor Eksternal' },
    
    // Bagian Marketing (Pendanaan)
    { d: 'Marketing (Pendanaan)', n: 'Akuisisi Nasabah Deposito/Tabungan Baru', c: 'process', v: 20, u: 'jumlah', w: 20, m: 'CRM / Sistem Inti' },
    { d: 'Marketing (Pendanaan)', n: 'Kunjungan Nasabah Priority/Corporate', c: 'process', v: 15, u: 'jumlah', w: 15, m: 'Laporan Kunjungan' },
    { d: 'Marketing (Pendanaan)', n: 'Pertumbuhan Dana Pihak Ketiga (DPK)', c: 'outcome', v: 15, u: '%', w: 40, m: 'Laporan Pertumbuhan DPK' },
    { d: 'Marketing (Pendanaan)', n: 'Retensi Nasabah Deposito Utama', c: 'outcome', v: 85, u: '%', w: 25, m: 'Data Perpanjangan Deposito' },
    
    // Bagian Kolektor (Collections)
    { d: 'Kolektor', n: 'Penyelesaian Kunjungan Penagihan Harian', c: 'process', v: 15, u: 'jumlah', w: 20, m: 'Laporan Kunjungan/GPS' },
    { d: 'Kolektor', n: 'Tele-collection (Call) Nasabah Menunggak', c: 'process', v: 30, u: 'jumlah', w: 15, m: 'Log Panggilan' },
    { d: 'Kolektor', n: 'Recovery Rate (Penurunan Tunggakan)', c: 'outcome', v: 25, u: '%', w: 40, m: 'Laporan Kolektibilitas' },
    { d: 'Kolektor', n: 'Penurunan NPL di Portofolio Kelolaan', c: 'outcome', v: 5, u: '%', w: 25, m: 'Data NPL per Kolektor' }
];

db.serialize(() => {
    // 1. Create table if not exists
    db.run(`
        CREATE TABLE IF NOT EXISTS kpi_templates (
            id TEXT PRIMARY KEY,
            department TEXT NOT NULL,
            kpiName TEXT NOT NULL,
            category TEXT NOT NULL,
            targetValue REAL NOT NULL,
            targetUnit TEXT NOT NULL,
            weight INTEGER NOT NULL,
            measureSource TEXT,
            description TEXT
        )
    `, (err) => {
        if (err) {
            console.error('Error creating kpi_templates table:', err);
            return;
        }
        console.log('Table kpi_templates ensured.');
    });

    // 2. Clear existing templates (optional, depending on if you want a fresh start always)
    db.run(`DELETE FROM kpi_templates`);
    
    // 3. Insert templates
    let inserted = 0;
    const stmt = db.prepare(`
        INSERT INTO kpi_templates (id, department, kpiName, category, targetValue, targetUnit, weight, measureSource, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    db.parallelize(() => {
        templates.forEach(t => {
            const id = `tpl-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            stmt.run([id, t.d, t.n, t.c, t.v, t.u, t.w, t.m, 'Template standar (SOP)'], (err) => {
                if (err) {
                    console.error('Insert error for:', t.n, err);
                } else {
                    inserted++;
                }
            });
        });
    });

    stmt.finalize(() => {
        console.log(`Successfully seeded ${inserted} KPI templates.`);
        db.close();
    });
});
