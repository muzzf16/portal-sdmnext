# Alur Kerja Fitur KPI — Dokumen Acuan Lengkap

> **Portal SDM — Modul Kinerja & KPI**
> Versi: 1.0 | Tanggal: 14 Februari 2026

---

## Daftar Isi

1. [Gambaran Umum](#1-gambaran-umum)
2. [Arsitektur & Hierarki Modul](#2-arsitektur--hierarki-modul)
3. [Peran Pengguna (Roles)](#3-peran-pengguna-roles)
4. [Modul 1: Perpustakaan Aktivitas (Activity Library)](#4-modul-1-perpustakaan-aktivitas)
5. [Modul 2: Analisis Beban Kerja (ABK / Workload)](#5-modul-2-analisis-beban-kerja-abk)
6. [Modul 3: Manajemen KPI Target](#6-modul-3-manajemen-kpi-target)
7. [Modul 4: Penilaian Kinerja (Performance Appraisal)](#7-modul-4-penilaian-kinerja)
8. [Alur End-to-End (Step by Step)](#8-alur-end-to-end)
9. [Formula & Perhitungan](#9-formula--perhitungan)
10. [API Reference](#10-api-reference)
11. [Database Schema](#11-database-schema)
12. [Struktur File](#12-struktur-file)

---

## 1. Gambaran Umum

Fitur KPI pada Portal SDM mengintegrasikan tiga komponen utama menjadi satu alur yang saling terhubung:

```
Perpustakaan Aktivitas → Analisis Beban Kerja (ABK) → KPI Target → Penilaian Kinerja
       (Master Data)         (Workload + FTE)        (Target SMART)    (Scoring Otomatis)
```

**Tujuan:**
- Memberikan dasar **objektif dan terukur** untuk penilaian kinerja pegawai
- Menghitung beban kerja (FTE) secara otomatis berdasarkan durasi standar
- Menetapkan target KPI yang SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
- Melakukan scoring otomatis berdasarkan perbandingan realisasi vs target

---

## 2. Arsitektur & Hierarki Modul

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN / HRD                              │
│                                                             │
│  ┌─────────────────────┐                                    │
│  │ 📚 Perpustakaan     │  Master data durasi standar        │
│  │    Aktivitas        │  per jabatan (CS, Teller, dll.)    │
│  └────────┬────────────┘                                    │
│           │ menyediakan data standar                        │
│           ▼                                                 │
│  ┌─────────────────────┐                                    │
│  │ 📊 Analisis Beban   │  Pegawai isi aktivitas + frekuensi │
│  │    Kerja (ABK)      │  → hitung FTE% dan status         │
│  └────────┬────────────┘                                    │
│           │ generate KPI dari ABK                           │
│           ▼                                                 │
│  ┌─────────────────────┐                                    │
│  │ 🎯 Manajemen KPI    │  Setting target per pegawai       │
│  │    Target           │  → input realisasi → auto-score   │
│  └────────┬────────────┘                                    │
│           │ skor KPI menjadi basis penilaian                │
│           ▼                                                 │
│  ┌─────────────────────┐                                    │
│  │ ⭐ Penilaian        │  Review kinerja keseluruhan       │
│  │    Kinerja          │  → coaching & rekomendasi         │
│  └─────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
```

**Prinsip utama:**
- Setiap modul **berdiri sendiri** namun terintegrasi melalui data yang mengalir ke bawah
- Data dari modul atas menjadi **input** untuk modul di bawahnya
- Scoring dilakukan **otomatis** oleh sistem berdasarkan formula

---

## 3. Peran Pengguna (Roles)

| Peran | Akses | Aktivitas Utama |
|-------|-------|-----------------|
| **Admin/HRD** | Semua modul | Kelola perpustakaan aktivitas, set KPI target, input realisasi, buat penilaian kinerja |
| **Atasan/Supervisor** | KPI Target, Penilaian Kinerja | Set KPI target anak buah, input realisasi, buat penilaian |
| **Pegawai** | ABK (isi sendiri), KPI (lihat), Kinerja (lihat) | Isi form analisis beban kerja, lihat target & skor KPI sendiri |

---

## 4. Modul 1: Perpustakaan Aktivitas

### 4.1 Deskripsi
Master data yang menyimpan **daftar aktivitas standar beserta durasi normatif** untuk setiap jabatan. Data ini menjadi sumber kebenaran tunggal (single source of truth) agar durasi aktivitas tidak diinput secara subjektif.

### 4.2 Akses
- **Path:** `/dashboard/kinerja/perpustakaan-aktivitas`
- **Role:** Admin only
- **Sidebar:** manejemen kinerja- tab Perpustakaan Aktivitas

### 4.3 Fitur
- ✅ **CRUD Aktivitas** — Tambah, edit, hapus aktivitas standar
- ✅ **Filter by Jabatan** — Dropdown filter untuk melihat aktivitas per jabatan
- ✅ **Seed Data** — Data default sudah tersedia untuk 9 jabatan saat migration

### 4.4 Data Fields

| Field | Tipe | Keterangan | Contoh |
|-------|------|------------|--------|
| `position` | Text | Jabatan | CS, Teller, Collection |
| `department` | Text | Departemen | Operasional, Bisnis |
| `activityName` | Text | Nama aktivitas | Pembukaan rekening |
| `durationMinutes` | Integer | Durasi standar (menit) | 10 |
| `outputUnit` | Text | Satuan output | Nasabah, Dokumen |
| `category` | Text | Kategori | operasional, administrasi, lapangan |

### 4.5 Seed Data Default

| Jabatan | Contoh Aktivitas | Durasi |
|---------|-----------------|--------|
| **CS** | Pembukaan rekening, Konsultasi nasabah, Handling komplain | 10, 20, 15 menit |
| **Teller** | Setoran/tarikan tunai, Cash opname, Transfer antar bank | 5, 15, 3 menit |
| **Collection** | Penagihan lapangan, Perjalanan ke nasabah, Input laporan | 30, 45, 10 menit |
| **HRD** | Screening CV, Proses payroll, Interview kandidat | 150, 150, 60 menit |
| **IT** | Troubleshooting sistem, Maintenance rutin, Kunjungan cabang | 120, 15, 300 menit |
| **Analis Kredit** | Analisa kredit, Survei lapangan, Verifikasi jaminan | 80, 120, 30 menit |
| **Accounting** | Jurnal harian, Closing bulanan, Rekonsiliasi | 10, 7200, 30 menit |
| **Treasury** | Proses invoice, Rekonsiliasi bank, Pembayaran vendor | 5, 60, 10 menit |
| **Admin Lelang** | Input berkas lelang, Koordinasi BPN, Scan arsip | 120, 60, 30 menit |
| **Funding** | Kunjungan nasabah potensial, Presentasi produk | 60, 30 menit |

### 4.6 Alur Kerja

```
Admin buka halaman Perpustakaan Aktivitas
    │
    ├── [Filter] Pilih jabatan dari dropdown → tampilkan aktivitas jabatan tsb
    │
    ├── [Tambah] Klik "Tambah Aktivitas" → isi form → Simpan
    │       Form: Jabatan, Departemen, Nama Aktivitas, Durasi (menit), Satuan, Kategori
    │
    ├── [Edit] Klik "Edit" pada baris → form terisi data existing → Update
    │
    └── [Hapus] Klik "Hapus" → konfirmasi → data dihapus
```

---

## 5. Modul 2: Analisis Beban Kerja (ABK)

### 5.1 Deskripsi
Formulir untuk mencatat **seluruh aktivitas kerja pegawai beserta frekuensinya** sepanjang tahun. Sistem menghitung total menit kerja dan **FTE (Full Time Equivalent)** secara otomatis.

### 5.2 Akses
- **Path:** `/dashboard/kinerja/analisis-beban-kerja`
- **Role:** Admin & Employee
- **Sidebar:** manajemen kinerja- tab analisis beban kerja

### 5.3 Fitur
- ✅ **Input Aktivitas** — Tambah baris aktivitas + durasi + frekuensi
- ✅ **Integrasi Activity Library** — Dropdown "📚 Pilih dari Library" muncul saat posisi diisi; auto-fill nama & durasi standar
- ✅ **Hitung Otomatis** — Total menit, jam/tahun, jam/hari dihitung real-time
- ✅ **FTE Dashboard** — Card visual menampilkan FTE%, status beban kerja, dan progress bar
- ✅ **Auto-refresh** — Setelah simpan, FTE dashboard otomatis update

### 5.4 Alur Kerja Detail

```
Pegawai / Admin buka halaman Analisis Beban Kerja
    │
    ├── [1] Pilih tahun (2024 / 2025 / 2026)
    │
    ├── [2] Isi informasi umum:
    │       - Posisi (jabatan) → trigger fetch Activity Library
    │       - Departemen
    │
    ├── [3] Isi daftar kegiatan (dua cara):
    │       ├── Cara A: Klik "+ Tambah Baris" → isi manual
    │       └── Cara B: Pilih dari dropdown "📚 Pilih dari Library (CS)"
    │               → nama & durasi standar auto-terisi
    │               → user hanya perlu isi frekuensi
    │
    ├── [4] Isi frekuensi per aktivitas:
    │       - Harian (×264 hari kerja/tahun)
    │       - Mingguan (×52 minggu/tahun)
    │       - Bulanan (×12 bulan/tahun)
    │       - Triwulan (×4/tahun)
    │       - Semester (×2/tahun)
    │       - Tahunan (×1/tahun)
    │
    ├── [5] Sistem hitung otomatis:
    │       Total Menit = durasi × (freqH×264 + freqM×52 + freqB×12 + freqT×4 + freqS×2 + freqTh×1)
    │
    ├── [6] Klik "Simpan Laporan"
    │
    └── [7] FTE Dashboard Card otomatis tampil:
            ┌───────────────────────────────────────┐
            │ 🟢 Status Beban Kerja: Normal         │
            │ FTE: 92.3%  |  Jam/Hari: 7.38  |  1842 Jam/Tahun │
            │ ████████████████████░░░░  (progress bar)         │
            └───────────────────────────────────────┘
```

### 5.5 FTE (Full Time Equivalent)

| Nilai FTE | Status | Warna | Arti |
|-----------|--------|-------|------|
| > 100% | **Overload** | 🔴 Merah | Beban kerja melebihi kapasitas, perlu tambah SDM atau redistribusi |
| 80–100% | **Normal** | 🟢 Hijau | Beban kerja sesuai kapasitas |
| < 80% | **Underload** | 🟡 Kuning | Beban kerja di bawah kapasitas, bisa diberi tugas tambahan |

---

## 6. Modul 3: Manajemen KPI Target

### 6.1 Deskripsi
Modul untuk **menetapkan target KPI per pegawai per periode** dan **memonitor pencapaian (realisasi)** dengan scoring otomatis.

### 6.2 Akses
- **Path:** `/dashboard/kinerja/kpi-target`
- **Role:** Admin only
- **Sidebar:** manajemen kinerja- tab kpi target

### 6.3 Fitur
- ✅ **CRUD KPI Target** — Buat, edit, hapus target KPI per pegawai
- ✅ **Generate dari ABK** — Otomatis buat KPI targets dari data Analisis Beban Kerja
- ✅ **Input Realisasi** — Klik nilai realisasi di tabel → input angka → skor otomatis dihitung
- ✅ **Auto-Scoring** — Skor 1–5 dihitung otomatis berdasarkan realisasi vs target
- ✅ **Summary Card** — Menampilkan total KPI, total bobot, skor rata-rata tertimbang
- ✅ **Filter** — Filter by pegawai dan periode

### 6.4 Alur Kerja Detail

#### A. Membuat KPI Target Manual

```
Admin buka halaman Manajemen KPI
    │
    ├── [1] Klik "+ Tambah KPI Target"
    │
    ├── [2] Isi form:
    │       - Pegawai: [dropdown pilih pegawai]
    │       - Periode: 2026-S1 (Semester 1 2026)
    │       - Nama KPI: "Akurasi Closing Kredit"
    │       - Target: 95
    │       - Satuan: %
    │       - Bobot: 30%
    │       - Catatan: (opsional)
    │
    ├── [3] Klik "Simpan"
    │
    └── [4] KPI muncul di tabel dengan status "active", skor = 0 (belum ada realisasi)
```

#### B. Generate KPI dari ABK (Otomatis)

```
Admin buka halaman Manajemen KPI
    │
    ├── [1] Pilih pegawai dari dropdown filter
    │
    ├── [2] Klik tombol "⚡ Generate dari ABK"
    │
    ├── [3] Masukkan periode (misal: "2026-S1")
    │
    ├── [4] Sistem otomatis:
    │       a. Ambil data ABK pegawai tahun berjalan
    │       b. Urutkan aktivitas by total menit (terbesar dulu)
    │       c. Ambil 5 aktivitas teratas
    │       d. Buat KPI target dari masing-masing aktivitas:
    │           - Nama: "Penyelesaian [Nama Aktivitas]"
    │           - Target: frekuensi tahunan dari ABK
    │           - Satuan: jumlah
    │           - Bobot: didistribusi merata (masing-masing 20%)
    │           - Source: "abk" (ditandai dengan ikon 📊)
    │
    └── [5] KPI targets muncul di tabel (5 item) dengan status "active"
```

#### C. Input Realisasi & Auto-Scoring

```
Admin buka halaman Manajemen KPI
    │
    ├── [1] Filter pegawai dan periode
    │
    ├── [2] Di tabel, klik angka realisasi (biru, underlined) pada KPI yang ingin diupdate
    │
    ├── [3] Muncul prompt: "Masukkan realisasi untuk 'Akurasi Closing' (target: 95%)"
    │
    ├── [4] Input: 88
    │
    ├── [5] Sistem auto-scoring:
    │       Rasio = 88 / 95 = 92.6% → Skor = 4 (Baik)
    │
    └── [6] Tabel terupdate:
            │ KPI              │ Target │ Realisasi │ Skor │ Label        │
            │ Akurasi Closing  │ 95%    │ 88%       │  4   │ Baik 🟢     │
```

### 6.5 Tabel Scoring

**Untuk satuan standar (%, jumlah, menit) — higher is better:**

| Rasio (Realisasi / Target) | Skor | Label | Warna |
|---|---|---|---|
| ≥ 100% | **5** | Sangat Baik | 🟢 Hijau |
| 80–99% | **4** | Baik | 🟢 Hijau muda |
| 60–79% | **3** | Cukup | 🟡 Kuning |
| 40–59% | **2** | Kurang | 🟠 Oranye |
| < 40% | **1** | Sangat Kurang | 🔴 Merah |

**Untuk satuan "hari" — lower is better (misal target closing H+3):**

| Kondisi | Skor | Penjelasan |
|---|---|---|
| Realisasi ≤ Target | **5** | Selesai tepat waktu atau lebih cepat |
| Rasio Target/Realisasi ≥ 80% | **4** | Sedikit terlambat |
| Rasio ≥ 60% | **3** | Cukup terlambat |
| Rasio ≥ 40% | **2** | Terlambat signifikan |
| Rasio < 40% | **1** | Sangat terlambat |

### 6.6 Summary Card

Saat ada KPI data, ditampilkan ringkasan:

```
┌─────────────────────────────────────────────────────┐
│  Total KPI: 5    │  Total Bobot: 100%  │  Skor: 3.80/5 — Baik │
└─────────────────────────────────────────────────────┘
```

**Rumus skor rata-rata tertimbang:**
```
Skor Akhir = Σ(skor_i × bobot_i) / Σ(bobot_i)
```

---

## 7. Modul 4: Penilaian Kinerja

### 7.1 Deskripsi
Modul untuk melakukan **review kinerja keseluruhan** pegawai berdasarkan KPI, feedback atasan, kekuatan, area perbaikan, dan rekomendasi coaching.

### 7.2 Akses
- **Path:** `/dashboard/kinerja` (admin), `/dashboard/kinerja-saya` (pegawai)
- **Role:** Admin (buat/edit), Employee (lihat)

### 7.3 Integrasi dengan KPI
- KPI targets dan skor bisa menjadi basis data di form penilaian kinerja
- Skor overall bisa dihitung dari data KPI yang sudah tercapai
- Rekomendasi coaching otomatis dapat disarankan untuk KPI dengan skor rendah

---

## 8. Alur End-to-End (Step by Step)

Berikut adalah **alur kerja lengkap** dari awal hingga akhir, sebagai panduan bagi Admin/HRD:

### Langkah 1: Setup Awal (Sekali Saja)
```
Admin HRD → Buka "Perpustakaan Aktivitas"
    → Verifikasi seed data sudah sesuai
    → Tambah/edit aktivitas sesuai kondisi perusahaan
    → Pastikan setiap jabatan punya daftar aktivitas lengkap
```

### Langkah 2: Pegawai Isi ABK (Per Tahun)
```
Pegawai → Buka "Analisis Beban Kerja"
    → Pilih tahun
    → Isi posisi → muncul dropdown Library
    → Pilih aktivitas dari Library + isi frekuensi
    → Simpan
    → Lihat FTE% dan status beban kerja
```

### Langkah 3: Admin Set KPI Target (Per Semester/Tahun)
```
Admin → Buka "Manajemen KPI"
    → Pilih pegawai
    → Klik "⚡ Generate dari ABK" → KPI otomatis terisi
       ATAU
    → Klik "+ Tambah KPI Target" → isi manual
    → Pastikan total bobot = 100%
```

### Langkah 4: Monitoring & Input Realisasi (Berkala)
```
Admin/Atasan → Buka "Manajemen KPI"
    → Filter pegawai & periode
    → Klik angka realisasi pada setiap KPI
    → Input nilai pencapaian
    → Skor otomatis terupdate (1-5)
    → Lihat summary card: skor rata-rata tertimbang
```

### Langkah 5: Penilaian Kinerja (Akhir Periode)
```
Admin/Atasan → Buka "Manajemen Kinerja"
    → Buat penilaian baru untuk pegawai
    → KPI dan skor sebagai referensi/basis penilaian
    → Isi kekuatan, area perbaikan, feedback
    → Isi rekomendasi coaching (jika ada KPI dengan skor rendah)
    → Submit penilaian
```

### Langkah 6: Pegawai Review (Akhir Periode)
```
Pegawai → Buka "Kinerja Saya"
    → Lihat hasil penilaian kinerja
    → Lihat detail KPI: target vs realisasi vs skor
    → Baca rekomendasi coaching (jika ada)
```

---

## 9. Formula & Perhitungan

### 9.1 Total Menit Tahunan (ABK)
```
Total Menit = Durasi × (
    Freq_Harian × 264 +
    Freq_Mingguan × 52 +
    Freq_Bulanan × 12 +
    Freq_Triwulan × 4 +
    Freq_Semester × 2 +
    Freq_Tahunan × 1
)
```

### 9.2 FTE (Full Time Equivalent)
```
Kapasitas_Tahun = 264 hari × 8 jam × 60 menit = 126.720 menit
FTE% = (Total_Menit / 126.720) × 100

Status:
  > 100%  → Overload  (🔴)
  80-100% → Normal    (🟢)
  < 80%   → Underload (🟡)
```

### 9.3 Jam Kerja per Hari
```
Jam/Hari = Total_Menit / 264 hari / 60 menit
```

### 9.4 Skor KPI (Auto-Scoring)
```
Standard (higher is better):
  Rasio = Realisasi / Target
  if Rasio ≥ 1.0  → Score = 5
  if Rasio ≥ 0.8  → Score = 4
  if Rasio ≥ 0.6  → Score = 3
  if Rasio ≥ 0.4  → Score = 2
  else             → Score = 1

Inverse ("hari", lower is better):
  if Realisasi ≤ Target → Score = 5
  Rasio = Target / Realisasi
  if Rasio ≥ 0.8  → Score = 4
  if Rasio ≥ 0.6  → Score = 3
  if Rasio ≥ 0.4  → Score = 2
  else             → Score = 1
```

### 9.5 Skor Rata-rata Tertimbang
```
Skor_Akhir = Σ(skor_i × bobot_i) / Σ(bobot_i)
```

### 9.6 Penentuan Target & Realisasi

**1. Analisis Beban Kerja (ABK)**
*   **Target (Standar):** Berasal dari **Perpustakaan Aktivitas** (Master Data) yang dikelola Admin. Setiap aktivitas memiliki **Durasi Standar** (misal: "Mengerjakan Laporan" = 60 menit). Pegawai tidak mengisi durasi ini secara manual jika memilih dari library untuk menjaga objektivitas.
*   **Realisasi (Input Pegawai):** Pegawai hanya mengisi **Frekuensi** (seberapa sering aktivitas dilakukan dalam setahun: Harian, Mingguan, Bulanan, dst).
*   **Hasil Perhitungan:** Sistem otomatis mengkalikan `Durasi Standar x Frekuensi` untuk mendapatkan **Total Jam Kerja per Tahun** dan menghitung **FTE (Full Time Equivalent)**.

**2. KPI & Penilaian Kinerja**
*   **Target:**
    *   **Manual:** Admin/Atasan menetapkan angka target di awal periode (misal: Target Omzet 1 Milyar, Target Closing 100 Nasabah).
    *   **Otomatis dari ABK:** Sistem bisa mengambil data frekuensi dari ABK sebagai target (misal: Jika di ABK pegawai menyanggupi 100 laporan/tahun, maka sistem set KPI Target = 100 laporan).
*   **Realisasi:** Diinput oleh Admin/Atasan di akhir periode penilaian berdasarkan data aktual di lapangan (misal: Realisasi Omzet 900 Juta, Realisasi Closing 110 Nasabah).
*   **Nilai (Scoring Otomatis):** Sistem otomatis menghitung skor (1-5) berdasarkan perbandingan Realisasi vs Target.
    *   **Target Angka (Higher is Better):** `Realisasi / Target` (Contoh: 110/100 = 110% -> Skor 5/Sangat Baik).
    *   **Target Waktu (Lower is Better):** `Target / Realisasi` (Contoh: Target H+3, Realisasi H+5 -> Terlambat -> Skor Turun).

---

## 10. API Reference

### Perpustakaan Aktivitas (`/api/activity-library`)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/activity-library` | List semua (query: `position`, `department`, `category`) |
| `GET` | `/api/activity-library/positions` | List jabatan unik |
| `GET` | `/api/activity-library/position/:position` | Filter by jabatan |
| `GET` | `/api/activity-library/:id` | Detail satu aktivitas |
| `POST` | `/api/activity-library` | Tambah aktivitas baru |
| `PUT` | `/api/activity-library/:id` | Update aktivitas |
| `DELETE` | `/api/activity-library/:id` | Hapus aktivitas |

### KPI Target (`/api/kpi-targets`)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/kpi-targets` | List semua (query: `employeeId`, `period`, `status`) |
| `GET` | `/api/kpi-targets/employee/:employeeId` | KPI per pegawai |
| `GET` | `/api/kpi-targets/:id` | Detail satu KPI |
| `POST` | `/api/kpi-targets` | Buat KPI target baru |
| `POST` | `/api/kpi-targets/generate-from-abk` | Generate KPI dari ABK |
| `PUT` | `/api/kpi-targets/:id` | Update KPI target |
| `PUT` | `/api/kpi-targets/:id/actual` | Update realisasi + auto-score |
| `DELETE` | `/api/kpi-targets/:id` | Hapus KPI target |

### Workload / ABK (`/api/workload`)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/workload/:employeeId?year=YYYY` | Data ABK + FTE% + status |
| `POST` | `/api/workload` | Simpan/update ABK |

**Response field tambahan pada GET workload:**
```json
{
  "ftePercentage": 92.3,
  "fteStatus": "Normal",
  "hoursPerDay": 7.38
}
```

### Contoh Request/Response

**POST `/api/kpi-targets`**
```json
// Request
{
  "employeeId": "emp-001",
  "period": "2026-S1",
  "kpiName": "Akurasi Closing Kredit",
  "targetValue": 95,
  "targetUnit": "%",
  "weight": 30
}

// Response
{
  "success": true,
  "data": {
    "id": "kpi-1707912345-abc123",
    "employeeId": "emp-001",
    "period": "2026-S1",
    "kpiName": "Akurasi Closing Kredit",
    "targetValue": 95,
    "targetUnit": "%",
    "weight": 30,
    "actualValue": 0,
    "score": 0,
    "status": "active",
    "source": "manual"
  }
}
```

**PUT `/api/kpi-targets/:id/actual`**
```json
// Request
{ "actualValue": 88 }

// Response — skor otomatis dihitung
{
  "success": true,
  "data": {
    "id": "kpi-1707912345-abc123",
    "actualValue": 88,
    "score": 4,
    "...": "..."
  }
}
```

**POST `/api/kpi-targets/generate-from-abk`**
```json
// Request
{
  "employeeId": "emp-001",
  "year": 2026,
  "period": "2026-S1"
}

// Response — 5 KPI otomatis dari ABK
{
  "success": true,
  "data": [
    {
      "kpiName": "Penyelesaian Pembukaan rekening",
      "targetValue": 264,
      "targetUnit": "jumlah",
      "weight": 20,
      "source": "abk"
    },
    "... (4 KPI lainnya)"
  ]
}
```

---

## 11. Database Schema

### Tabel `activity_library`

```sql
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
```

### Tabel `kpi_targets`

```sql
CREATE TABLE kpi_targets (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    period TEXT NOT NULL,
    kpiName TEXT NOT NULL,
    targetValue REAL NOT NULL DEFAULT 0,
    targetUnit TEXT,
    weight INTEGER NOT NULL DEFAULT 0,
    actualValue REAL DEFAULT 0,
    score REAL DEFAULT 0,
    status TEXT CHECK(status IN ('active','completed','cancelled')) DEFAULT 'active',
    source TEXT CHECK(source IN ('abk','manual')) DEFAULT 'manual',
    abkActivityId TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES pegawai(id) ON DELETE CASCADE
);
```

### Relasi

```
pegawai.id ← kpi_targets.employeeId
activity_library.id ← kpi_targets.abkActivityId (opsional)
analisis_beban_kerja → (generate) → kpi_targets
```

---

## 12. Struktur File

### Backend

```
apps/backend/src/
├── modules/
│   ├── activity-library/
│   │   ├── activity-library.repository.ts   # CRUD database
│   │   ├── activity-library.service.ts      # Business logic + validation
│   │   ├── activity-library.controller.ts   # REST handlers
│   │   └── activity-library.routes.ts       # Route definitions
│   ├── kpi/
│   │   ├── kpi.repository.ts               # CRUD database
│   │   ├── kpi.service.ts                  # Auto-scoring + generate dari ABK
│   │   ├── kpi.controller.ts               # REST handlers
│   │   └── kpi.routes.ts                   # Route definitions
│   └── workload/
│       ├── workload.repository.ts          # (existing)
│       ├── workload.service.ts             # + calculateFTE()
│       ├── workload.controller.ts          # + FTE in response
│       └── workload.routes.ts              # (existing)
├── routes/
│   └── index.ts                            # + /activity-library, /kpi-targets
└── db/migrations/
    └── 20260214_kpi_feature.sql            # Schema + seed data
```

### Frontend

```
apps/frontend/src/features/06-kinerja/
├── api/
│   ├── activityLibraryApi.ts               # API calls Activity Library
│   ├── kpiApi.ts                           # API calls KPI Management
│   ├── workloadApi.ts                      # (existing)
│   └── kinerjaApi.ts                       # (existing)
├── types/
│   └── index.ts                            # + ActivityLibraryItem, KpiTarget
├── pages/
│   ├── ActivityLibraryPage.tsx             # CRUD perpustakaan aktivitas
│   ├── KpiTargetPage.tsx                   # Manajemen KPI + scoring
│   ├── WorkLoadPage.tsx                    # + FTE dashboard card
│   └── HalamanKinerja.tsx                  # (existing)
├── components/
│   ├── WorkLoadForm.tsx                    # + dropdown Activity Library
│   ├── FormKinerja.tsx                     # (existing)
│   └── DaftarKinerja.tsx                   # (existing)
└── hooks/
    └── ...                                 # (existing hooks)
```

### Routing

| Path | Halaman | Role |
|------|---------|------|
| `/dashboard/kinerja` | Manajemen Kinerja | Admin |
| `/dashboard/kinerja/analisis-beban-kerja` | ABK + FTE | Admin, Employee |
| `/dashboard/kinerja/perpustakaan-aktivitas` | Perpustakaan Aktivitas | Admin |
| `/dashboard/kinerja/kpi-target` | Manajemen KPI | Admin |
| `/dashboard/kinerja/:id` | Detail Penilaian Kinerja | Admin, Employee |
| `/dashboard/kinerja-saya` | Kinerja Saya | Employee |
