# Dokumentasi Sampel Test: Monitoring Berkas Pengajuan Kredit v2

Dokumen ini berisi contoh skenario pengujian (manual/otomatis) untuk memastikan seluruh fitur alur monitoring kredit berjalan sesuai spesifikasi dan bebas regresi.

---

## 1. Submit Pengajuan Kredit Baru
- **Langkah:**
    1. Login sebagai CS/AO.
    2. Akses form pengajuan kredit dan submit berkas baru ('Test Kredit 001').
- **Hasil yang Diharapkan:**
    - Data masuk ke database dengan `current_stage` = `penerimaan`.
    - Log riwayat: "Pendaftaran berkas diterima".
    - Diagram Map di frontend menyorot node "Penerimaan".

---

## 2. Proses SLIK Berhasil
- **Langkah:**
    1. Login sebagai Admin Kredit.
    2. Proses berkas ke tahap SLIK.
- **Hasil yang Diharapkan:**
    - `current_stage` berubah ke `slik`.
    - Log riwayat: "Proses SLIK di-approve".
    - Diagram Map pindah ke node "SLIK".

---

## 3. Delegasi Survey oleh KABID Kredit
- **Langkah:**
    1. Login sebagai KABID Kredit.
    2. Pada tahap 'delegasi_survey', pilih staf marketing dan submit.
- **Hasil yang Diharapkan:**
    - Field `delegated_to` diisi nama staf terpilih.
    - Log: "Delegasi survey ke <nama pegawai>".
    - Stage otomatis ke 'survey'.
    - Diagram Map node 'Survey' aktif.

---

## 4. Surveyor Input, Lanjut Tahap Komite Kredit
- **Langkah:**
    1. Login sebagai pegawai yang didelegasi.
    2. Isi dan submit formulir survey.
- **Hasil yang Diharapkan:**
    - Stage lanjut ke `komite_kredit`.
    - Log: "Survey selesai oleh <nama pegawai>".
    - Diagram Map pindah ke node "Komite Kredit".

---

## 5. Pengajuan Ditolak
- **Langkah:**
    1. Pada tahap mana pun, pilih aksi "Tolak".
- **Hasil yang Diharapkan:**
    - Stage menjadi `ditolak_cs`.
    - Diagram Map node aktif berwarna merah.
    - Log: "Ditolak di tahap <tahap>".

---

## 6. Filter Prioritas KABID
- **Langkah:**
    1. Login sebagai KABID Kredit.
    2. Lihat halaman monitoring, coba centang/untuk 'Lihat Seluruh Pipeline'.
- **Hasil yang Diharapkan:**
    - Default: hanya tampilkan berkas prioritas KABID.
    - Setelah dicentang: seluruh pipeline terlihat.

---

## 7. Bug Inisialisasi Stage
- **Langkah:**
    1. Tambahkan berkas baru.
- **Hasil yang Diharapkan:**
    - `current_stage` selalu 'penerimaan'.
    - Tidak auto-lolos ke SLIK tanpa aksi petugas.
    - Tidak ada duplikat log inisiasi.

---

## 8. Interaktivitas Diagram Map
- **Langkah:**
    1. Klik node berbagai tahap pada Diagram Map.
- **Hasil yang Diharapkan:**
    - Tabel berkas otomatis filter sesuai stage yang diklik.
    - Highlight node Diagram Map selalu sinkron dengan backend.

---

> Semua test dapat diadaptasi untuk manual (web), Postman, Playwright, atau jest+supertest. Gunakan login realistis dan test id milik data development.
