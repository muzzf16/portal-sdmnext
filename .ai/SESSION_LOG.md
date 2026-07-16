# SESSION_LOG.md — Portal SDM Next

> Log kronologis per sesi kerja (manusia atau AI-assisted). Tambahkan entri BARU di PALING ATAS
> (reverse chronological), jangan edit entri lama. Tujuan: jejak audit "apa yang terjadi dan
> kapan", terpisah dari DECISIONS.md (yang isinya keputusan final, bukan narasi proses).

Format tiap entri:
```
## [Tanggal] — Judul Singkat Sesi
- Sprint/fase:
- Dikerjakan:
- Hasil:
- Commit terkait:
- Follow-up untuk sesi berikutnya:
```

---

## [2026-07-16] — Optimasi Tampilan Cetak PDF Monitoring KPI
- **Sprint/fase**: UI/UX Refinement (Pencetakan Laporan)
- **Dikerjakan**:
  1. Menghilangkan header tab navigasi dari tampilan mode *print* (`KpiTargetPage.tsx`).
  2. Mengecilkan ukuran font dan *padding* pada header kartu serta tabel di `KpiMonitoringView.tsx` (menggunakan *utility class* `print:*` dari Tailwind).
  3. Memindahkan penempatan kotak tanda tangan pimpinan ke dalam kolom tabel KPI Khusus (sebelah kanan) guna memaksimalkan ruang kosong dan mengurangi pemakaian halaman.
  4. Menyembunyikan tulisan-tulisan persentase berulang di kartu *summary* (WLA & KPI Khusus).
  5. Menjalankan `docker compose build sdm && docker compose up -d sdm` untuk mem-*build* dan me-*reload* kontainer front-end.
- **Hasil**: Tampilan hasil cetak PDF Monitoring KPI menjadi jauh lebih rapi, padat, dan ringkas (tidak lagi memakan 4 halaman) tanpa merusak atau mengubah tata letak aplikasi di layar web.
- **Commit terkait**: N/A
- **Follow-up untuk sesi berikutnya**:
  - Pengerjaan task UI/UX lanjutan atau melanjutkan fase perbaikan/pengembangan modul-modul lainnya.

---

## [2026-07-16] — Deployment Fitur Restore Database
- **Sprint/fase**: Deployment & Verification
- **Dikerjakan**:
  1. Eksekusi deployment ke container produksi menggunakan script `./deploy.sh`.
  2. Backup database otomatis berhasil dilakukan sebelum rebuild.
  3. Rebuild image backend dan frontend untuk memasukkan fitur upload file restore.
- **Hasil**: Container backend (port 3334) dan frontend (port 8081) berhasil menyala kembali (Up) tanpa kendala dengan data produksi yang telah diamankan di host.
- **Commit terkait**: N/A
- **Follow-up untuk sesi berikutnya**:
  - Pengujian (smoke test) end-to-end fitur Restore Database via upload file di browser (UI frontend).
  - Melanjutkan sprint recovery atau fitur berikutnya sesuai prioritas.

## [2026-07-11] — Sprint 1: Reverse Documentation & Security Findings Summary
- **Sprint/fase**: Sprint 1 (Feature Restoration & Verification — bagian dokumentasi)
- **Dikerjakan**:
  1. Peta modul komprehensif — 29 modul backend aktif dipetakan (tujuan bisnis, route,
     controller/service/repo, dependensi DB, status test, risk level).
  2. Reverse documentation API — seluruh endpoint, method, status otorisasi, request/response.
  3. Reverse documentation database — schema SQLite aktual via `.schema` dump + ERD Mermaid,
     termasuk identifikasi tabel mati (`pinjaman_karyawan`, `users`, `organizational_kpi`,
     `department_kpi`, `daily_activities`).
  4. Menyatukan seluruh temuan keamanan & risiko database ke satu dokumen ringkasan.
- **Hasil**:
  - `docs/architecture/MODULE_MAP.md` (commit `d6edd329`)
  - `docs/api/API.md` (commit `bb9f94bc`)
  - `docs/database/DATABASE.md` (commit `f983d1db`)
  - `PROJECT_RECOVERY/SECURITY_FINDINGS_SUMMARY.md`
- **Temuan kunci baru**: SEC-02 (bypass JWT di rute-rute penting) dan SEC-04 (privilege
  escalation via self-registration) dikonfirmasi via kode aktual, bukan sekadar hipotesis.
  Juga ditemukan DATA-01 (migrasi tidak idempotent → risiko data loss) dan hilangnya
  CHECK constraint untuk kolom `role`.
- **Keputusan pemilik proyek**: SEC-02 dan SEC-04 **DITUNDA** secara sadar sampai sesi
  development berikutnya, sesuai Recovery Freeze Rule (satu sprint = satu jenis perubahan).
- **Follow-up untuk sesi berikutnya**:
  - Verifikasi fungsi bisnis internal (absensi harian, cuti, payroll, penilaian kinerja) —
    belum pernah diuji end-to-end selama recovery.
  - Uji integrasi WhatsApp M2M dengan `WA_API_KEY` yang baru dirotasi.
  - Mulai Fase 1 perbaikan keamanan (SEC-02, SEC-04, SEC-01) — HANYA setelah dokumentasi
    baseline dinyatakan stabil oleh pemilik proyek.

---

## [2026-07-11] — Sprint 0: Discovery, Repo Hygiene, Secret Rotation, Smoke Test
- **Sprint/fase**: Sprint 0 (Project Discovery & Recovery Baseline)
- **Dikerjakan**:
  - Audit arsitektur & stack penuh (`PROJECT_MANIFEST.md`, `REPOSITORY_AUDIT.md`).
  - Bersihkan Git tracking: `node_modules` backend (ter-track dari Windows sejak 27 Okt 2025),
    `.env` (root & backend), dan backup `.sqlite` di-untrack.
  - Tambah `.gitignore` lokal di `apps/backend/`.
  - Instalasi ulang dependency backend via `npm ci` di host Linux (fix native binding
    `sqlite3`/`bcrypt` yang sebelumnya "invalid ELF header").
  - Rotasi resmi `WA_API_KEY` yang sempat bocor di Git history.
  - Verifikasi `JWT_SECRET` produksi lokal aman (custom random value).
  - Smoke test lokal backend & frontend.
- **Hasil**: Commit `578d4ebc` (untrack + gitignore). Smoke test **PASS** untuk backend
  (port 3333) dan frontend/Vite (port 5173).
- **Risk Register final Sprint 0**: 6 risiko dicatat dan diprioritaskan (lihat MISTAKES.md),
  2 di antaranya kritis dan sengaja ditunda.
- **Follow-up untuk sesi berikutnya**: lanjut ke Sprint 1 — reverse documentation lengkap
  sebelum menyentuh perbaikan kode apa pun.

---

<!-- Tambahkan entri sesi baru di ATAS baris ini -->

## [2026-07-13] — Tambah Fungsi Restore via Upload File Backup
- **Sprint/fase**: Fitur Backup & Restore — tambahan restore via upload
- **Dikerjakan**:
  1. Audit modul backup yang sudah ada: endpoint list, create, restore (dari filename), download sudah terimplementasi penuh di backend dan frontend.
  2. Tambah endpoint backend `POST /api/backup/restore-upload` yang menerima file `.sqlite` via multipart/form-data, membuat safety backup sebelum restore, lalu menimpa `database.sqlite` dan membersihkan file temp.
  3. Tambah UI upload file restore di `HalamanBackup.tsx` (kolom info sistem).
  4. Tambah method `restoreFromUpload` di `backupAPI.ts` (frontend).
- **Hasil**:
  - `apps/backend/src/modules/backup/backup.service.ts` — method `restoreFromUploadedFile`
  - `apps/backend/src/modules/backup/backup.controller.ts` — handler `restoreFromUpload`
  - `apps/backend/src/modules/backup/backup.routes.ts` — route + inline multer `.sqlite` (50MB)
  - `apps/frontend/src/shared/services/backupAPI.ts` — method `restoreFromUpload`
  - `apps/frontend/src/features/pengaturan/pages/HalamanBackup.tsx` — UI upload + handler
- **Verifikasi**:
  - Backend `tsc --noEmit`: PASS
  - Frontend `tsc --noEmit`: PASS
- **Catatan keamanan**: Rute backup masih belum dilindungi JWT (SEC-02, ditunda). Upload hanya menerima `.sqlite` via extension check.
- **Follow-up untuk sesi berikutnya**:
  - Testing end-to-end upload + restore
  - Pertimbangan validasi header magic bytes SQLite untuk keamanan tambahan

---
