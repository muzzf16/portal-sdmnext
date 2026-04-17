# Review Pengembangan KPI Nominal (WLA)
*Snapshot: April 2026*

Dokumen ini merangkum implementasi pelacakan KPI berbasis nominal Rupiah pada modul **Kinerja (WLA)**, termasuk perubahan data, backend, frontend, serta panduan operasional untuk Admin/Supervisor.

---

## Ringkasan Eksekutif

Fitur KPI nominal telah diimplementasikan untuk mendukung pengukuran realisasi finansial secara lebih akurat dan konsisten antar pegawai.  
Status saat ini: **selesai diimplementasikan dan sudah digunakan**.

Indikator khusus yang dicakup:
- **Penanganan NPL** — target standar **Rp 50 Juta**
- **Perolehan Pemasaran Kredit** — target standar **Rp 100 Juta**
- **Perolehan Pemasaran Dana** — target standar **Rp 100 Juta**

> Catatan: indikator khusus ini berkontribusi pada bobot KPI sesuai konfigurasi sistem (acuan saat ini: **20%**).

---

## Ruang Lingkup Perubahan

### 1) Data Layer (Database)
- Menambahkan kolom `nominal_rupiah` bertipe `REAL` pada tabel `log_aktivitas_harian`.
- Kolom ini dipakai untuk menyimpan nilai transaksi/realisasi nominal per aktivitas harian yang relevan.

### 2) Service/Repository Layer (Backend)
- Repository log aktivitas harian diperbarui agar mendukung agregasi nominal dengan `SUM(nominal_rupiah)`.
- Hasil agregasi dipakai sebagai sumber data realisasi KPI nominal pada monitoring.

### 3) Presentation Layer (Frontend)
- Form entri WLA mendukung input nominal Rupiah untuk aktivitas yang termasuk kategori KPI nominal.
- Monitoring KPI menampilkan realisasi berbasis agregasi nominal harian.

---

## Detail Perubahan UI/UX

### A. Standarisasi Format Mata Uang
- Tampilan menghilangkan desimal tidak perlu (contoh: `Rp 100.0 Juta` -> `Rp 100 Juta`).
- Desimal tetap ditampilkan jika nilai memang pecahan (contoh: `Rp 16.6 Juta`).
- Nilai mendekati bilangan bulat ditampilkan secara proporsional agar mudah dibaca (contoh: input `9.999.999` tampil sebagai `Rp 10 Juta` pada konteks ringkasan).

### B. Otomatisasi dan Penguncian Target KPI Nominal
- Pada halaman **Manajemen KPI**, saat Admin/Supervisor mengisi nama KPI dengan kata kunci `NPL`, `Kredit`, atau `Dana`, sistem akan:
  - mengisi target default otomatis,
  - menetapkan satuan ke nominal Rupiah,
  - mengunci field penting agar konsisten antar data pegawai.
- Pada halaman **Entry WLA**, label target ditampilkan otomatis sebagai panduan input (contoh: `Target: Rp 50 Juta`).

### C. Perbaikan Cetak Laporan Monitoring (PDF)
- Menambahkan header identitas laporan: **Nama Pegawai**, **NIP**, **Periode**.
- Menyembunyikan elemen navigasi/non-dokumen (sidebar, tombol) pada mode cetak agar hasil lebih profesional.

---

## Alur Penggunaan (Admin/Supervisor)

1. **Set KPI Nominal**
   - Masuk ke menu **Manajemen KPI**.
   - Tambahkan KPI pegawai menggunakan kata kunci nominal (`NPL`, `Kredit`, `Dana`) agar target otomatis terisi.

2. **Input Aktivitas Harian**
   - Pegawai mengisi aktivitas WLA pada modul harian.
   - Untuk aktivitas nominal, isi nilai Rupiah pada field yang disediakan.

3. **Monitoring Progres**
   - Buka tab **Monitoring KPI**.
   - Sistem menampilkan realisasi kumulatif dari agregasi `nominal_rupiah`.

4. **Cetak Laporan**
   - Gunakan tombol **Cetak PDF**.
   - Laporan tercetak dengan identitas lengkap dan layout siap arsip/audit.

---

## Dampak Bisnis dan Manfaat

- Pengukuran capaian KPI finansial lebih objektif dan terukur.
- Konsistensi target antar unit lebih terjaga karena auto-fill + field lock.
- Monitoring pimpinan lebih cepat karena data realisasi terakumulasi otomatis.
- Output laporan lebih layak untuk kebutuhan dokumentasi formal.

---

## Risiko dan Mitigasi

- **Risiko:** pengguna mengisi nominal tidak sesuai konteks aktivitas.  
  **Mitigasi:** tampilkan field nominal hanya untuk aktivitas relevan + validasi input positif.

- **Risiko:** perbedaan persepsi format angka (jutaan vs rupiah penuh).  
  **Mitigasi:** gunakan satu standar tampilan di UI dan jelaskan unit pada label/tooltip.

- **Risiko:** data lama belum memiliki nilai `nominal_rupiah`.  
  **Mitigasi:** fallback agregasi aman (anggap nilai kosong = 0) pada query.

---

## Checklist Verifikasi Pasca Rilis

- [ ] Input WLA nominal tersimpan benar ke `nominal_rupiah`.
- [ ] Agregasi monitoring menampilkan total nominal sesuai data aktivitas.
- [ ] Auto-fill target KPI berjalan untuk keyword `NPL`, `Kredit`, `Dana`.
- [ ] Field target terkunci pada KPI nominal (sesuai kebijakan).
- [ ] Tampilan angka Rupiah konsisten (tanpa desimal berlebih).
- [ ] Cetak PDF memuat identitas pegawai, NIP, periode, dan layout bersih.

---

## Status Pengembangan

**SELESAI & TERDEPLOY**

Catatan operasional:
- Jika perubahan UI belum terlihat di browser, lakukan **hard refresh** (`Ctrl + F5`).
