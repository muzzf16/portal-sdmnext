
**portal-sdm** adalah HRMS modular full-stack:

* Frontend: **React + TypeScript + Vite + Tailwind**
* Backend: **Node.js + Express + sqlite3** (penggunaan `sqlite3` package)
* Deployment: **VPS** (Nginx reverse proxy) + **PM2** untuk proses Node.js
* Pattern: Feature-based modular architecture (frontend `features/*`, backend `modules/*`)
* Goal: production-ready, maintainable, skalabel untuk tim pengembang.

---

## Table of contents

1. Project layout (monorepo)
2. Frontend architecture (struktur & detail)
3. Backend architecture (struktur, contoh file, run)
4. API spec (endpoints utama + contoh request/response)
5. Database schema (sqlite3) — tabel inti & field
6. Data flow (text diagram)
7. Auth, security & best practices
8. Local development & npm scripts
9. Testing & CI recommendations
10. Deployment guide (VPS + Nginx + PM2)
11. Docs & maintenance checklist

---
**STRUKTUR MODUL UTAMA**
| Modul                                            | Fungsi Utama                                                                   | Catatan                                             |
| ------------------------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------- |
| **1. Master Data Pegawai**                       | Menyimpan dan mengelola seluruh informasi karyawan.                            | Dasar semua modul lain.                             |
| **2. Absensi & Kehadiran**                       | Catat jam masuk, keluar, lembur, izin, keterlambatan.                          | Bisa manual atau terhubung alat (fingerprint/RFID). |
| **3. Cuti & Izin**                               | Manajemen cuti tahunan, sakit, dll.                                            | Termasuk sistem approval berjenjang.                |
| **4. Penggajian (Payroll)**                      | Hitung gaji otomatis berdasarkan absensi, tunjangan, potongan.                 | Integrasi ke BPJS, pajak, pinjaman, lembur.         |
| **5. Manajemen Kontrak & Jabatan**               | Kelola masa kontrak, promosi, mutasi, atau demosi.                             | Reminder otomatis saat kontrak hampir habis.        |
| **6. Penilaian Kinerja (Performance Appraisal)** | Evaluasi kinerja, KPI, skor, feedback.                                         | Bisa input supervisor dan rekan kerja.              |
| **7. Rekrutmen & Onboarding**                    | Modul untuk lamaran kerja, seleksi, dan orientasi.                             | Menyimpan data kandidat.                            |
| **8. Pelatihan & Sertifikasi (Training)**        | Riwayat pelatihan dan sertifikat pegawai.                                      | Bisa dilampirkan file PDF/scan sertifikat.          |
| **9. Laporan & Analitik**                        | Laporan bulanan: absensi, gaji, kinerja, cuti, turnover.                       | Export PDF/Excel dan dashboard statistik.           |
| **10. Notifikasi & Pengingat Otomatis**          | Email/WhatsApp reminder: cuti disetujui, kontrak habis, lembur disetujui, dll. | Bisa pakai API WA atau email gateway.               |


## 1. Project layout (monorepo)

```
hrms/
├── apps/
│   ├── backend/           # Node/Express API (sqlite3)
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── db.ts
│   │   │   ├── modules/
│   │   │   │   ├── employee/
│   │   │   │   │   ├── employee.controller.ts
│   │   │   │   │   ├── employee.service.ts
│   │   │   │   │   └── employee.repository.ts
│   │   │   │   └── ... (attendance, leave, payroll, performance, notifications)
│   │   │   ├── routes/
│   │   │   │   └── index.ts
│   │   │   ├── middleware/
│   │   │   │   ├── authMiddleware.ts
│   │   │   │   └── errorHandler.ts
│   │   │   ├── utils/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   └── database.sqlite
│   └── frontend/
│       ├── package.json
│       ├── vite.config.ts
│       └── src/
│           ├── app/               # App root, providers, layout
│           ├── features/
│           │   ├── 01-employee/
│           │   ├── 02-attendance/
│           │   └── ... (03-10)
│           ├── shared/            # UI components, hooks, utils
│           ├── routes/
│           ├── styles/
│           └── main.tsx
├── packages/
│   ├── shared/   # (optional) shared types & helpers across apps
│   └── ui/       # (optional) shared react-ui package
├── docs/
│   └── QWEN.md (QWEN architecture document)
├── .env
└── README.md
```

---

## 2. Frontend architecture (struktur & detail)

### 2.1 Prinsip

* **Feature-sliced**: setiap fitur punya subfolder (`components`, `hooks`, `pages`, `api`, `types`).
* **Shared** menyimpan komponen UI (Button, Card, Table), hooks global (useApi), utils, dan type definitions.
* **Providers**: `AuthProvider`, `NotificationProvider`, `ToastProvider`, `LayoutProvider`.
* **Routing**: React Router v6+ dengan `DashboardLayout` (Sidebar + Header + Outlet).

### 2.2 Contoh folder `src/` (frontend)

```
src/
├── app/
│   ├── App.tsx
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   └── index.tsx  (AppProviders)
│   └── layout/
│       └── DashboardLayout.tsx
├── features/
│   ├── 01-employee/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   └── ...
├── shared/
│   ├── components/ui/
│   ├── hooks/
│   ├── utils/
│   └── types/
├── routes/
├── styles/global.css
└── main.tsx
```

### 2.3 Best practices frontend

* Use `React Query` / `TanStack Query` (opsional) untuk caching server state.
* `useApi` hook menggunakan Axios with baseURL `process.env.VITE_API_BASE`.
* Lazy load route components (`React.lazy` + `Suspense`).
* Centralized ErrorBoundary at App root.
* Tailwind theme tokens (colors, spacing) di `tailwind.config.ts`.

---

## 3. Backend architecture (struktur, contoh file, run)

### 3.1 Prinsip

* Layers: Controller → Service → Repository → DB
* `sqlite3` package untuk koneksi (simple). Alternatif: better-sqlite3 (sync) atau Drizzle ORM jika ingin type-safe.
* Modular per domain (employee, attendance, payroll, ...).

### 3.2 Contoh `apps/backend/src` (ringkas)

```
src/
├── config/
│   └── db.ts
├── modules/
│   └── employee/
│       ├── employee.controller.ts
│       ├── employee.service.ts
│       └── employee.repository.ts
├── routes/
│   └── index.ts
├── middleware/
│   ├── authMiddleware.ts
│   └── errorHandler.ts
├── utils/
│   ├── jwt.ts
│   └── response.ts
├── app.ts
└── server.ts
```

### 3.3 Contoh `db.ts` (sqlite3)

```ts
// src/config/db.ts
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDb() {
  return open({
    filename: process.env.DB_SOURCE || './database.sqlite',
    driver: sqlite3.Database
  });
}
```

### 3.4 Contoh `employee.repository.ts`

```ts
// src/modules/employee/employee.repository.ts
import { openDb } from '../../config/db';

export const EmployeeRepository = {
  async findAll() {
    const db = await openDb();
    return db.all('SELECT * FROM employees ORDER BY nama ASC');
  },

  async findById(id:number) {
    const db = await openDb();
    return db.get('SELECT * FROM employees WHERE id = ?', id);
  },

  async create(payload:any) {
    const db = await openDb();
    const result = await db.run(
      `INSERT INTO employees (nama, nip, jabatan, departemen, tanggal_masuk) VALUES (?, ?, ?, ?, ?)`,
      payload.nama, payload.nip, payload.jabatan, payload.departemen, payload.tanggal_masuk
    );
    return result.lastID;
  }
}
```

### 3.5 Contoh `server.ts` & `app.ts`

```ts
// src/app.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes';
import errorHandler from './middleware/errorHandler';

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use('/api', routes);
app.use(errorHandler);
export default app;

// src/server.ts
import app from './app';
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`API running on ${PORT}`));
```

---

## 4. API spec (endpoints utama)

> Semua endpoint bawah path `/api`

### Auth

* `POST /auth/login` — body `{email, password}` → returns `{ accessToken, refreshToken, user }`
* `POST /auth/refresh` — body `{ refreshToken }` → returns new tokens

### Employee

* `GET /employees` — list pegawai (query: page, q, dept)
* `GET /employees/:id` — detail pegawai
* `POST /employees` — create
* `PUT /employees/:id` — update
* `DELETE /employees/:id` — delete

### Attendance

* `POST /attendance/clock-in` — `{ employeeId }`
* `POST /attendance/clock-out` — `{ employeeId }`
* `GET /attendance?employeeId=&month=YYYY-MM` — rekap

### Leave

* `GET /leave-requests` — list
* `POST /leave-requests` — create
* `PUT /leave-requests/:id` — approve/reject (body `{ status, note }`)

### Payroll

* `GET /payrolls?period=YYYY-MM` — rekap payroll
* `POST /payrolls/run` — generate gaji bulan

### Performance

* `GET /performance-reviews?employeeId=&period=YYYY-MM`
* `POST /performance-reviews`

**Response format** (konvensi)

```json
{
  "success": true,
  "data": ...,
  "meta": { "page": 1, "perPage": 20, "total": 120 }
}
```

---

## 5. Database schema (sqlite3) — tabel inti

1. Tabel Pegawai

| Kolom                | Tipe      | Keterangan                |
| -------------------- | --------- | ------------------------- |
| id                   | TEXT (PK) | ID unik pegawai           |
| name                 | TEXT      | Nama lengkap              |
| nip                  | TEXT      | Nomor Induk Pegawai       |
| position             | TEXT      | Jabatan                   |
| pangkat              | TEXT      | Pangkat/golongan pegawai  |
| golongan             | TEXT      | Golongan                  |
| department           | TEXT      | Departemen tempat bekerja |
| joinDate             | TEXT      | Tanggal masuk             |
| avatarUrl            | TEXT      | Foto profil               |
| jenis_kelamin        | TEXT      | Jenis kelamin             |
| leaveBalance         | INTEGER   | Sisa cuti                 |
| isActive             | INTEGER   | Status aktif (1=aktif)    |
| address              | TEXT      | Alamat                    |
| phone                | TEXT      | Nomor telepon             |
| pob                  | TEXT      | Tempat lahir              |
| dob                  | TEXT      | Tanggal lahir             |
| religion             | TEXT      | Agama                     |
| maritalStatus        | TEXT      | Status perkawinan         |
| numberOfChildren     | INTEGER   | Jumlah anak               |
| educationHistory     | TEXT      | Riwayat pendidikan        |
| workHistory          | TEXT      | Riwayat pekerjaan         |
| trainingCertificates | TEXT      | Sertifikat pelatihan      |
| payrollInfo          | TEXT      | Informasi gaji            |
| email                | TEXT      | Email                     |
| statusKaryawan       | TEXT      | Default `'aktif'`         |
| tanggalKeluar        | TEXT      | Jika resign               |
| createdAt            | DATETIME  | Timestamp pembuatan       |

2. Tabel Pengguna
| Kolom      | Tipe                   | Keterangan                  |
| ---------- | ---------------------- | --------------------------- |
| id         | TEXT (PK)              |                             |
| name       | TEXT                   |                             |
| email      | TEXT (unik)            |                             |
| password   | TEXT                   |                             |
| role       | TEXT                   | `'admin'` atau `'employee'` |
| employeeId | TEXT (FK → pegawai.id) |                             |
| createdAt  | DATETIME               |                             |

Relasi:
🔗 pengguna.employeeId → pegawai.id


3. Absensi

| Kolom        | Tipe                     |
| ------------ | ------------------------ |
| id           | TEXT (PK)                |
| employeeId   | TEXT (FK → pegawai.id)   |
| employeeName | TEXT                     |
| date         | TEXT                     |
| clockIn      | TEXT                     |
| clockOut     | TEXT                     |
| status       | TEXT (default `'hadir'`) |
| workDuration | TEXT                     |
| notes        | TEXT                     |
| created_at   | DATETIME                 |


4. permintaan cuti
| Kolom              | Tipe                        |
| ------------------ | --------------------------- |
| id                 | TEXT (PK)                   |
| employeeId         | TEXT (FK → pegawai.id)      |
| employeeName       | TEXT                        |
| leaveType          | TEXT                        |
| startDate          | TEXT                        |
| endDate            | TEXT                        |
| jumlahHari         | INTEGER                     |
| reason             | TEXT                        |
| status             | TEXT (default `'menunggu'`) |
| supportingDocument | TEXT                        |
| rejectionReason    | TEXT                        |
| createdAt          | DATETIME                    |


5. penggajian

| Kolom             | Tipe                   |
| ----------------- | ---------------------- |
| id                | TEXT (PK)              |
| employeeId        | TEXT (FK → pegawai.id) |
| employeeName      | TEXT                   |
| period            | TEXT                   |
| baseSalary        | REAL                   |
| incomes           | TEXT                   |
| deductions        | TEXT                   |
| totalIncome       | REAL                   |
| totalDeductions   | REAL                   |
| netSalary         | REAL                   |
| tanggalPembayaran | TEXT                   |
| createdAt         | DATETIME               |

6. penilaian_kinerja
| Kolom               | Tipe                   |
| ------------------- | ---------------------- |
| id                  | TEXT (PK)              |
| employeeId          | TEXT (FK → pegawai.id) |
| employeeName        | TEXT                   |
| period              | TEXT                   |
| reviewerName        | TEXT                   |
| reviewDate          | TEXT                   |
| overallScore        | REAL                   |
| status              | TEXT                   |
| strengths           | TEXT                   |
| areasForImprovement | TEXT                   |
| employeeFeedback    | TEXT                   |
| kpis                | TEXT                   |
| penilaiId           | TEXT                   |
| createdAt           | DATETIME               |



7. kontrak

| Kolom          | Tipe                   |
| -------------- | ---------------------- |
| id             | TEXT (PK)              |
| employeeId     | TEXT (FK → pegawai.id) |
| contractNumber | TEXT                   |
| contractType   | TEXT                   |
| startDate      | TEXT                   |
| endDate        | TEXT                   |
| status         | TEXT                   |
| contractFile   | TEXT                   |
| terms          | TEXT                   |
| salary         | REAL                   |
| notes          | TEXT                   |
| createdAt      | DATETIME               |

8. pelatihan

| Kolom            | Tipe                   |
| ---------------- | ---------------------- |
| id               | INTEGER (PK)           |
| pegawai_id       | TEXT (FK → pegawai.id) |
| nama_pelatihan   | TEXT                   |
| penyelenggara    | TEXT                   |
| tanggal_mulai    | TEXT                   |
| tanggal_selesai  | TEXT                   |
| nomor_sertifikat | TEXT                   |


9️⃣ riwayat_jabatan

| Kolom             | Tipe                   |
| ----------------- | ---------------------- |
| id                | INTEGER (PK)           |
| pegawai_id        | TEXT (FK → pegawai.id) |
| jabatan_lama      | TEXT                   |
| jabatan_baru      | TEXT                   |
| tanggal_perubahan | TEXT                   |


🔟 tugas_orientasi

| Kolom       | Tipe                   |
| ----------- | ---------------------- |
| id          | INTEGER (PK)           |
| employee_id | TEXT (FK → pegawai.id) |
| task_name   | TEXT                   |
| description | TEXT                   |
| due_date    | TEXT                   |
| completed   | INTEGER                |

📨 notifikasi

| Kolom       | Tipe                   |
| ----------- | ---------------------- |
| id          | INTEGER (PK)           |
| employee_id | TEXT (FK → pegawai.id) |
| message     | TEXT                   |
| type        | TEXT                   |
| is_read     | INTEGER                |
| created_at  | DATETIME               |


cuti

| Kolom               | Tipe                      |
| ------------------- | ------------------------- |
| id_cuti             | INTEGER (PK)              |
| id_pegawai          | INTEGER (FK → pegawai.id) |
| jenis_cuti          | TEXT                      |
| tanggal_mulai       | DATE                      |
| tanggal_selesai     | DATE                      |
| alasan              | TEXT                      |
| status_pengajuan    | TEXT                      |
| id_atasan_penyetuju | INTEGER                   |
| created_at          | DATETIME                  |


pinjaman_karyawan

| Kolom            | Tipe                      |
| ---------------- | ------------------------- |
| id_pinjaman      | INTEGER (PK)              |
| id_pegawai       | INTEGER (FK → pegawai.id) |
| tanggal_pinjaman | DATE                      |
| jumlah           | REAL                      |
| tenor            | INTEGER                   |
| cicilan_perbulan | REAL                      |
| sisa_pinjaman    | REAL                      |
| status_pinjaman  | TEXT                      |
| created_at       | DATETIME                  |


users

| Kolom      | Tipe                    |
| ---------- | ----------------------- |
| id         | INTEGER (PK)            |
| username   | TEXT                    |
| email      | TEXT                    |
| password   | TEXT                    |
| role       | TEXT                    |
| employeeId | TEXT (FK → pegawai.nip) |
| avatarUrl  | TEXT                    |
| created_at | DATETIME                |



notifications

| Kolom             | Tipe                    |
| ----------------- | ----------------------- |
| id                | TEXT (PK)               |
| employee_id       | TEXT (FK → pegawai.nip) |
| message           | TEXT                    |
| type              | TEXT                    |
| is_read           | INTEGER                 |
| created_at        | DATETIME                |
| scheduled_for     | DATETIME                |
| delivery_channel  | TEXT                    |
| related_entity    | TEXT                    |
| related_entity_id | TEXT                    |


pegawai.id ← pengguna.employeeId  
pegawai.id ← absensi.employeeId  
pegawai.id ← penggajian.employeeId  
pegawai.id ← permintaan_cuti.employeeId  
pegawai.id ← penilaian_kinerja.employeeId  
pegawai.id ← kontrak.employeeId  
pegawai.id ← pelatihan.pegawai_id  
pegawai.id ← riwayat_jabatan.pegawai_id  
pegawai.id ← tugas_orientasi.employee_id  
pegawai.id ← notifikasi.employee_id  
pegawai.id ← cuti.id_pegawai  
pegawai.id ← pinjaman_karyawan.id_pegawai  
pegawai.nip ← users.employeeId  
pegawai.nip ← notifications.employee_id

> NOTE: Buat migration/seed script untuk bikin tabel dan contoh data. Simpan SQL di `apps/backend/db/migrations` atau gunakan simple script JS untuk init DB.

---

## 6. Data flow (text diagram)

### Clock-in flow (example)

```
[Frontend Clock-in Button]
    ↓ POST /api/attendance/clock-in { employeeId }
[Express Controller: attendanceController.clockIn]
    ↓ calls attendanceService.recordClockIn(employeeId)
[attendanceService] -> validates, calculates lateness
    ↓ attendanceRepository.insert(...)
[SQLite DB] -> new attendance row
    ↑ return success
[attendanceService] -> returns { success:true, data: attendanceRow }
[Express] -> response 200 -> Frontend displays successful clock-in
```

### Payroll run flow

```
[Frontend admin clicks Run Payroll]
    ↓ POST /api/payrolls/run { periode: '2025-10' }
[payroll.controller.runPayroll] 
    ↓ payroll.service.fetchAllEmployees()
    ↓ for each employee: compute gaji using attendance, leave, tunjangan rules
    ↓ payroll.repository.insert(payrollRecord)
[DB] store payroll records
[Controller] -> respond with summary & downloadable slips
```

---

## 7. Auth, security & best practices

### 7.1 Authentication

* Login returns **Access Token (short)** & **Refresh Token (long)**.
* Access token used in `Authorization: Bearer <token>` header.
* Refresh token stored in HTTP-only cookie (if web) or handled securely.

### 7.2 Security middleware (recommended)

* `helmet()` — HTTP headers hardening
* `express-rate-limit` — block abuse
* `express-validator` / `zod` — validate input body
* `xss-clean` / sanitize inputs if accepting HTML
* Use parameterized sqlite queries (avoid string interpolation) or use prepared statements.

### 7.3 Passwords

* Hash with `bcrypt` (salt rounds >= 10)
* Never store raw password; use `.env` for secrets (JWT_SECRET).

### 7.4 CORS

* Restrict `CORS_ORIGIN` to frontend domain (e.g., `https://app.example.com`)

---

## 8. Local development & npm scripts

### Backend `apps/backend/package.json` (suggestion)

```json
{
  "name": "portal-sdm-backend",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "start": "node dist/server.js",
    "build": "tsc",
    "migrate": "node scripts/init_db.js",
    "seed": "node scripts/seed_db.js"
  }
}
```

### Frontend `apps/frontend/package.json` (suggestion)

```json
{
  "name": "hrms-frontend",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Developing locally

* Run backend: `cd apps/backend && npm run dev`
* Run frontend: `cd apps/frontend && npm run dev`
* Environment variables in `.env` (top-level or per app)

---

## 9. Testing & CI recommendations

* Unit tests: **Vitest** (frontend) + **Jest/Vitest** (backend)
* Integration tests: **supertest** (API)
* Mocking: **msw** (frontend)
* Lint & format: **ESLint**, **Prettier**
* CI pipeline (GitHub Actions):

  * Steps: checkout → install → lint → test → build
  * For main branch, create release artifacts (frontend build & backend dist)

---

## 10. Deployment guide (VPS + Nginx + PM2)



## 11. Docs & maintenance checklist

* Add `docs/ERD.png` (diagram) — keep in repo.
* Keep migration scripts up to date in `apps/backend/db/migrations/`.
* Add `CONTRIBUTING.md` describing feature development flow.
* Add `CHANGELOG.md` for releases.

---

## Appendix A — Example env variables

`.env` (backend)

```
PORT=3333
NODE_ENV=production
DB_SOURCE=./database.sqlite
JWT_SECRET=YOUR_SECRET
CORS_ORIGIN=https://app.yourdomain.com
```

`.env` (frontend)

```
VITE_API_BASE=https://api.yourdomain.com/api
```

---

## Appendix B — Quickstart (Developers)

1. Clone repo
2. `cd hrms/apps/backend && npm install && npm run migrate && npm run seed && npm run dev`
3. `cd hrms/apps/frontend && npm install && npm run dev`
4. Open `http://localhost:5173`

---

## Appendix C — Checklist sebelum produksi

* [ ] Pastikan `JWT_SECRET` set dan kuat
* [ ] Hapus sample accounts & seed data
* [ ] Ganti `CORS_ORIGIN` dengan domain produksi
* [ ] Set file permissions untuk `database.sqlite`
* [ ] Setup PM2 auto-start & logrotate
* [ ] Setup HTTPS + HTTP → HTTPS redirect

---

## Penutup

Dokumen ini adalah blueprint production-ready untuk HRMS yang modular, dapat di-scale, dan sesuai praktik engineering modern. Jika kamu ingin, aku bisa:

* Meng-generate `apps/backend` starter files (controller/service/repository) lengkap dengan migration & seed script untuk `sqlite3`.
* Atau generate `apps/frontend` starter (React + TypeScript + Vite + Tailwind) yang terhubung ke API local.
