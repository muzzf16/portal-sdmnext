---
name: Audit skema database
overview: Memetakan skema database aktual dari migration SQL dan memverifikasi korelasi antar tabel berdasarkan foreign key serta pola JOIN di layer repository/service.
todos: [
  "Verifikasi skema tabel kredit_berkas dan tracking",
  "Cek konsistensi pemakaian NIP vs ID Pegawai di modul KPI",
  "Audit relasi tabel jabatan terhadap hierarki persetujuan WLA",
  "Sinkronisasi tipe data nominal_rupiah di log_aktivitas dan kpi_targets"
]
isProject: false
---

# Audit Skema dan Korelasi Tabel

## Cakupan yang akan dicek
- Kumpulkan sumber kebenaran skema dari migration SQL di [apps/backend/db/migrations](/opt/portal-sdmv3/apps/backend/db/migrations).
- Cocokkan relasi FK dengan penggunaan JOIN pada repository/service agar terlihat korelasi nyata saat runtime.
- Identifikasi inkonsistensi kunci relasi (mis. pemakaian `pegawai.id` vs `pegawai.id_pegawai` vs `pegawai.nip`).

## Artefak utama yang digunakan
- Migration inti HR: [000_create_initial_tables.sql](/opt/portal-sdmv3/apps/backend/db/migrations/000_create_initial_tables.sql)
- KPI/ABK: [20260214_kpi_feature.sql](/opt/portal-sdmv3/apps/backend/db/migrations/20260214_kpi_feature.sql), [20260213_create_workload_tables.sql](/opt/portal-sdmv3/apps/backend/db/migrations/20260213_create_workload_tables.sql), [20260220_log_aktivitas_harian.sql](/opt/portal-sdmv3/apps/backend/db/migrations/20260220_log_aktivitas_harian.sql)
- Hierarki jabatan: [20260215_hierarki_jabatan.sql](/opt/portal-sdmv3/apps/backend/db/migrations/20260215_hierarki_jabatan.sql)
- Kredit berkas: [20260504_create_kredit_berkas.sql](/opt/portal-sdmv3/apps/backend/db/migrations/20260504_create_kredit_berkas.sql)
- Bukti JOIN aplikasi: [apps/backend/src/modules/pegawai/pegawai.repository.ts](/opt/portal-sdmv3/apps/backend/src/modules/pegawai/pegawai.repository.ts), [apps/backend/src/modules/laporan/laporan.repository.ts](/opt/portal-sdmv3/apps/backend/src/modules/laporan/laporan.repository.ts), [apps/backend/src/modules/kpi/kpi.repository.ts](/opt/portal-sdmv3/apps/backend/src/modules/kpi/kpi.repository.ts), [apps/backend/src/modules/kredit-berkas/kredit-berkas.repository.ts](/opt/portal-sdmv3/apps/backend/src/modules/kredit-berkas/kredit-berkas.repository.ts)

## Hasil yang ditargetkan
- Daftar tabel inti dan hubungan `1:N`/self-reference yang tervalidasi dari FK + JOIN.
- Peta korelasi modul lintas domain (HR, KPI/ABK, Integrasi, Kredit Berkas).
- Daftar prioritas perbaikan konsistensi key relasi untuk mencegah bug join/data orphan.

## Visual alur relasi inti
```mermaid
flowchart LR
    pegawai[pegawai]
    jabatan[jabatan]
    absensi[absensi]
    cuti[permintaan_cuti]
    gaji[penggajian]
    kinerja[penilaian_kinerja]
```mermaid
graph TD
    pegawai["pegawai (id, nip, name, jabatan_id)"]
    kpiTargets["kpi_targets (id, employeeId, kpiName, targetValue, actualValue, abkActivityId)"]
    dailyActivities["log_aktivitas_harian (id_log, id_pegawai, id_activity_library, nominal_rupiah, status_approval)"]
    activityLibrary["activity_library (id, activityName, durationMinutes)"]
    kreditBerkas["kredit_berkas (id, nomor_pengajuan, current_stage, overall_status)"]
    kreditTracking["kredit_berkas_tracking (id, berkas_id, stage, status_berkas)"]

    kpiTargets -->|"employeeId"| pegawai
    kpiTargets -->|"abkActivityId"| activityLibrary
    dailyActivities -->|"id_pegawai"| pegawai
    dailyActivities -->|"id_activity_library"| activityLibrary

    kreditTracking -->|"berkas_id"| kreditBerkas
```

## Kriteria selesai
- Semua relasi utama sudah terpetakan beserta sumber file pembuktian.
- Inkonstistensi naming key relasi terdokumentasi dan diberi rekomendasi normalisasi.