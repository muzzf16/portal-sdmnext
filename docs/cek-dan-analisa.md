# Hasil Cek Ulang, Analisa, dan Susunan Integrasi Antar Aplikasi `portal-sdmnext`

Tanggal cek ulang: 2026-03-01  
Branch: `work`

## Ringkasan Kondisi Terbaru

- Cek ulang dilakukan setelah ada perubahan kode terbaru.
- **Build backend sekarang sudah lolos**.
- **Build frontend masih gagal** namun pola error sudah lebih spesifik (kompatibilitas versi, dependency frontend yang belum sinkron, serta isu typing TypeScript strict).

## Cek yang Dijalankan (Ulang)

1. `npm --prefix apps/backend run build`
2. `npm --prefix apps/frontend run build`

## Temuan Utama Build Terbaru

### 1) Backend (status: ✅ lulus)

Perintah `npm --prefix apps/backend run build` berhasil menjalankan `tsc` tanpa error.

Analisa:
- Indikasi masalah dependency utama backend sebelumnya sudah tertangani di environment saat ini.

### 2) Frontend (status: ❌ gagal)

Perintah `npm --prefix apps/frontend run build` masih gagal. Temuan penting dikelompokkan sebagai berikut:

#### A. Potensi mismatch versi library (perlu prioritas)

- `BrowserRouter` tidak mengenal properti `future`.
  - Ini mengarah ke ketidaksesuaian API router yang dipakai pada kode vs versi `react-router-dom` terpasang.
- Error tipe `i18n` antara `i18next` dan `react-i18next` menunjukkan konflik tipe lintas versi (termasuk nested dependency).

#### B. Dependency frontend belum konsisten/terbaca oleh TypeScript

Masih muncul `Cannot find module ...` untuk paket penting, misalnya:
- `react-hook-form`
- `axios`
- `xlsx`
- `pdfmake/*`
- `tailwind-variants`

Ini biasanya terjadi jika:
- install dependency frontend belum sinkron dengan lockfile,
- atau node_modules frontend belum dalam kondisi bersih/valid,
- atau workspace/hoisting membuat resolver TypeScript membaca paket yang tidak sesuai.

#### C. Error TypeScript strict lanjutan

Setelah isu versi/dependency dibereskan, masih ada pekerjaan cleanup tipe:
- `implicit any` pada banyak callback parameter.
- `ImportMeta.env` tidak dikenali (perlu deklarasi tipe Vite/env yang benar).
- Tipe komponen generik pada `Table.tsx` (`child.props` bertipe `unknown`).

## Rekomendasi Prioritas Perbaikan Frontend

### Tahap 1 — Stabilkan dependency & versi

1. Sinkronkan dependency frontend dari direktori `apps/frontend`:
   - `npm install`
2. Pastikan versi `react-router-dom` sesuai penggunaan kode:
   - Jika tetap v6, hapus properti `future` yang tidak didukung versi aktif.
   - Atau sesuaikan versi package bila memang butuh API tersebut.
3. Pastikan pasangan `i18next` dan `react-i18next` kompatibel pada versi yang sama/selaras.

### Tahap 2 — Benahi typing dan konfigurasi TS/Vite

1. Tambahkan/validasi deklarasi environment Vite (`ImportMeta.env`) pada file tipe global frontend.
2. Perbaiki semua `implicit any` pada callback penting.
3. Perketat tipe komponen tabel generik agar tidak mengakses `unknown` secara langsung.

### Tahap 3 — Verifikasi berulang

1. Jalankan ulang build frontend:
   - `npm --prefix apps/frontend run build`
2. Setelah build hijau, lanjutkan smoke test fitur utama (auth, pegawai, absensi, kinerja).

---

## Susunan Langkah Integrasi dengan Aplikasi Lain (Agar Bisa Bertukar Data)

Berikut urutan langkah praktis yang direkomendasikan supaya integrasi aman, stabil, dan mudah dipelihara.

### 1) Tentukan tujuan integrasi dan use case data

Definisikan sejak awal:
- Data apa yang ditukar (contoh: master pegawai, absensi, cuti, payroll).
- Arah aliran data (satu arah / dua arah).
- Frekuensi sinkronisasi (real-time, near real-time, batch harian).
- Sumber kebenaran (source of truth) tiap entitas.

Output tahap ini: dokumen ruang lingkup integrasi + prioritas data kritikal.

### 2) Standarkan kontrak data

Buat kontrak payload untuk setiap entitas:
- Field wajib, tipe data, enum status, format tanggal/waktu (disarankan ISO-8601 UTC).
- Penamaan konsisten (`snake_case` atau `camelCase`, pilih satu).
- Aturan validasi dan nilai default.

Output tahap ini: spesifikasi kontrak API/event (versi v1).

### 3) Pilih pola integrasi

Pilih sesuai kebutuhan:
- **REST API sinkron**: sederhana, cocok untuk query/perintah langsung.
- **Webhook/event async**: cocok untuk notifikasi perubahan data.
- **Batch file (CSV/Excel)**: cocok untuk migrasi awal atau sistem legacy.

Saran umum:
- Mulai dari REST untuk baseline.
- Tambahkan webhook/event untuk kebutuhan yang harus cepat dan skalabel.

### 4) Siapkan keamanan integrasi

Wajib disiapkan:
- Autentikasi mesin-ke-mesin (API key/JWT/OAuth2 client credentials).
- Otorisasi per scope endpoint.
- Signature request (untuk webhook), timestamp, dan anti-replay.
- Enkripsi in-transit (HTTPS/TLS).
- Masking data sensitif pada log.

### 5) Rancang mekanisme sinkronisasi dan idempotensi

Agar pertukaran data aman dari duplikasi:
- Tetapkan `external_id` untuk memetakan record lintas sistem.
- Gunakan `idempotency_key` untuk operasi create/update penting.
- Simpan `last_synced_at` dan status sinkronisasi.
- Definisikan strategi conflict resolution (last-write-wins atau rule bisnis khusus).

### 6) Implementasi endpoint/adaptor integrasi di backend

Langkah implementasi di sisi backend:
- Tambah endpoint integrasi khusus (mis. `/integrations/*`) atau service adaptor.
- Validasi payload ketat (schema validation).
- Mapping data inbound/outbound ke model internal.
- Simpan audit log integrasi (request id, status, error ringkas).

### 7) Tangani reliability: retry, timeout, dead-letter

Supaya tahan gangguan jaringan/sistem partner:
- Timeout jelas per request.
- Retry bertahap (exponential backoff + jitter).
- Circuit breaker untuk mencegah cascading failure.
- Dead-letter queue / tabel error untuk payload yang gagal berulang.

### 8) Observability dan monitoring

Tambahkan sejak awal:
- Correlation ID lintas request.
- Metrics: success rate, latency, error rate, retry count.
- Dashboard + alert untuk error kritikal.
- Audit trail agar mudah tracing saat ada selisih data.

### 9) Uji integrasi berlapis

Urutan testing yang dianjurkan:
1. Unit test untuk mapper/validator.
2. Integration test antar service.
3. Contract test (supaya kontrak data tidak pecah saat perubahan).
4. UAT dengan sample data realistis.
5. Pilot rollout ke sebagian data/tenant.

### 10) Go-live bertahap dan rollback plan

Saat produksi:
- Gunakan feature flag untuk mengaktifkan integrasi bertahap.
- Mulai dari satu domain data (mis. master pegawai), lalu bertambah.
- Siapkan rollback cepat (nonaktif endpoint/webhook/consumer tertentu).
- Lakukan rekonsiliasi data pasca go-live.

## Checklist Implementasi Cepat (Praktis)

- [ ] Scope & owner integrasi disepakati.
- [ ] Kontrak data v1 ditandatangani dua pihak.
- [ ] Mekanisme auth + secret management siap.
- [ ] Mapping `external_id` untuk entitas inti selesai.
- [ ] Endpoint/adaptor + validasi payload selesai.
- [ ] Retry, timeout, logging, monitoring aktif.
- [ ] Contract test + UAT lulus.
- [ ] Runbook incident & rollback tersedia.

## Kesimpulan

Kondisi terbaru menunjukkan peningkatan pada backend (sudah build sukses), sementara frontend masih perlu stabilisasi versi/dependency dan perbaikan typing TypeScript. Setelah frontend hijau, langkah integrasi antar aplikasi dapat dijalankan lebih aman dengan urutan implementasi di atas.
