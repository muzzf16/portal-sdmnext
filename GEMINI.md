
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

-- ==============================================
-- HRMS Database Schema (SQLite)
-- ==============================================
PRAGMA foreign_keys = ON;

-- 🧑‍💼 PEGAWAI
CREATE TABLE IF NOT EXISTS pegawai (
    id_pegawai INTEGER PRIMARY KEY AUTOINCREMENT,
    nip TEXT UNIQUE NOT NULL,
    nama_lengkap TEXT NOT NULL,
    tempat_lahir TEXT,
    tanggal_lahir DATE,
    jenis_kelamin TEXT CHECK(jenis_kelamin IN ('L', 'P')),
    alamat TEXT,
    email TEXT,
    no_hp TEXT,
    agama TEXT,
    status_perkawinan TEXT,
    jumlah_anak INTEGER DEFAULT 0,
    pendidikan_terakhir TEXT,
    jabatan TEXT,
    departemen TEXT,
    status_kerja TEXT CHECK(status_kerja IN ('aktif','nonaktif')) DEFAULT 'aktif',
    tanggal_masuk DATE,
    tanggal_keluar DATE,
    foto TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 🕒 ABSENSI
CREATE TABLE IF NOT EXISTS absensi (
    id_absensi INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pegawai INTEGER NOT NULL,
    tanggal DATE NOT NULL,
    jam_masuk TIME,
    jam_keluar TIME,
    status_kehadiran TEXT CHECK(status_kehadiran IN ('hadir','izin','sakit','cuti','alpa')) DEFAULT 'hadir',
    keterlambatan INTEGER DEFAULT 0,
    lembur REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pegawai) REFERENCES pegawai(id_pegawai) ON DELETE CASCADE
);

-- 💰 PENGGAJIAN
CREATE TABLE IF NOT EXISTS penggajian (
    id_gaji INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pegawai INTEGER NOT NULL,
    periode TEXT NOT NULL, -- Format: YYYY-MM
    gaji_pokok REAL DEFAULT 0,
    tunjangan_transport REAL DEFAULT 0,
    tunjangan_makan REAL DEFAULT 0,
    tunjangan_jabatan REAL DEFAULT 0,
    lembur REAL DEFAULT 0,
    potongan_bpjs REAL DEFAULT 0,
    potongan_pajak REAL DEFAULT 0,
    potongan_pinjam REAL DEFAULT 0,
    total_gaji_bersih REAL DEFAULT 0,
    tanggal_pembayaran DATE,
    metode_pembayaran TEXT CHECK(metode_pembayaran IN ('transfer','tunai')) DEFAULT 'transfer',
    status TEXT CHECK(status IN ('dibayar','belum')) DEFAULT 'belum',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pegawai) REFERENCES pegawai(id_pegawai) ON DELETE CASCADE
);

-- 📄 CUTI
CREATE TABLE IF NOT EXISTS cuti (
    id_cuti INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pegawai INTEGER NOT NULL,
    jenis_cuti TEXT CHECK(jenis_cuti IN ('tahunan','sakit','pribadi','melahirkan')) DEFAULT 'tahunan',
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    alasan TEXT,
    status_pengajuan TEXT CHECK(status_pengajuan IN ('menunggu','disetujui','ditolak')) DEFAULT 'menunggu',
    id_atasan_penyetuju INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pegawai) REFERENCES pegawai(id_pegawai) ON DELETE CASCADE
);

-- ⚙️ PENILAIAN KINERJA
CREATE TABLE IF NOT EXISTS penilaian_kinerja (
    id_penilaian INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pegawai INTEGER NOT NULL,
    periode TEXT NOT NULL, -- Format: YYYY-MM
    aspek TEXT, -- JSON: {"disiplin":80,"tanggung_jawab":85,"teamwork":90,"produktifitas":88}
    skor_total REAL,
    komentar_supervisor TEXT,
    rekomendasi TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pegawai) REFERENCES pegawai(id_pegawai) ON DELETE CASCADE
);

-- 📑 PELATIHAN
CREATE TABLE IF NOT EXISTS pelatihan (
    id_pelatihan INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pegawai INTEGER NOT NULL,
    nama_pelatihan TEXT NOT NULL,
    penyelenggara TEXT,
    tanggal_mulai DATE,
    tanggal_selesai DATE,
    sertifikat TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pegawai) REFERENCES pegawai(id_pegawai) ON DELETE CASCADE
);

-- 💳 PINJAMAN KARYAWAN
CREATE TABLE IF NOT EXISTS pinjaman_karyawan (
    id_pinjaman INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pegawai INTEGER NOT NULL,
    tanggal_pinjaman DATE NOT NULL,
    jumlah REAL NOT NULL,
    tenor INTEGER NOT NULL, -- dalam bulan
    cicilan_perbulan REAL,
    sisa_pinjaman REAL,
    status_pinjaman TEXT CHECK(status_pinjaman IN ('aktif','lunas','menunggak')) DEFAULT 'aktif',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pegawai) REFERENCES pegawai(id_pegawai) ON DELETE CASCADE
);

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
