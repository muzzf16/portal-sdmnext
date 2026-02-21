Berikut adalah resume komprehensif berdasarkan sumber yang Anda berikan, disusun khusus untuk kebutuhan **pengembangan aplikasi HRD**.

Resume ini menyusun alur logika sistem (business logic), struktur database, dan fitur fungsional yang diperlukan aplikasi untuk mengintegrasikan **Analisis Beban Kerja (ABK)**, **KPI**, dan **Penilaian Kinerja**.

---

### 1. Konsep Dasar & Alur Logika Sistem
Aplikasi harus dibangun berdasarkan hierarki berikut agar penilaian objektif:
**ABK (Norma Waktu) $\rightarrow$ Target KPI $\rightarrow$ Penilaian Kinerja (Realisasi vs Target)**,.

*   **Logic 1 (ABK):** Aplikasi harus menghitung kapasitas kerja dengan rumus: `(Durasi Aktivitas x Frekuensi) = Total Beban Kerja`. Hasilnya dibandingkan dengan total waktu tersedia untuk menentukan persentase beban kerja (Overload/Underload),.
*   **Logic 2 (Penetapan KPI):** Target KPI tidak boleh diinput sembarangan, melainkan ditarik otomatis atau direkomendasikan sistem berdasarkan kapasitas yang dihitung dari ABK,.
*   **Logic 3 (Scoring):** Penilaian otomatis membandingkan **Realisasi** (input harian/bulanan) dengan **Target**.
    *   *Contoh:* Target Closing Akuntansi H+3. Jika Realisasi H+3 = Nilai Bagus. Jika H+5 = Nilai Buruk,.

---

### 2. Modul Master Data (Basis Data)
Aplikasi memerlukan database standar waktu dan aktivitas untuk setiap jabatan (berdasarkan sampel data ABK yang tersedia):

#### A. Data Jabatan & Divisi
*   **Operasional:** Teller, CS, Admin, Accounting, Treasury.
*   **Bisnis:** Funding, Analis Kredit.
*   **Collection:** Staff Collection.
*   **Support:** HRD, IT, Admin Lelang.

#### B. Perpustakaan Aktivitas (Activity Library)
Sistem harus menyimpan "Norma Waktu" (Durasi Standar) untuk setiap tugas agar perhitungan konsisten.
*   **CS:** Pembukaan rekening (10 menit), Konsultasi (20 menit).
*   **Teller:** Setoran/tarikan (5 menit), Cash opname (15 menit).
*   **Collection:** Penagihan lapangan (30 menit), Perjalanan (20-45 menit),.
*   **HRD:** Screening CV (150 menit), Payroll (150 menit).
*   **IT:** Trouble shooting sistem (120 menit), Maintenance (15 menit).
*   **Analis:** Analisa kredit (80 menit), Survei.
*   **Accounting:** Jurnal harian (10 menit), Closing bulanan (5 hari).
*   **Treasury:** Proses invoice (5 menit), Rekonsiliasi bank (60 menit).

## Proposed Changes

### Component `Activity Library`
#### [MODIFY] `ActivityLibraryPage.tsx`
- Replace free-text inputs for `position` and `department` inside the Create/Edit form with dropdowns (`<select>`).
- Fetch the master list of positions using `getJabatanList()` from `jabatanApi.ts`.
- When an administrator selects a `jabatan` (position), automatically populate the `department` field to prevent typos and ensure it matches the employee database.

### Component `Log WLA`
#### [MODIFY] `WorkLoadForm.tsx`
- Make the `position` and `department` inputs read-only. Currently, they are auto-filled by the selected employee or the logged-in user, but making them read-only guarantees they cannot be manually tampered with, avoiding mismatch errors.

## Verification Plan

---

### 3. Modul Fungsional Aplikasi
Berikut adalah fitur-fitur spesifik yang harus dikembangkan berdasarkan sumber:

#### Fitur 1: Kalkulator Beban Kerja (WLA Engine)
*   **Input:** Karyawan memasukkan frekuensi kegiatan (harian/bulanan).
*   **Proses:** Sistem mengalikan frekuensi dengan durasi standar.
*   **Output:** Persentase beban kerja (FTE).
    *   *Validasi Data:* Menampilkan status beban kerja. Contoh: Collection "Apri" memiliki beban 103% (Overload), sementara IT "Dibyo" 69% (Underload),.
    *   *Tujuan:* Data ini digunakan manajemen untuk mutasi pegawai atau penambahan tim.

#### Fitur 2: Manajemen KPI (SMART)
Fitur untuk menetapkan target yang Spesifik, Terukur, Dapat Dicapai, Relevan, dan Berbatas Waktu.
*   **Setting Target:**
    *   *Accounting:* Target akurasi 99.5%, Closing maksimal H+3.
    *   *Treasury:* Memproses minimal 85 invoice/hari (berdasarkan kapasitas ABK).
*   **Monitoring Berkala:** Dashboard untuk memantau progres (Januari: Tercapai, April: Tidak Tercapai).

#### Fitur 3: Penilaian Kinerja (Performance Appraisal)
Modul untuk evaluasi akhir periode (Semesteran/Tahunan).
*   **Mekanisme:** Membandingkan data aktual (dari log aktivitas harian) dengan target KPI.
*   **Skala Penilaian:** Sistem memberikan skor otomatis (misal skala 1-5).
    *   Nilai 3 (Cukup) jika rata-rata closing H+3.3.
    *   Nilai 5 (Sangat Baik) jika akurasi 99.7%.
*   **Tindak Lanjut:** Fitur untuk mencatat rekomendasi *Coaching & Counseling* jika target tidak tercapai,.

---

### 4. Fitur Spesifik per Role (User Story)
Untuk pengembangan antarmuka (UI/UX), pertimbangkan kebutuhan input data spesifik berikut:

1.  **Untuk Tim Lapangan (Collection & Funding):**
    *   Perlu fitur *Mobile Input* atau *Geo-tagging*.
    *   Alasan: Porsi kerja terbesar mereka adalah "Perjalanan ke nasabah" dan "Kunjungan" (bisa memakan waktu 45-60 menit perjalanan + 30 menit kunjungan),.
2.  **Untuk Tim Administrasi (Admin Kredit/Lelang):**
    *   Fitur *Document Tracking*.
    *   Alasan: Tugas mereka sangat bergantung pada status berkas (Input berkas lelang, koordinasi BPN, scan berkas) yang memakan waktu lama (hingga 120 menit untuk input web lelang),.
3.  **Untuk HRD:**
    *   Dashboard *Manpower Planning*.
    *   Alasan: HRD butuh data ABK untuk rekrutmen (screening CV butuh 150 menit) dan evaluasi struktur organisasi,.

### 5. Laporan & Analytics (Output Sistem)
Aplikasi harus menghasilkan laporan otomatis:
1.  **Laporan Efisiensi:** Identifikasi proses yang memakan waktu terlalu lama (misal: IT menghabiskan 300 menit untuk kunjungan cabang trouble) untuk evaluasi efisiensi,.
2.  **Rapor Individu:** Menampilkan grafik Realisasi vs Target KPI bulanan.
3.  **Analisis Kebutuhan SDM:** Rekomendasi apakah perlu menambah pegawai baru berdasarkan total menit beban kerja divisi vs jam kerja tersedia.

**Kesimpulan untuk Developer:**
Inti dari aplikasi ini adalah **Database Durasi Standar** yang kuat. Jangan biarkan user menginput durasi secara manual setiap saat agar data tetap objektif. Aplikasi harus mengubah input "Frekuensi" menjadi "Nilai Kinerja" secara otomatis.

---

### 6. FAQ (Pertanyaan yang Sering Diajukan)

**Q: Mengapa Bobot tetap 20% padahal target dan realisasi tercapai semua (misal skor 5/Sangat Baik)?**
**A:** Karena ada perbedaan konsep antara **Skor** dan **Bobot**:
- **Bobot (Weight):** Menunjukkan *tingkat prioritas* atau *tingkat kepentingan* suatu KPI dibandingkan KPI lain sebelum pekerjaan dilakukan. Ketika mengklik tombol "⚡ Generate dari ABK", sistem secara otomatis mengambil 5 aktivitas teratas berdasarkan Analisis Beban Kerja dan membaginya rata (100% ÷ 5 = 20%). Bobot tidak akan berubah secara otomatis berdasarkan capaian Anda; bobot hanya bisa diubah secara manual jika dirasa ada KPI yang lebih penting dari yang lain.
- **Skor (Score):** Menunjukkan presentase *pencapaian/keberhasilan* Realisasi berbanding Target. Ini yang dinilai dari 1 hingga 5. Skor 5 (Sangat Baik) diberikan jika realisasi mencapai 100% atau lebih dari target yang ditentukan.

**Q: Mengapa Skor Rata-rata Tertimbang saya sangat tinggi atau rendah?**
**A:** Skor Rata-rata (Tertimbang) dihitung dari rumus: `Total (Skor × Bobot) ÷ Total Bobot`. Jika total bobot Anda melebihi 100% (misal karena Anda membuat KPI manual tanpa menyesuaikan bobot KPI sebelumnya), perhitungannya bisa bias. Sangat disarankan untuk mengedit (Manual Edit) bobot KPI Anda sedemikian rupa agar akumulasi totalnya berjumlah tepat 100%.

**Q: Bagaimana jika target saya satuannya "hari" alih-alih jumlah, seperti "Selesai H+3"?**
**A:** Sistem HRMS memiliki algoritma perhitungan *inverse* terpisah untuk satuan target waktu (hari). Jika "100 jumlah" maka makin tinggi aktual makin baik. Sebaliknya, jika unitnya "hari" (misal H+3), maka makin rendah nilainya makin baik. Realisasi H+2 atau H+3 akan mendapatkan Skor 5 (Sangat Baik), sedangkan Realisasi H+5 akan mendapat skor rendah.