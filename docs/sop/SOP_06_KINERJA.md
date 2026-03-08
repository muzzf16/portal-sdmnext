# SOP Penilaian Kinerja — Portal SDM

> **Modul:** 06 - Manajemen Kinerja
> **Versi:** 2.0 | **Tanggal:** 7 Maret 2026

---

## 1. Tujuan

Menyediakan prosedur standar untuk menilai kinerja pegawai secara objektif, transparan, dan adil melalui sistem KPI, self-assessment, dan review atasan.

## 2. Ruang Lingkup

| Pihak | Peran |
|---|---|
| **Admin/HR** | Setup KPI target, mengelola periode penilaian, set deadline, monitoring, kalibrasi |
| **Atasan/Supervisor** | Menilai kinerja bawahan, mereview self-assessment, memberikan coaching |
| **Pegawai** | Mengisi WLA, self-assessment, melihat hasil penilaian |

## 3. Definisi

| Istilah | Penjelasan |
|---|---|
| **KPI** | Key Performance Indicator — indikator terukur pencapaian kerja |
| **WLA** | Workload Analysis — analisis beban kerja harian |
| **FTE** | Full-Time Equivalent — rasio beban kerja vs kapasitas |
| **ABK** | Analisis Beban Kerja — perhitungan kebutuhan SDM per jabatan |
| **Self-Assessment** | Penilaian mandiri oleh pegawai sebelum review atasan |
| **PIP** | Performance Improvement Plan — rencana perbaikan kinerja |

## 4. Status Lifecycle Penilaian

Setiap penilaian kinerja mengikuti alur status yang ketat:

```
┌──────────┐     Admin kirim       ┌───────────────┐     Pegawai isi SA    ┌──────────────┐
│  Draft   │ ──────────────────→  │  Awaiting SA  │ ───────────────────→ │ SA Submitted │
└──────────┘  + set deadline SA    └───────────────┘                      └──────────────┘
                                                                                │
                                                                      Atasan mulai review
                                                                                ↓
┌───────────┐    Admin finalisasi   ┌───────────┐    Atasan submit    ┌───────────┐
│ Finalized │ ←──────────────────── │ Completed │ ←────────────────── │ In Review │
└───────────┘                       └───────────┘                     └───────────┘
```

| Status | Deskripsi | Aksi yang Diizinkan |
|---|---|---|
| **Draft** | Penilaian baru dibuat | → Awaiting SA |
| **Awaiting SA** | Menunggu self-assessment pegawai | → SA Submitted, ← Draft |
| **SA Submitted** | Self-assessment terkirim | → In Review |
| **In Review** | Atasan sedang mereview | → Completed, ← SA Submitted |
| **Completed** | Review selesai | → Finalized, ← In Review |
| **Finalized** | Final — tidak bisa diubah | (terminal) |

## 5. Prosedur

### 5.1 Siklus Penilaian Kinerja

```
Fase 1: PERSIAPAN (Awal Periode)
  ├── Admin set Activity Library (norma waktu per aktivitas)
  ├── Admin generate KPI target dari ABK per jabatan
  ├── KPI target terdistribusi ke masing-masing pegawai
  └── Admin buat penilaian period baru (status: Draft)

Fase 2: PEMANTAUAN (Sepanjang Periode)
  ├── Pegawai mengisi Log Aktivitas Harian (WLA)
  ├── Sistem menghitung FTE secara otomatis
  ├── Realisasi KPI otomatis sync dari WLA (syncRealisasiFromWla)
  └── Atasan memonitor progres via dashboard

Fase 3: KIRIM KE PEGAWAI (Akhir Periode)
  ├── Admin set deadline self-assessment (via modal)
  ├── Admin klik "Kirim ke Pegawai" (status → Awaiting SA)
  └── 🔔 Sistem kirim notifikasi ke pegawai dengan info deadline

Fase 4: SELF-ASSESSMENT
  ├── Pegawai mengakses halaman "Kinerja Saya"
  ├── Pegawai mengisi self-scoring per KPI (skala 1-5, weighted by bobot KPI)
  ├── Pegawai mengisi kekuatan & area perbaikan
  ├── Pegawai klik "Simpan Draft" atau "Kirim Self-Assessment"
  ├── ⏰ Sistem validasi deadline — tolak jika sudah lewat
  ├── Status → SA Submitted
  └── 🔔 Sistem kirim notifikasi ke atasan

Fase 5: REVIEW ATASAN
  ├── Atasan klik "Mulai Review" (status → In Review)
  ├── Atasan melihat self-assessment pegawai
  ├── Atasan mengisi penilaian resmi (scoring + narasi)
  ├── Atasan klik "Selesai Review" (status → Completed)
  └── 🔔 Sistem kirim notifikasi ke pegawai dengan skor

Fase 6: FINALISASI
  ├── Admin review distribusi skor (kalibrasi)
  ├── Admin klik "Finalisasi" (status → Finalized)
  ├── 🔔 Sistem kirim notifikasi ke pegawai
  └── Data dikunci — tidak bisa diubah lagi

Fase 7: FEEDBACK & TINDAK LANJUT
  ├── Pegawai melihat perbandingan skor (Self vs Atasan, weighted)
  ├── Sesi coaching/counseling jika ada gap signifikan
  ├── Jika skor < 3 berturut → trigger Performance Improvement Plan
  └── Dokumentasi disimpan di sistem sebagai arsip
```

### 5.2 Skala Penilaian

| Skor | Label | Kriteria |
|---|---|---|
| **5** | Sangat Baik | Melebihi target >20%, konsisten |
| **4** | Baik | Mencapai atau sedikit melebihi target |
| **3** | Cukup | Mencapai ~80-100% target |
| **2** | Kurang | Hanya mencapai 60-80% target |
| **1** | Sangat Kurang | Di bawah 60% target |

### 5.3 Perhitungan Skor

- **Skor KPI (Atasan):** `overallScore = Σ(score × weight) / Σ(weight)`
- **Skor Self-Assessment:** `selfScore = Σ(selfScore × weight) / Σ(weight)` (weighted, bukan rata-rata)
- **Dual-Metric:**
  - Higher-is-better: skor tinggi jika realisasi > target
  - Lower-is-better: skor tinggi jika realisasi < target

## 6. Notifikasi Otomatis

| Event | Penerima | Pesan |
|---|---|---|
| Penilaian dikirim ke pegawai | Pegawai | 📋 "Penilaian kinerja periode X... isi self-assessment sebelum [deadline]" |
| Self-assessment dikirim | Atasan | ✅ "Self-assessment dari {nama} sudah dikirim. Silakan review." |
| Review atasan selesai | Pegawai | 🏆 "Penilaian kinerja Anda sudah direview. Skor: X." |
| Penilaian difinalisasi | Pegawai | 📌 "Penilaian kinerja sudah ditetapkan sebagai final." |

## 7. Ketentuan & Aturan

| Aturan | Detail |
|---|---|
| **Frekuensi** | Per semester (S1: Jan-Jun, S2: Jul-Des) atau per kuartal |
| **Deadline self-assessment** | Ditetapkan admin saat kirim penilaian ke pegawai |
| **Bobot KPI** | Total bobot harus = 100% per pegawai |
| **Minimum KPI** | Minimal 3 KPI per pegawai |
| **Perubahan target** | Hanya boleh diubah oleh admin, dengan alasan terdokumentasi |
| **Kerahasiaan** | Skor hanya bisa dilihat oleh pegawai, atasan, dan HR |
| **Finalisasi** | Setelah Finalized, data tidak bisa diubah |
| **Hapus penilaian** | Hanya penilaian berstatus Draft yang bisa dihapus |

## 8. Formulir Terkait (Halaman di Portal SDM)

| Halaman | Path | Pengguna |
|---|---|---|
| Manajemen Kinerja | `/dashboard/kinerja` | Admin, Supervisor |
| Kinerja Saya (+ Self-Assessment) | `/dashboard/kinerja-saya` | Pegawai |
| Activity Library | `/dashboard/kinerja` → Tab Library | Admin |
| KPI Target | `/dashboard/kinerja` → Tab KPI Target | Admin |
| Log Aktivitas WLA | `/dashboard/log-aktivitas` | Pegawai |
| Laporan WLA | `/dashboard/wla-summary` | Admin |

## 9. API Endpoints

| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/performance-reviews` | List penilaian |
| GET | `/api/performance-reviews/:id` | Detail penilaian |
| POST | `/api/performance-reviews` | Buat penilaian |
| PUT | `/api/performance-reviews/:id` | Update penilaian |
| PUT | `/api/performance-reviews/:id/transition` | **Transisi status** |
| PUT | `/api/performance-reviews/:id/self-assessment` | Submit self-assessment |
| PUT | `/api/performance-reviews/:id/feedback` | Feedback pegawai |
| GET | `/api/kpi-templates` | List template KPI (filter: `?department=`) |
| POST | `/api/kpi-templates/apply` | Apply template ke pegawai |

## 10. Riwayat Revisi

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 2026-03-07 | Versi awal — termasuk prosedur self-assessment |
| 2.0 | 2026-03-07 | Status lifecycle (6 state), notifikasi otomatis, deadline enforcement |
| 3.0 | 2026-03-08 | Kategorisasi KPI (process/outcome/strategic), Template KPI per departemen |

---

## Lampiran A: Template KPI per Departemen

> Template ini tersedia di tabel `kpi_templates` dan bisa langsung di-apply ke pegawai via API `POST /api/kpi-templates/apply`.

### A.1 Bagian Pemasaran (Marketing)

**Komposisi: Process 25% + Outcome 65% + Strategic 10% = 100%**

| # | Nama KPI | Kategori | Target | Satuan | Bobot | Sumber Pengukuran |
|---|---|---|---|---|---|---|
| 1 | Jumlah nasabah baru kredit | 🎯 Outcome | 15 | jumlah/bln | 20% | Data pencairan kredit |
| 2 | Jumlah nasabah baru tabungan/deposito | 🎯 Outcome | 20 | jumlah/bln | 15% | Data pembukaan rekening |
| 3 | Volume pencairan kredit (juta) | 🎯 Outcome | 500 | jumlah/bln | 20% | Laporan pencairan |
| 4 | Jumlah kunjungan prospek | 📊 Process | 40 | jumlah/bln | 15% | Log WLA (otomatis) |
| 5 | Pembuatan materi promosi | 📊 Process | 4 | jumlah/bln | 10% | Log WLA (otomatis) |
| 6 | Pertumbuhan DPK | 🏢 Strategic | 10 | %/semester | 10% | Laporan keuangan |
| 7 | Rasio konversi prospek → nasabah | 🎯 Outcome | 30 | % | 10% | Data pipeline |

### A.2 Bagian Penagihan Nasabah Kredit

**Komposisi: Process 40% + Outcome 40% + Strategic 20% = 100%**

| # | Nama KPI | Kategori | Target | Satuan | Bobot | Sumber Pengukuran |
|---|---|---|---|---|---|---|
| 1 | Jumlah kunjungan penagihan | 📊 Process | 60 | jumlah/bln | 15% | Log WLA (otomatis) |
| 2 | Jumlah surat peringatan diterbitkan | 📊 Process | 30 | jumlah/bln | 10% | Log WLA (otomatis) |
| 3 | Jumlah telepon penagihan | 📊 Process | 100 | jumlah/bln | 10% | Log WLA (otomatis) |
| 4 | Collection rate | 🎯 Outcome | 80 | % | 25% | Data pembayaran (manual) |
| 5 | Penurunan NPL | 🏢 Strategic | 5 | %/semester | 20% | Laporan NPL (manual) |
| 6 | Recovery rate kredit macet | 🎯 Outcome | 60 | % | 15% | Data recovery (manual) |
| 7 | Pembuatan lap. aging debitur | 📊 Process | 4 | jumlah/bln | 5% | Log WLA (otomatis) |

### A.3 Bagian Pelaporan

**Komposisi: Process 40% + Outcome 50% + Strategic 10% = 100%**

| # | Nama KPI | Kategori | Target | Satuan | Bobot | Sumber Pengukuran |
|---|---|---|---|---|---|---|
| 1 | Pembuatan lap. bulanan (LBU/SID) | 📊 Process | 12 | jumlah/thn | 20% | Log WLA (otomatis) |
| 2 | Ketepatan waktu submit OJK | 🎯 Outcome | 100 | % | 25% | Tgl submit vs deadline (manual) |
| 3 | Akurasi data laporan | 🎯 Outcome | 98 | % | 25% | Koreksi OJK (manual) |
| 4 | Rekonsiliasi data harian | 📊 Process | 22 | jumlah/bln | 15% | Log WLA (otomatis) |
| 5 | Kepatuhan regulasi pelaporan | 🏢 Strategic | 100 | % | 10% | Hasil audit (manual) |
| 6 | Pembuatan lap. internal manajemen | 📊 Process | 4 | jumlah/bln | 5% | Log WLA (otomatis) |

### A.4 Panduan Kategori KPI

| Kategori | Ciri | Sumber Realisasi | Contoh |
|---|---|---|---|
| 📊 **Process** | Hitung volume/frekuensi aktivitas | **Otomatis dari WLA** | Kunjungan, telepon, pembuatan laporan |
| 🎯 **Outcome** | Ukur hasil/dampak dari aktivitas | **Manual input + evidence** | Nasabah baru, collection rate, akurasi |
| 🏢 **Strategic** | Target cascading dari RKAT | **Manual input** | NPL, DPK growth, kepatuhan regulasi |

### A.5 Tips Menetapkan KPI

1. Total bobot per pegawai **harus = 100%**
2. Minimal **3 KPI**, maksimal **7 KPI** per pegawai per periode
3. KPI Process cocok untuk pegawai operasional (realisasi otomatis dari WLA)
4. KPI Outcome wajib untuk posisi manajerial/strategis
5. Target harus **SMART**: Specific, Measurable, Achievable, Relevant, Time-bound
6. Gunakan `POST /api/kpi-templates/apply` untuk mass-assign template ke pegawai

---

*SOP ini merupakan panduan operasional resmi untuk modul Penilaian Kinerja di Portal SDM.*
