# Hasil Cek, Analisa, dan Susunan Integrasi Antar Aplikasi `portal-sdmnext`

Tanggal cek: 2026-03-01  
Branch: `work`

## Ringkasan Kondisi Saat Ini

- Struktur repo menunjukkan arsitektur monorepo sederhana dengan dua aplikasi utama: `apps/backend` dan `apps/frontend`.
- Proses build backend dan frontend saat ini **belum lolos**.
- Akar masalah utama terlihat pada **ketidaksiapan environment/dependency installation per-subproject** dan beberapa isu TypeScript tambahan.

## Cek yang Dijalankan

1. `npm --prefix apps/backend run build`
2. `npm --prefix apps/frontend run build`

## Temuan Utama Build

### 1) Backend gagal build

Perintah build backend gagal dengan error TypeScript:

- `Cannot find module 'pdfkit' or its corresponding type declarations.`
- Lokasi error: `src/modules/penggajian/penggajian.service.ts`.

Analisa:
- `pdfkit` dan `@types/pdfkit` sudah terdaftar di `apps/backend/package.json`, jadi indikasinya dependency backend belum terpasang lengkap di environment saat ini.

### 2) Frontend gagal build dengan error masif

Build frontend menghasilkan banyak error TypeScript, terutama:

- Deklarasi tipe modul tidak ditemukan (`react`, `react-dom`, `react-router-dom`, `axios`, `clsx`, `lucide-react`, dll).
- Banyak error turunan seperti `JSX element implicitly has type 'any'`, `Cannot find namespace 'React'`, dan `Property 'env' does not exist on type 'ImportMeta'`.

Analisa:
- Pola error sangat kuat mengarah ke dependency frontend yang belum terinstal di `apps/frontend` (meski didefinisikan di `apps/frontend/package.json`).
- Setelah dependency terpenuhi, kemungkinan masih ada sisa error strict TypeScript (contoh `implicit any`) yang perlu dibersihkan bertahap.

## Rekomendasi Prioritas Pemulihan Build

1. **Pasang dependency per aplikasi (bukan hanya root):**
   - `cd apps/backend && npm install`
   - `cd apps/frontend && npm install`
2. Ulangi build:
   - `npm --prefix apps/backend run build`
   - `npm --prefix apps/frontend run build`
3. Jika frontend masih gagal, fokuskan perbaikan pada:
   - konfigurasi TypeScript/Vite terkait `ImportMeta.env`;
   - anotasi tipe untuk parameter yang masih `implicit any`.

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

Sebelum memulai integrasi, stabilkan dulu build per subproject agar baseline sistem sehat. Setelah itu, ikuti urutan integrasi di atas agar pertukaran data antar aplikasi konsisten, aman, dan mudah dioperasikan jangka panjang.
