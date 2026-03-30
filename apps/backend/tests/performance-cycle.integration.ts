import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { closeDb, openDb } from '../src/config/db';
import PerformanceCycleService from '../src/modules/performance-management/orchestration/performance-cycle.service';
import KpiService from '../src/modules/kpi/kpi.service';
import { PenilaianKinerjaRepository } from '../src/modules/kinerja/penilaianKinerja.repository';

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'performance-cycle-'));
const dbFile = path.join(tempRoot, 'integration.sqlite');
process.env.DB_SOURCE = dbFile;

const setupSchema = async () => {
  const db = await openDb();

  await db.exec(`
    PRAGMA foreign_keys = OFF;

    CREATE TABLE pegawai (
      id TEXT PRIMARY KEY,
      name TEXT,
      nip TEXT,
      position TEXT,
      department TEXT,
      email TEXT,
      statusKaryawan TEXT DEFAULT 'aktif',
      isActive INTEGER DEFAULT 1,
      jabatan_id INTEGER,
      atasan_id TEXT,
      avatarUrl TEXT,
      educationHistory TEXT DEFAULT '[]',
      workHistory TEXT DEFAULT '[]',
      trainingCertificates TEXT DEFAULT '[]',
      payrollInfo TEXT DEFAULT '{}'
    );

    CREATE TABLE jabatan (
      id INTEGER PRIMARY KEY,
      nama TEXT,
      level INTEGER,
      parent_id INTEGER,
      department TEXT,
      deskripsi TEXT
    );

    CREATE TABLE notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT,
      message TEXT,
      type TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME,
      scheduled_for DATETIME,
      delivery_channel TEXT,
      related_entity TEXT,
      related_entity_id TEXT
    );

    CREATE TABLE analisis_beban_kerja (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      year INTEGER NOT NULL,
      position TEXT NOT NULL,
      department TEXT NOT NULL,
      totalYearlyMinutes INTEGER DEFAULT 0,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE detail_beban_kerja (
      id TEXT PRIMARY KEY,
      analysisId TEXT NOT NULL,
      activityId TEXT,
      activityName TEXT NOT NULL,
      outputUnit TEXT,
      durationMinutes INTEGER DEFAULT 0,
      freqDaily INTEGER DEFAULT 0,
      freqWeekly INTEGER DEFAULT 0,
      freqMonthly INTEGER DEFAULT 0,
      freqQuarterly INTEGER DEFAULT 0,
      freqSemester INTEGER DEFAULT 0,
      freqYearly INTEGER DEFAULT 0,
      totalMinutes INTEGER DEFAULT 0
    );

    CREATE TABLE activity_library (
      id TEXT PRIMARY KEY,
      position TEXT NOT NULL,
      department TEXT,
      activityName TEXT NOT NULL,
      durationMinutes INTEGER NOT NULL DEFAULT 0,
      outputUnit TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE kpi_targets (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      period TEXT NOT NULL,
      kpiName TEXT NOT NULL,
      targetValue REAL NOT NULL DEFAULT 0,
      targetUnit TEXT,
      weight REAL NOT NULL DEFAULT 0,
      actualValue REAL DEFAULT 0,
      score REAL DEFAULT 0,
      status TEXT DEFAULT 'draft',
      source TEXT DEFAULT 'manual',
      category TEXT DEFAULT 'process',
      abkActivityId TEXT,
      notes TEXT,
      evidenceUrl TEXT,
      parentKpiId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE log_aktivitas_harian (
      id_log INTEGER PRIMARY KEY AUTOINCREMENT,
      id_pegawai TEXT NOT NULL,
      tanggal TEXT NOT NULL,
      id_activity_library TEXT NOT NULL,
      frekuensi INTEGER NOT NULL DEFAULT 1,
      total_durasi_terhitung INTEGER NOT NULL DEFAULT 0,
      status_approval TEXT DEFAULT 'pending',
      catatan TEXT,
      lampiran TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE penilaian_kinerja (
      id TEXT PRIMARY KEY,
      employeeId TEXT,
      employeeName TEXT,
      period TEXT,
      reviewerName TEXT,
      reviewDate TEXT,
      overallScore REAL,
      status TEXT,
      strengths TEXT,
      areasForImprovement TEXT,
      employeeFeedback TEXT,
      kpis TEXT,
      penilaiId TEXT,
      coachingRecommendation TEXT,
      selfAssessmentScore REAL,
      selfAssessmentKpis TEXT,
      selfAssessmentStrengths TEXT,
      selfAssessmentAreas TEXT,
      selfAssessmentDate TEXT,
      selfAssessmentStatus TEXT DEFAULT 'belum_diisi',
      selfAssessmentDeadline TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

const seedData = async () => {
  const db = await openDb();

  await db.run(
    `INSERT INTO pegawai (id, name, nip, position, department, statusKaryawan, isActive, jabatan_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    'emp-1',
    'Amar Septiawan',
    '0001',
    'Account Officer',
    'Pemasaran',
    'aktif',
    1,
    1
  );

  await db.run(
    `INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    'act-1',
    'Account Officer',
    'Pemasaran',
    'Kunjungan nasabah potensial',
    60,
    'Nasabah',
    'lapangan'
  );

  await db.run(
    `INSERT INTO analisis_beban_kerja (id, employeeId, year, position, department, totalYearlyMinutes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    'abk-1',
    'emp-1',
    2026,
    'Account Officer',
    'Pemasaran',
    7200,
    'approved'
  );

  await db.run(
    `INSERT INTO detail_beban_kerja (
      id, analysisId, activityId, activityName, outputUnit, durationMinutes,
      freqDaily, freqWeekly, freqMonthly, freqQuarterly, freqSemester, freqYearly, totalMinutes
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    'abk-item-1',
    'abk-1',
    'act-1',
    'Kunjungan nasabah potensial',
    'Nasabah',
    60,
    0,
    0,
    10,
    0,
    0,
    0,
    7200
  );

  await db.run(
    `INSERT INTO log_aktivitas_harian (
      id_pegawai, tanggal, id_activity_library, frekuensi, total_durasi_terhitung, status_approval, catatan
     ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    'emp-1',
    '2026-03-10',
    'act-1',
    3,
    180,
    'approved',
    'Kunjungan approved'
  );

  await db.run(
    `INSERT INTO log_aktivitas_harian (
      id_pegawai, tanggal, id_activity_library, frekuensi, total_durasi_terhitung, status_approval, catatan
     ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    'emp-1',
    '2026-03-11',
    'act-1',
    5,
    300,
    'pending',
    'Kunjungan pending'
  );
};

const run = async () => {
  try {
    await setupSchema();
    await seedData();

    const payload = { period: '2026-S1', employeeIds: ['emp-1'], selfAssessmentDeadline: '2026-06-30' };

    const openResult = await PerformanceCycleService.openPeriod(payload);
    assert.equal(openResult.succeeded, 1, 'openPeriod should generate KPI from approved workload');

    const generatedKpis = await KpiService.getByEmployeePeriod('emp-1', '2026-S1');
    assert.equal(generatedKpis.length, 1, 'generated KPI should exist');
    assert.equal(generatedKpis[0]?.abkActivityId, 'act-1', 'generated KPI should keep activity link');

    const syncResult = await PerformanceCycleService.syncApprovedWlaToKpi(payload);
    assert.equal(syncResult.succeeded, 1, 'syncApprovedWlaToKpi should process employee');

    const syncedKpis = await KpiService.getByEmployeePeriod('emp-1', '2026-S1');
    assert.equal(syncedKpis[0]?.actualValue, 3, 'only approved WLA frequency should be counted');

    const reviewBatchResult = await PerformanceCycleService.createReviewBatch(payload);
    assert.equal(reviewBatchResult.succeeded, 1, 'createReviewBatch should create one review');

    const duplicateReviewResult = await PerformanceCycleService.createReviewBatch(payload);
    assert.equal(duplicateReviewResult.skipped, 1, 'second createReviewBatch should skip duplicate review');

    let reviews = await PenilaianKinerjaRepository.findByEmployeeId('emp-1');
    assert.equal(reviews.length, 1, 'employee should have a single review record');
    assert.equal(reviews[0]?.status, 'Awaiting SA', 'created review should start in Awaiting SA');

    const finalizeBeforeCompleted = await PerformanceCycleService.finalizePeriod(payload);
    assert.equal(finalizeBeforeCompleted.skipped, 1, 'finalize should skip review that is not completed yet');

    await PenilaianKinerjaRepository.updateStatus(reviews[0]!.id, 'Completed');

    const finalizeAfterCompleted = await PerformanceCycleService.finalizePeriod(payload);
    assert.equal(finalizeAfterCompleted.succeeded, 1, 'finalize should succeed for completed review');

    reviews = await PenilaianKinerjaRepository.findByEmployeeId('emp-1');
    assert.equal(reviews[0]?.status, 'Finalized', 'review should be finalized after finalizePeriod');

    console.log('Performance cycle integration test passed.');
  } finally {
    await closeDb();
    if (fs.existsSync(dbFile)) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  }
};

run().catch((error) => {
  console.error('Performance cycle integration test failed:', error);
  process.exit(1);
});
