# PORTAL SDM v3 — Kondisi Aktual

Dokumen ini adalah snapshot kondisi repository saat ini (April 2026) untuk memudahkan onboarding, maintenance, dan sinkronisasi antar tim.

## Ringkasan Teknologi

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: SQLite (`database.sqlite`)
- Auth: JWT + bcrypt
- Tooling utama: Jest, ESLint, ts-node-dev
- Deployment style: VPS / containerized setup (ada `Dockerfile` dan `docker-compose.yml`)

## Struktur Monorepo (Aktual)

```text
portal-sdmv3/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── core/
│   │   │   ├── jobs/
│   │   │   ├── middleware/
│   │   │   ├── modules/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── db/
│   │   ├── public/
│   │   ├── scripts/
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── app/
│       │   ├── features/
│       │   ├── locales/
│       │   ├── routes/
│       │   ├── shared/
│       │   ├── i18n.ts
│       │   └── index.css
│       ├── docs/
│       └── package.json
├── docs/
├── script/
├── database.sqlite
├── README.md
└── GEMINI.md
```

## Modul Backend yang Ada

Folder `apps/backend/src/modules` saat ini berisi:

- `pegawai`
- `absensi`
- `cuti`
- `penggajian`
- `kinerja`
- `pelatihan`
- `kontrak`
- `perekrutan`
- `orientasi`
- `notifikasi`
- `laporan`
- `dashboard`
- `pengguna`
- `company-settings`
- `permintaanPerubahanData`
- `workload`
- `kpi`
- `jabatan`
- `task`
- `log-aktivitas-harian`
- `activity-library`
- `integration`
- `audit-log`
- `changelog`
- `backup`
- `performance-management`

## API Route Root (Aktual)

Semua route dipasang di prefix `/api`, dengan root path berikut:

- `/auth`
- `/users`
- `/employees`
- `/leave-requests`
- `/attendance`
- `/performance-reviews`
- `/payrolls`
- `/data-change-requests`
- `/recruitment`
- `/onboarding`
- `/notifikasi`
- `/contracts`
- `/pelatihan`
- `/backup`
- `/company-settings`
- `/reports`
- `/dashboard`
- `/workload`
- `/activity-library`
- `/kpi-targets`
- `/kpi-templates`
- `/jabatan`
- `/log-aktivitas-harian`
- `/tasks`
- `/integrations`
- `/audit-logs`
- `/changelog`
- `/performance-cycle`
- plus route upload dari `routes/upload`

## Catatan Arsitektur Runtime Backend

- `app.ts` sudah memakai `helmet`, `cors`, JSON parser, dan middleware `requestContext`.
- CORS memakai allowlist + fallback untuk development.
- Static assets disajikan dari:
  - `/uploads`
  - `/avatars`
  - `/documents`
  - `/logos`
- Server juga melayani frontend statis (`public`) dengan SPA fallback.
- `server.ts` menjalankan migration ringan saat startup dan scheduler job otomatis.

## Frontend Feature Saat Ini

Di `apps/frontend/src/features` ada modul utama numerik dan modul pendukung:

- Modul utama: `01-pegawai` s.d. `10-notifikasi`
- Modul pendukung: `auth`, `autentikasi`, `dasbor`, `landing`, `orientasi`, `pengaturan`

## NPM Scripts (Aktual)

### Backend (`apps/backend/package.json`)

- `npm run dev` → jalankan API dengan `ts-node-dev`
- `npm run build` → compile TypeScript
- `npm run start` → jalankan hasil build
- `npm run migrate` → `ts-node db/migrate.ts`
- `npm run seed` → `ts-node db/seed.ts`
- `npm run reset` → reset database script
- `npm run test:performance-cycle` → integration test performance cycle

### Frontend (`apps/frontend/package.json`)

- `npm run dev` → Vite dev server
- `npm run build` → build production (`tsc && vite build`)
- `npm run preview` → preview hasil build
- `npm run lint` → lint TypeScript/TSX
- `npm run test` / `test:watch` / `test:coverage` → Jest

## Cara Menjalankan Lokal

1. Backend
   - `cd apps/backend`
   - `npm install`
   - `npm run dev`
2. Frontend
   - `cd apps/frontend`
   - `npm install`
   - `npm run dev`

Default local:

- API: `http://localhost:3333`
- Frontend: `http://localhost:5173`

## Catatan Data & Database

- File database aktif di root: `database.sqlite`.
- Terdapat beberapa file backup SQLite di root project untuk recovery/migrasi data.
- Hindari overwrite database produksi secara manual; gunakan script migrasi yang tersedia.

## Referensi Utama

- `README.md` untuk pengantar proyek
- `apps/backend/src/routes/index.ts` untuk daftar route terkini
- `apps/backend/package.json` dan `apps/frontend/package.json` untuk script terbaru
- `QWEN.md` sebagai dokumen pendamping lama (jika masih dipakai tim)

## Panduan Endpoint per Modul (Untuk Junior Programmer)

Semua endpoint di bawah memakai prefix `/api`.  
Contoh: jika tertulis `GET /employees`, endpoint penuhnya adalah `GET /api/employees`.

### 1) Autentikasi (`/auth`)

- Tujuan: login/register user aplikasi.
- Endpoint:
  - `POST /auth/login`
  - `POST /auth/register`
- Catatan pengembangan:
  - Simpan logic validasi kredensial di controller/service auth.
  - Jika menambah endpoint auth baru, pastikan kontrak response konsisten (`success`, `data/message`).

### 2) Pengguna (`/users`)

- Tujuan: kelola akun pengguna.
- Endpoint:
  - `GET /users`
  - `GET /users/:id`
  - `PUT /users/:id`
  - `PUT /users/:id/password`
  - `POST /users/:id/avatar` (multipart field: `avatar`)
  - `DELETE /users/:id`
- Catatan:
  - Endpoint avatar sudah pakai upload middleware.
  - Fitur sensitif (password/profile) sebaiknya tetap lewat validasi role + ownership.

### 3) Pegawai (`/employees`)

- Tujuan: master data pegawai + statistik dasar.
- Endpoint:
  - `GET /employees`
  - `GET /employees/:id`
  - `POST /employees`
  - `POST /employees/with-user`
  - `PUT /employees/:id`
  - `PUT /employees/:id/payroll-info`
  - `DELETE /employees/:id`
  - `GET /employees/charts/gender-distribution`
  - `GET /employees/charts/education-distribution`
  - `GET /employees/charts/department-distribution`
- Catatan:
  - Pembuatan pegawai bisa sekaligus pembuatan akun (`with-user`).
  - Untuk perubahan skema pegawai, update query laporan dan dashboard juga.

### 4) Absensi (`/attendance`)

- Tujuan: clock-in/out dan administrasi data kehadiran.
- Endpoint:
  - `GET /attendance`
  - `GET /attendance/:id`
  - `GET /attendance/employee/:id`
  - `POST /attendance/clock-in`
  - `POST /attendance/clock-out`
  - `POST /attendance/upload` (multipart field: `file`)
  - `POST /attendance`
  - `PUT /attendance/:id`
  - `DELETE /attendance/:id`
- Catatan:
  - `clock-in`/`clock-out` untuk alur operasional harian.
  - `upload` dipakai untuk import/bulk log.

### 5) Cuti (`/leave-requests`)

- Tujuan: pengajuan, persetujuan, dan saldo cuti.
- Endpoint:
  - `GET /leave-requests`
  - `GET /leave-requests/batch-sisa-cuti`
  - `GET /leave-requests/cuti-bersama`
  - `GET /leave-requests/employee/:employeeId`
  - `GET /leave-requests/sisa-cuti/:employeeId`
  - `GET /leave-requests/:id`
  - `POST /leave-requests` (multipart optional field: `supportingDocument`)
  - `PUT /leave-requests/:id/status`
  - `DELETE /leave-requests/:id`
- Catatan:
  - Endpoint status adalah titik utama workflow approval.
  - Saat menambah tipe cuti baru, cek dampaknya ke payroll dan laporan.

### 6) Penggajian (`/payrolls`)

- Tujuan: kelola payroll record dan proses payroll periodik.
- Endpoint:
  - `GET /payrolls`
  - `GET /payrolls/:id`
  - `GET /payrolls/employee/:id`
  - `POST /payrolls`
  - `POST /payrolls/run`
  - `POST /payrolls/:id/components`
  - `PATCH /payrolls/:id/status` (admin only)
  - `PUT /payrolls/:id`
  - `DELETE /payrolls/:id`
  - `GET /payrolls/:id/download`
- Catatan:
  - `run` dipakai untuk generate payroll massal.
  - `components` cocok untuk allowance/deduction terpisah.

### 7) Penilaian Kinerja (`/performance-reviews`)

- Tujuan: siklus review kinerja individual.
- Endpoint:
  - `GET /performance-reviews`
  - `GET /performance-reviews/:id`
  - `GET /performance-reviews/employee/:id`
  - `POST /performance-reviews`
  - `PUT /performance-reviews/:id`
  - `PUT /performance-reviews/:id/feedback`
  - `PUT /performance-reviews/:id/self-assessment`
  - `PUT /performance-reviews/:id/transition`
  - `DELETE /performance-reviews/:id`
- Catatan:
  - Ada pembatasan akses berbasis role dan ownership pada beberapa endpoint.
  - Endpoint `transition` adalah pengendali status workflow review.

### 8) KPI Target (`/kpi-targets`) dan KPI Template (`/kpi-templates`)

- Tujuan: manajemen target KPI dan penerapan template KPI.
- Endpoint KPI target:
  - `GET /kpi-targets/summary`
  - `GET /kpi-targets`
  - `GET /kpi-targets/employee/:employeeId`
  - `GET /kpi-targets/:id`
  - `POST /kpi-targets`
  - `POST /kpi-targets/generate-from-abk`
  - `POST /kpi-targets/rebalance`
  - `POST /kpi-targets/sync-wla`
  - `PUT /kpi-targets/:id`
  - `PUT /kpi-targets/:id/actual` (multipart field: `evidence`)
  - `POST /kpi-targets/:id/evidence` (multipart field: `evidence`)
  - `DELETE /kpi-targets/:id`
- Endpoint KPI template:
  - `GET /kpi-templates`
  - `POST /kpi-templates/apply`
- Catatan:
  - Mayoritas write endpoint KPI dibatasi role manajerial.
  - `apply` pada template akan membuat entri `kpi_targets` untuk employee + period.

### 9) Performance Cycle Orchestration (`/performance-cycle`)

- Tujuan: orkestrasi siklus performa (level batch/periode).
- Endpoint:
  - `POST /performance-cycle/open`
  - `POST /performance-cycle/sync-kpi`
  - `POST /performance-cycle/create-reviews`
  - `POST /performance-cycle/finalize`
- Catatan:
  - Endpoint ini cocok dipanggil admin pada milestone periodik.
  - Saat ubah alur cycle, pastikan sinkron dengan modul kinerja + KPI.

### 10) Jabatan (`/jabatan`)

- Tujuan: struktur jabatan dan hirarki organisasi.
- Endpoint:
  - `GET /jabatan`
  - `GET /jabatan/:id`
  - `POST /jabatan`
  - `PUT /jabatan/:id`
  - `DELETE /jabatan/:id`
  - `GET /jabatan/tree`
  - `GET /jabatan/tree-with-employees`
  - `GET /jabatan/level/:level`
  - `GET /jabatan/subordinates/:pegawaiId`
- Catatan:
  - Dipakai untuk kebutuhan struktur approval dan reporting line.

### 11) Kontrak (`/contracts`)

- Tujuan: kelola kontrak kerja + riwayat jabatan.
- Endpoint:
  - `GET /contracts`
  - `GET /contracts/:id`
  - `GET /contracts/expiring`
  - `GET /contracts/employee/:employeeId`
  - `POST /contracts` (multipart field: `contractFile`)
  - `PUT /contracts/:id` (multipart field: `contractFile`)
  - `DELETE /contracts/:id`
  - `GET /contracts/job-history/employee/:id`
  - `POST /contracts/job-history/employee/:id`
- Catatan:
  - `expiring` penting untuk reminder otomatis.

### 12) Pelatihan (`/pelatihan`)

- Tujuan: data training dan sertifikat pegawai.
- Endpoint:
  - `GET /pelatihan`
  - `GET /pelatihan/employee/:id`
  - `POST /pelatihan/employee/:id` (multipart field: `certificate`)
- Catatan:
  - Attachment sertifikat dikelola melalui upload middleware.

### 13) Perekrutan (`/recruitment`)

- Tujuan: CRUD data kandidat.
- Endpoint:
  - `GET /recruitment/candidates`
  - `GET /recruitment/candidates/:id`
  - `POST /recruitment/candidates`
  - `PUT /recruitment/candidates/:id`
  - `DELETE /recruitment/candidates/:id`

### 14) Orientasi (`/onboarding`)

- Tujuan: tugas onboarding pegawai baru.
- Endpoint:
  - `GET /onboarding/employee/:employeeId/tasks`
  - `POST /onboarding/employee/:employeeId/tasks`
  - `PUT /onboarding/tasks/:taskId`
  - `DELETE /onboarding/tasks/:taskId`

### 15) Task Operasional (`/tasks`)

- Tujuan: assignment task supervisor-employee.
- Endpoint:
  - `POST /tasks`
  - `GET /tasks/supervisor/:supervisor_id`
  - `GET /tasks/employee/:employee_id`
  - `PUT /tasks/:id/status`
  - `DELETE /tasks/:id`
- Catatan:
  - Sudah ada guard scope (`ensure*Scope`) + role restriction.
  - Pattern ini bisa dijadikan referensi untuk modul yang butuh ownership check.

### 16) Workload Analysis (`/workload`)

- Tujuan: analisis beban kerja per employee.
- Endpoint:
  - `GET /workload/:employeeId`
  - `POST /workload`
  - `PUT /workload/:id/submit`
  - `PUT /workload/:id/approve`
- Catatan:
  - `submit`/`approve` merepresentasikan tahapan workflow.

### 17) Log Aktivitas Harian (`/log-aktivitas-harian`)

- Tujuan: pencatatan aktivitas kerja harian + approval.
- Endpoint:
  - `POST /log-aktivitas-harian/bulk`
  - `POST /log-aktivitas-harian`
  - `GET /log-aktivitas-harian/my-logs`
  - `GET /log-aktivitas-harian/summary`
  - `GET /log-aktivitas-harian/admin/summary`
  - `GET /log-aktivitas-harian/admin/logs`
  - `PUT /log-aktivitas-harian/:id/status`
- Catatan:
  - Endpoint admin dibatasi role `admin/pimpinan/supervisor`.

### 18) Notifikasi (`/notifikasi`)

- Tujuan: notifikasi user dan status baca.
- Endpoint:
  - `GET /notifikasi/employee/:employeeId`
  - `GET /notifikasi/employee/:employeeId/unread`
  - `POST /notifikasi/employee/:employeeId`
  - `PUT /notifikasi/:notificationId/read`
  - `GET /notifikasi/scheduled`
- Catatan:
  - Untuk reminder otomatis terjadwal, cek scheduler di backend jobs.

### 19) Laporan (`/reports`)

- Tujuan: laporan operasional, analitik, ekspor, custom report.
- Endpoint standard:
  - `GET /reports/employees`
  - `GET /reports/attendance`
  - `GET /reports/payroll`
  - `GET /reports/leave`
  - `GET /reports/performance`
  - `GET /reports/turnover`
  - `GET /reports/demographics`
- Endpoint analitik:
  - `GET /reports/employees/comprehensive`
  - `GET /reports/attendance/analytics`
  - `GET /reports/payroll/analytics`
- Endpoint export:
  - `GET /reports/employees/export`
  - `GET /reports/attendance/export`
  - `GET /reports/payroll/export`
  - `GET /reports/leave/export`
  - `GET /reports/performance/export`
- Endpoint custom report:
  - `GET /reports/custom/metadata`
  - `POST /reports/custom/generate`
  - `POST /reports/custom/export`
- Catatan:
  - Untuk fitur baru, prioritaskan reuse service query agar endpoint standar dan export tetap sinkron.

### 20) Dashboard (`/dashboard`)

- Tujuan: agregasi metrik untuk role tertentu.
- Endpoint:
  - `GET /dashboard/admin`
  - `GET /dashboard/supervisor`
  - `GET /dashboard/employee/:employeeId`
  - `GET /dashboard/recent-activity`

### 21) Company Settings (`/company-settings`)

- Tujuan: profil perusahaan dan branding.
- Endpoint:
  - `GET /company-settings`
  - `PUT /company-settings` (multipart field: `logo`)

### 22) Activity Library (`/activity-library`)

- Tujuan: katalog aktivitas acuan.
- Endpoint:
  - `GET /activity-library`
  - `GET /activity-library/positions`
  - `GET /activity-library/position/:position`
  - `GET /activity-library/:id`
  - `POST /activity-library`
  - `PUT /activity-library/:id`
  - `DELETE /activity-library/:id`
- Catatan:
  - Semua endpoint butuh auth token; write endpoint dibatasi `admin/pimpinan`.

### 23) Audit Log (`/audit-logs`) dan Changelog (`/changelog`)

- Tujuan: jejak perubahan sistem.
- Endpoint audit:
  - `GET /audit-logs`
  - `POST /audit-logs`
- Endpoint changelog:
  - `GET /changelog`
  - `POST /changelog`
- Catatan:
  - Keduanya dibatasi role `admin/pimpinan`.

### 24) Integration API (`/integrations`)

- Tujuan: endpoint konsumsi sistem eksternal (API key based).
- Endpoint:
  - `GET /integrations/employees`
  - `GET /integrations/attendance`
  - `GET /integrations/leaves`
  - `POST /integrations/attendance`
  - `POST /integrations/daily-activities`
- Catatan:
  - Endpoint ini menggunakan `apiKeyMiddleware`, bukan JWT user login biasa.

### 25) Backup (`/backup`)

- Tujuan: backup dan restore data.
- Endpoint:
  - `POST /backup/backup`
  - `POST /backup/restore`

### Checklist Saat Menambah Endpoint Baru

- Tambahkan route di file modul `*.routes.ts`, lalu daftarkan di `apps/backend/src/routes/index.ts` jika modul baru.
- Pisahkan tanggung jawab Controller → Service → Repository (jangan query SQL kompleks di route).
- Reuse middleware yang ada: `authenticateToken`, `restrictTo`, dan middleware scope/ownership.
- Definisikan validasi request body/query/path secara eksplisit sebelum logic bisnis.
- Jaga konsistensi bentuk response agar frontend mudah integrasi.
- Tambahkan minimal 1 skenario test untuk success path dan 1 untuk error path.

## Changelog Dokumen

- April 2026: `GEMINI.md` disesuaikan total ke kondisi repo aktual (struktur folder, modul backend/frontend, route root, script, dan runtime behavior).
