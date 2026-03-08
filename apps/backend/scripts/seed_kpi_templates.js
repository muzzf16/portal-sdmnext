/**
 * Seed Script: KPI Templates per Departemen
 * 
 * Tabel: kpi_templates
 * Departemen: Pemasaran, Penagihan, Pelaporan
 * 
 * Jalankan: node scripts/seed_kpi_templates.js
 */

const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const KPI_TEMPLATES = [
    // ═══════════════════════════════════════════════════════════
    //  PEMASARAN (MARKETING)
    //  Komposisi: Process 25% + Outcome 65% + Strategic 10%
    // ═══════════════════════════════════════════════════════════
    {
        id: 'tpl-mkt-01',
        department: 'Pemasaran',
        kpiName: 'Jumlah nasabah baru kredit',
        category: 'outcome',
        targetValue: 15,
        targetUnit: 'jumlah',
        weight: 20,
        description: 'Jumlah nasabah kredit baru yang berhasil diakuisisi dalam periode.',
        measureSource: 'Data pencairan kredit dari sistem core banking',
        periodType: 'bulanan',
    },
    {
        id: 'tpl-mkt-02',
        department: 'Pemasaran',
        kpiName: 'Jumlah nasabah baru tabungan/deposito',
        category: 'outcome',
        targetValue: 20,
        targetUnit: 'jumlah',
        weight: 15,
        description: 'Jumlah rekening tabungan atau deposito baru yang dibuka.',
        measureSource: 'Data pembukaan rekening',
        periodType: 'bulanan',
    },
    {
        id: 'tpl-mkt-03',
        department: 'Pemasaran',
        kpiName: 'Volume pencairan kredit',
        category: 'outcome',
        targetValue: 500,
        targetUnit: 'jumlah',
        weight: 20,
        description: 'Total nominal pencairan kredit dalam juta rupiah.',
        measureSource: 'Laporan pencairan kredit',
        periodType: 'bulanan',
    },
    {
        id: 'tpl-mkt-04',
        department: 'Pemasaran',
        kpiName: 'Jumlah kunjungan prospek',
        category: 'process',
        targetValue: 40,
        targetUnit: 'jumlah',
        weight: 15,
        description: 'Jumlah kunjungan ke calon nasabah untuk penawaran produk.',
        measureSource: 'Log aktivitas harian (WLA) — otomatis',
        periodType: 'bulanan',
    },
    {
        id: 'tpl-mkt-05',
        department: 'Pemasaran',
        kpiName: 'Pembuatan materi promosi',
        category: 'process',
        targetValue: 4,
        targetUnit: 'jumlah',
        weight: 10,
        description: 'Jumlah materi promosi (brosur, konten sosmed, banner) yang dibuat.',
        measureSource: 'Log aktivitas harian (WLA) — otomatis',
        periodType: 'bulanan',
    },
    {
        id: 'tpl-mkt-06',
        department: 'Pemasaran',
        kpiName: 'Pertumbuhan DPK (Dana Pihak Ketiga)',
        category: 'strategic',
        targetValue: 10,
        targetUnit: '%',
        weight: 10,
        description: 'Persentase pertumbuhan Dana Pihak Ketiga sesuai target RKAT.',
        measureSource: 'Laporan keuangan — manual input',
        periodType: 'semesteran',
    },
    {
        id: 'tpl-mkt-07',
        department: 'Pemasaran',
        kpiName: 'Rasio konversi prospek ke nasabah',
        category: 'outcome',
        targetValue: 30,
        targetUnit: '%',
        weight: 10,
        description: 'Persentase prospek yang berhasil menjadi nasabah.',
        measureSource: 'Data pipeline pemasaran',
        periodType: 'bulanan',
    },

    // ═══════════════════════════════════════════════════════════
    //  PENAGIHAN NASABAH KREDIT
    //  Komposisi: Process 40% + Outcome 40% + Strategic 20%
    // ═══════════════════════════════════════════════════════════
    {
        id: 'tpl-tag-01',
        department: 'Penagihan',
        kpiName: 'Jumlah kunjungan penagihan',
        category: 'process',
        targetValue: 60,
        targetUnit: 'jumlah',
        weight: 15,
        description: 'Jumlah kunjungan lapangan ke debitur bermasalah.',
        measureSource: 'Log aktivitas harian (WLA) — otomatis',
        periodType: 'bulanan',
    },
    {
        id: 'tpl-tag-02',
        department: 'Penagihan',
        kpiName: 'Jumlah surat peringatan diterbitkan',
        category: 'process',
        targetValue: 30,
        targetUnit: 'jumlah',
        weight: 10,
        description: 'Surat peringatan (SP1/SP2/SP3) ke debitur yang terlambat bayar.',
        measureSource: 'Log aktivitas harian (WLA) — otomatis',
        periodType: 'bulanan',
    },
    {
        id: 'tpl-tag-03',
        department: 'Penagihan',
        kpiName: 'Jumlah telepon penagihan',
        category: 'process',
        targetValue: 100,
        targetUnit: 'jumlah',
        weight: 10,
        description: 'Jumlah panggilan telepon follow-up ke debitur.',
        measureSource: 'Log aktivitas harian (WLA) — otomatis',
        periodType: 'bulanan',
    },
    {
        id: 'tpl-tag-04',
        department: 'Penagihan',
        kpiName: 'Collection rate (tingkat keberhasilan tagih)',
        category: 'outcome',
        targetValue: 80,
        targetUnit: '%',
        weight: 25,
        description: 'Persentase tagihan yang berhasil ditagih dari total tagihan jatuh tempo.',
        measureSource: 'Data pembayaran kredit — manual input',
        periodType: 'bulanan',
    },
    {
        id: 'tpl-tag-05',
        department: 'Penagihan',
        kpiName: 'Penurunan NPL (Non-Performing Loan)',
        category: 'strategic',
        targetValue: 5,
        targetUnit: '%',
        weight: 20,
        description: 'Penurunan rasio NPL sesuai target RKAT perusahaan.',
        measureSource: 'Laporan NPL bulanan — manual input',
        periodType: 'semesteran',
    },
    {
        id: 'tpl-tag-06',
        department: 'Penagihan',
        kpiName: 'Recovery rate (kredit macet berhasil ditagih)',
        category: 'outcome',
        targetValue: 60,
        targetUnit: '%',
        weight: 15,
        description: 'Persentase kredit macet (Kol 5) yang berhasil direcovery.',
        measureSource: 'Data recovery kredit — manual input',
        periodType: 'bulanan',
    },
    {
        id: 'tpl-tag-07',
        department: 'Penagihan',
        kpiName: 'Pembuatan laporan aging debitur',
        category: 'process',
        targetValue: 4,
        targetUnit: 'jumlah',
        weight: 5,
        description: 'Laporan aging (umur tunggakan) debitur untuk review manajemen.',
        measureSource: 'Log aktivitas harian (WLA) — otomatis',
        periodType: 'bulanan',
    },

    // ═══════════════════════════════════════════════════════════
    //  PELAPORAN
    //  Komposisi: Process 40% + Outcome 50% + Strategic 10%
    // ═══════════════════════════════════════════════════════════
    {
        id: 'tpl-lap-01',
        department: 'Pelaporan',
        kpiName: 'Pembuatan laporan bulanan (LBU/SID)',
        category: 'process',
        targetValue: 12,
        targetUnit: 'jumlah',
        weight: 20,
        description: 'Pembuatan Laporan Bulanan Umum (LBU) dan SID untuk OJK.',
        measureSource: 'Log aktivitas harian (WLA) — otomatis',
        periodType: 'tahunan',
    },
    {
        id: 'tpl-lap-02',
        department: 'Pelaporan',
        kpiName: 'Ketepatan waktu submit ke OJK',
        category: 'outcome',
        targetValue: 100,
        targetUnit: '%',
        weight: 25,
        description: 'Persentase laporan yang disubmit tepat waktu sesuai deadline OJK.',
        measureSource: 'Tanggal submit vs deadline OJK — manual input',
        periodType: 'bulanan',
    },
    {
        id: 'tpl-lap-03',
        department: 'Pelaporan',
        kpiName: 'Akurasi data laporan (zero error)',
        category: 'outcome',
        targetValue: 98,
        targetUnit: '%',
        weight: 25,
        description: 'Persentase laporan yang tidak memerlukan revisi/koreksi dari OJK.',
        measureSource: 'Data koreksi OJK / revisi — manual input',
        periodType: 'bulanan',
    },
    {
        id: 'tpl-lap-04',
        department: 'Pelaporan',
        kpiName: 'Rekonsiliasi data harian',
        category: 'process',
        targetValue: 22,
        targetUnit: 'jumlah',
        weight: 15,
        description: 'Jumlah hari kerja yang dilakukan rekonsiliasi data.',
        measureSource: 'Log aktivitas harian (WLA) — otomatis',
        periodType: 'bulanan',
    },
    {
        id: 'tpl-lap-05',
        department: 'Pelaporan',
        kpiName: 'Kepatuhan regulasi pelaporan',
        category: 'strategic',
        targetValue: 100,
        targetUnit: '%',
        weight: 10,
        description: 'Tingkat kepatuhan terhadap regulasi pelaporan OJK dan BI.',
        measureSource: 'Hasil audit internal/eksternal — manual input',
        periodType: 'tahunan',
    },
    {
        id: 'tpl-lap-06',
        department: 'Pelaporan',
        kpiName: 'Pembuatan laporan internal manajemen',
        category: 'process',
        targetValue: 4,
        targetUnit: 'jumlah',
        weight: 5,
        description: 'Laporan kinerja internal untuk rapat manajemen bulanan.',
        measureSource: 'Log aktivitas harian (WLA) — otomatis',
        periodType: 'bulanan',
    },
];

async function main() {
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database,
    });

    // 1. Create kpi_templates table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS kpi_templates (
      id TEXT PRIMARY KEY,
      department TEXT NOT NULL,
      kpiName TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'outcome',
      targetValue REAL NOT NULL DEFAULT 0,
      targetUnit TEXT NOT NULL DEFAULT '%',
      weight REAL NOT NULL DEFAULT 0,
      description TEXT,
      measureSource TEXT,
      periodType TEXT DEFAULT 'bulanan',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    console.log('✅ Tabel kpi_templates dibuat/sudah ada');

    // 2. Insert templates (upsert — skip if ID exists)
    let inserted = 0;
    let skipped = 0;

    for (const tpl of KPI_TEMPLATES) {
        try {
            await db.run(
                `INSERT OR IGNORE INTO kpi_templates (id, department, kpiName, category, targetValue, targetUnit, weight, description, measureSource, periodType)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                tpl.id, tpl.department, tpl.kpiName, tpl.category,
                tpl.targetValue, tpl.targetUnit, tpl.weight,
                tpl.description, tpl.measureSource, tpl.periodType
            );
            inserted++;
        } catch (e) {
            skipped++;
        }
    }

    console.log(`✅ Template KPI: ${inserted} inserted, ${skipped} skipped`);

    // 3. Summary per department
    const depts = await db.all('SELECT department, COUNT(*) as count, SUM(weight) as totalWeight FROM kpi_templates GROUP BY department');
    console.log('\n📊 Ringkasan Template KPI:');
    console.log('─'.repeat(50));
    for (const dept of depts) {
        console.log(`  ${dept.department}: ${dept.count} KPI, total bobot ${dept.totalWeight}%`);
    }

    const cats = await db.all("SELECT category, COUNT(*) as count FROM kpi_templates GROUP BY category ORDER BY category");
    console.log('\n📂 Per Kategori:');
    for (const cat of cats) {
        const emoji = cat.category === 'process' ? '📊' : cat.category === 'outcome' ? '🎯' : '🏢';
        console.log(`  ${emoji} ${cat.category}: ${cat.count} template`);
    }

    console.log('\n✅ Seed selesai!');
    process.exit(0);
}

main().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
