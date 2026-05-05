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

## Template Standar Endpoint (Semua Modul)

Section ini adalah format baku yang direkomendasikan untuk dokumentasi endpoint baru/eksisting agar junior programmer punya pola kerja yang konsisten.

### A. Template Universal (Copy-Paste)

```md
### [METHOD] /api/[path]

Tujuan:
- [fungsi endpoint]

Auth:
- [Publik | Bearer Token | API Key]

Role:
- [admin/pimpinan/supervisor/employee atau N/A]

Path Params:
- [namaParam]: [tipe], [wajib/opsional], [keterangan]

Query Params:
- [namaParam]: [tipe], [wajib/opsional], [keterangan]

Request Body (JSON):
```json
{
  "fieldA": "string",
  "fieldB": 0
}
```

Request Body (Multipart) [jika ada]:
- file field: `[namaFieldFile]`
- form fields: `[field1, field2]`

Validasi Wajib:
- [daftar validasi]

Contoh Success Response:
```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

Contoh Error Response:
```json
{
  "success": false,
  "message": "Pesan error yang jelas",
  "errors": [
    { "field": "fieldA", "message": "fieldA wajib diisi" }
  ]
}
```
```

### B. Konvensi Response yang Disarankan

- Success:
  - `success: true`
  - `message`: string ringkas
  - `data`: object/array
  - `meta`: untuk paginasi/list (opsional)
- Error:
  - `success: false`
  - `message`: human-readable
  - `errors`: detail validasi (opsional)

### C. Standar Validasi Minimum

- `:id`/`:employeeId`/`:taskId` harus non-empty string.
- Field numerik (`weight`, `targetValue`, `baseSalary`, dsb.) harus number valid.
- Field tanggal (`period`, `startDate`, `endDate`) harus format konsisten.
- Upload endpoint wajib cek file existence + tipe file.
- Endpoint perubahan status wajib validasi nilai enum status.

## Template Per Modul (Contoh Siap Pakai)

> Catatan: semua contoh di bawah adalah template dokumentasi. Sesuaikan field final dengan implementasi controller/service terbaru saat coding.

### 1) Auth — `POST /api/auth/login`
- Request body:
```json
{ "email": "admin@company.com", "password": "secret123" }
```
- Validasi wajib:
  - `email` wajib format email.
  - `password` minimal 8 karakter.
- Success response:
```json
{ "success": true, "message": "Login berhasil", "data": { "accessToken": "...", "user": {} } }
```
- Error response:
```json
{ "success": false, "message": "Email atau password salah" }
```

### 2) Users — `PUT /api/users/:id/password`
- Request body:
```json
{ "oldPassword": "old12345", "newPassword": "newStrong123" }
```
- Validasi wajib:
  - `id` wajib ada.
  - `oldPassword` dan `newPassword` wajib.
  - `newPassword` minimal 8 karakter.
- Success: password berubah.
- Error: password lama salah / user tidak ditemukan.

### 3) Employees — `POST /api/employees/with-user`
- Request body (JSON):
```json
{ "name": "Budi", "nip": "EMP-001", "department": "IT", "email": "budi@company.com", "role": "employee" }
```
- Validasi wajib:
  - `name`, `nip`, `department`, `email` wajib.
  - `email` unik.
  - `nip` unik.
- Success: data pegawai + akun user terbentuk.
- Error: konflik data unik (`email`/`nip`).

### 4) Attendance — `POST /api/attendance/clock-in`
- Request body:
```json
{ "employeeId": "emp-001" }
```
- Validasi wajib:
  - `employeeId` wajib.
  - Tidak boleh clock-in ganda pada hari yang sama (sesuai rule bisnis).
- Success: attendance row baru.
- Error: pegawai tidak ditemukan / sudah clock-in.

### 5) Leave Requests — `PUT /api/leave-requests/:id/status`
- Request body:
```json
{ "status": "approved", "note": "Disetujui supervisor" }
```
- Validasi wajib:
  - `id` wajib.
  - `status` hanya `approved` atau `rejected`.
  - `note` wajib jika `status=rejected`.
- Success: status cuti terupdate.
- Error: request tidak ditemukan / status tidak valid.

### 6) Payroll — `POST /api/payrolls/run`
- Request body:
```json
{ "period": "2026-04" }
```
- Validasi wajib:
  - `period` wajib format periode yang dipakai sistem.
  - Pastikan payroll period belum final/locked.
- Success: ringkasan payroll yang berhasil digenerate.
- Error: period invalid / proses gagal.

### 7) Performance Reviews — `PUT /api/performance-reviews/:id/transition`
- Request body:
```json
{ "status": "approved", "notes": "Review selesai" }
```
- Validasi wajib:
  - `status` masuk enum status review.
  - Hanya role berwenang yang boleh transition.
- Success: status review berubah.
- Error: forbidden / transisi tidak valid.

### 8) KPI Targets — `PUT /api/kpi-targets/:id/actual`
- Request body (multipart):
  - file: `evidence`
  - form: `actualValue`
- Validasi wajib:
  - `actualValue` numerik.
  - file evidence opsional/wajib sesuai kebijakan modul.
- Success: actual KPI terupdate + lampiran tersimpan.
- Error: format angka/file tidak valid.

### 9) KPI Templates — `POST /api/kpi-templates/apply`
- Request body:
```json
{ "employeeId": "emp-001", "period": "2026-Q2", "department": "IT" }
```
- Validasi wajib:
  - `employeeId` dan `period` wajib.
  - Minimal salah satu: `department` atau `templateIds`.
- Success: jumlah KPI created/skipped.
- Error: template tidak ditemukan / payload tidak lengkap.

### 10) Performance Cycle — `POST /api/performance-cycle/open`
- Request body:
```json
{ "period": "2026-Q2", "startDate": "2026-04-01", "endDate": "2026-06-30" }
```
- Validasi wajib:
  - `period`, `startDate`, `endDate` wajib.
  - `startDate <= endDate`.
- Success: period cycle terbuka.
- Error: period duplikat / tanggal tidak valid.

### 11) Jabatan — `POST /api/jabatan`
- Request body:
```json
{ "name": "Supervisor IT", "level": 3, "parentId": "jab-001" }
```
- Validasi wajib:
  - `name` dan `level` wajib.
  - `parentId` valid jika diisi.
- Success: jabatan baru tersimpan.
- Error: parent tidak ditemukan / data invalid.

### 12) Contracts — `POST /api/contracts`
- Request body (multipart):
  - file: `contractFile`
  - form: `employeeId`, `contractType`, `startDate`, `endDate`
- Validasi wajib:
  - `employeeId`, `contractType`, `startDate`, `endDate` wajib.
  - `endDate` harus >= `startDate`.
- Success: kontrak baru tersimpan.
- Error: data kontrak tidak valid.

### 13) Pelatihan — `POST /api/pelatihan/employee/:id`
- Request body (multipart):
  - file: `certificate` (opsional sesuai kebijakan)
  - form: `nama_pelatihan`, `penyelenggara`, `tanggal_mulai`, `tanggal_selesai`
- Validasi wajib:
  - `id` pegawai valid.
  - field tanggal valid.
- Success: data pelatihan tersimpan.
- Error: pegawai tidak ditemukan / upload gagal.

### 14) Recruitment — `POST /api/recruitment/candidates`
- Request body:
```json
{ "name": "Sinta", "email": "sinta@mail.com", "position": "Backend Engineer", "status": "applied" }
```
- Validasi wajib:
  - `name`, `email`, `position` wajib.
  - `email` valid format.
- Success: kandidat tersimpan.
- Error: data kandidat invalid.

### 15) Onboarding — `POST /api/onboarding/employee/:employeeId/tasks`
- Request body:
```json
{ "task_name": "Buat akun email kantor", "description": "Koordinasi dengan tim IT", "due_date": "2026-04-30" }
```
- Validasi wajib:
  - `employeeId` valid.
  - `task_name` dan `due_date` wajib.
- Success: task orientasi dibuat.
- Error: employee tidak ditemukan.

## Aturan & Checklist Mencegah Error Berulang (Pre-flight Checks)

Bagian ini ditambahkan berdasarkan evaluasi dari beberapa bug yang sempat terjadi pada tahap pengembangan sebelumnya. Selalu periksa daftar ini *sebelum* Anda melakukan implementasi (*development*) atau modifikasi pada fitur berikutnya:

### 1. Keamanan Pengecekan Properti Frontend (React Rendering)
**Penyebab Error Sebelumnya:** 
Error *force close* layar putih (TypeError) pada halaman Entry WLA Harian terjadi karena pengecekan properti dengan `optional chaining` tidak dilakukan secara tuntas, contohnya: `obj.property?.toUpperCase().includes('keyword')`. Jika `property` adalah `undefined`, maka `.includes()` dipanggil pada `undefined`, yang menyebabkan komponen React *crash*.
**Aturan Baru (Checklist):**
- [ ] Setiap kali memanggil metode rantai (seperti `.toUpperCase()`, `.toLowerCase()`, atau `.includes()`), berikan *fallback* nilai default secara eksplisit.
- [ ] **Jangan gunakan:** `act.activityName?.toUpperCase().includes('...')`
- [ ] **Gunakan:** `(act.activityName || '').toUpperCase().includes('...')`
- [ ] Selalu validasi bahwa respons array atau objek dari backend tidak membuat *mapping* `map()` frontend rusak karena ekspektasi tipe data yang salah.

### 2. Inkonsistensi Penamaan Kolom di Backend & Skema SQLite
**Penyebab Error Sebelumnya:**
Backend mengalami *Internal Server Error 500* karena kueri SQL menggunakan nama kolom usang (`id` dan `activity_library_id`), sedangkan struktur database tabel SQLite sebenarnya adalah `id_log` dan `id_activity_library`.
**Aturan Baru (Checklist):**
- [ ] Sebelum menyusun kueri SQL (terutama untuk tabel yang kompleks seperti `log_aktivitas_harian`), SELALU periksa struktur aslinya terlebih dahulu. 
- [ ] Cara validasi: gunakan *script check_db* atau tanyakan skema tabel yang sebenarnya di dalam *SQLite* sebelum menulis *Query* manual pada layer *Service* atau *Repository*.

### 3. Validasi Properti Auth User (JWT Payload)
**Penyebab Error Sebelumnya:**
Terdapat *Error 401 Unauthorized* pada akses API (`/api/kredit-berkas/pending`) ketika diakses oleh *Role Admin*. Penyebabnya adalah *controller* mengekstrak `req.user.id` sedangkan JWT *payload* menyimpan ID pengguna dengan key `userId` (dan `employeeId` untuk data pegawai). Akibatnya, `req.user.id` bernilai *undefined*.
**Aturan Baru (Checklist):**
- [ ] Saat mengambil ID dari `req.user` (lewat `authMiddleware`), gunakan pencarian yang mencakup semua probabilitas tipe pengguna:
  ```typescript
  const id = req.user?.employeeId || req.user?.userId || req.user?.id;
  ```
- [ ] Selalu cek apakah endpoint tersebut digunakan lintas *role* (pegawai biasa vs admin). Jika digunakan lintas *role*, pastikan metode *fallback* ke `userId` ada agar proses autentikasi tidak menolak admin karena tidak memiliki `employeeId`.

### 4. Standar Workflow Deployment (Docker)
Setiap selesai melakukan perubahan file kode (terutama frontend):
- [ ] Kode frontend (React) memerlukan proses *rebuild* jika ada file baru atau perubahan *state* logika yang persisten. Gunakan perintah standar untuk me-rebuild spesifik komponen guna menghemat waktu (contoh: `docker compose up -d --build sdm` untuk frontend atau `docker compose up -d --build backend` untuk Node.js API).
- [ ] Perubahan arsitektur struktur tabel *wajib* disertakan dengan *script SQL migration*. Jangan menggunakan teknik paksa salin `docker cp database.sqlite`!

Dengan menaati keempat *checklist* di atas sebelum memprogram fitur baru, sistem portal SDM ini akan terhindar dari regresi atau kemunculan kembali error-error serupa.

### 16) Tasks — `PUT /api/tasks/:id/status`
- Request body:
```json
{ "status": "done", "progress": 100 }
```
- Validasi wajib:
  - `status` dalam enum task.
  - user memiliki akses scope untuk task tersebut.
- Success: status task terupdate.
- Error: forbidden / task tidak ditemukan.

### 17) Workload — `PUT /api/workload/:id/approve`
- Request body:
```json
{ "approvalNote": "Disetujui, lanjutkan periode berikutnya" }
```
- Validasi wajib:
  - role harus `admin/pimpinan/supervisor`.
  - `id` analisis harus ada.
- Success: workload approved.
- Error: unauthorized / data tidak ditemukan.

### 18) Log Aktivitas Harian — `POST /api/log-aktivitas-harian`
- Request body (multipart/json tergantung implementasi):
```json
{ "tanggal": "2026-04-17", "aktivitas": "Menyusun laporan KPI", "durasiJam": 4 }
```
- Validasi wajib:
  - `tanggal`, `aktivitas` wajib.
  - `durasiJam` numerik positif.
- Success: log tersimpan.
- Error: payload invalid.

### 19) Notifikasi — `PUT /api/notifikasi/:notificationId/read`
- Request body: tidak wajib (atau optional metadata).
- Validasi wajib:
  - `notificationId` valid.
  - notifikasi milik user yang login (ownership check).
- Success: status notifikasi menjadi read.
- Error: notifikasi tidak ditemukan/forbidden.

### 20) Reports — `GET /api/reports/payroll`
- Query contoh:
  - `?period=2026-04&department=IT&page=1&limit=20`
- Validasi wajib:
  - `period` sesuai format.
  - `page`/`limit` numerik.
- Success:
```json
{ "success": true, "data": [], "meta": { "page": 1, "limit": 20, "total": 120 } }
```
- Error: query tidak valid.

### 21) Dashboard — `GET /api/dashboard/employee/:employeeId`
- Request body: tidak ada.
- Validasi wajib:
  - `employeeId` valid.
  - role/ownership valid untuk akses dashboard employee.
- Success: agregasi KPI, attendance, payroll ringkas.
- Error: forbidden / employee tidak ditemukan.

### 22) Company Settings — `PUT /api/company-settings`
- Request body (multipart):
  - file: `logo`
  - form: `companyName`, `address`, `phone`, `email`
- Validasi wajib:
  - field identitas perusahaan wajib sesuai kebijakan.
  - tipe file logo valid (jpg/png/webp).
- Success: settings terupdate.
- Error: validasi gagal / upload gagal.

### 23) Activity Library — `POST /api/activity-library`
- Request body:
```json
{ "position": "Analis SDM", "activityName": "Evaluasi KPI bulanan", "defaultDuration": 2 }
```
- Validasi wajib:
  - role `admin/pimpinan`.
  - `position` dan `activityName` wajib.
- Success: item library tersimpan.
- Error: unauthorized / payload invalid.

### 24) Audit Logs — `POST /api/audit-logs`
- Request body:
```json
{ "action": "UPDATE_PAYROLL", "actorId": "usr-001", "entityType": "payroll", "entityId": "pay-123", "metadata": {} }
```
- Validasi wajib:
  - role `admin/pimpinan`.
  - `action`, `actorId`, `entityType`, `entityId` wajib.
- Success: audit log tersimpan.
- Error: unauthorized / payload invalid.

### 25) Changelog — `POST /api/changelog`
- Request body:
```json
{ "version": "v3.4.0", "title": "Payroll enhancement", "description": "Menambah endpoint payroll status patch" }
```
- Validasi wajib:
  - role `admin/pimpinan`.
  - `version`, `title`, `description` wajib.
- Success: entri changelog dibuat.
- Error: validasi gagal.

### 26) Integrations — `POST /api/integrations/attendance`
- Auth:
  - API Key (`apiKeyMiddleware`)
- Request body:
```json
{ "employeeId": "emp-001", "date": "2026-04-17", "clockIn": "08:00:00", "clockOut": "17:00:00" }
```
- Validasi wajib:
  - API key valid.
  - field attendance inti wajib.
- Success: data absensi terbuat dari sistem eksternal.
- Error: unauthorized API key / payload invalid.

### 27) Backup — `POST /api/backup/restore`
- Request body:
```json
{ "backupFile": "backup_2026_04_17.sqlite" }
```
- Validasi wajib:
  - role admin only (disarankan).
  - file backup harus ada dan tervalidasi.
- Success: restore selesai.
- Error: file tidak ditemukan / restore gagal.

## Changelog Dokumen

- April 2026: `GEMINI.md` disesuaikan total ke kondisi repo aktual (struktur folder, modul backend/frontend, route root, script, dan runtime behavior).
