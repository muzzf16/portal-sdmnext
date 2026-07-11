# Module Map: Portal SDM v3 Backend

Dokumen ini memetakan seluruh modul/domain bisnis backend yang ditemukan pada direktori [apps/backend/src/modules/](file:///opt/portal-sdmv3/apps/backend/src/modules/). Pengelompokan disusun berdasarkan tingkat risiko keamanannya, dengan modul berisiko tinggi diletakkan di bagian atas dokumen.

Setiap klaim yang tumpang tindih dengan [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md), [AGENTS.md](file:///opt/portal-sdmv3/AGENTS.md), atau [docs/FINAL_IMPLEMENTATION_STATUS.md](file:///opt/portal-sdmv3/docs/FINAL_IMPLEMENTATION_STATUS.md) dicocokkan langsung dengan kode aktual dan dicatat sebagai catatan kaki (*footnote*).

> [!CAUTION]
> **ACCEPTED RISKS per 11 Juli 2026 (DITUNDA SECARA SADAR atas keputusan pemilik proyek):**
> * **SEC-02 [KRITIS]**: Modul `backup`, `pengguna`, `pegawai`, `cuti`, `absensi`, `penggajian`, `kontrak`, dan `laporan` tidak memiliki proteksi autentikasi pada rute-nya, meski `GEMINI.md` mengklaim sebaliknya. Server bersifat internet-facing. Risiko: akses/modifikasi/pengambilan data tanpa otorisasi dapat terjadi kapan saja.
> * **SEC-04 [KRITIS]**: Endpoint `POST /api/auth/register` menerima field `role` langsung dari request body client tanpa validasi/whitelist ([auth.pengguna.service.ts:34](file:///opt/portal-sdmv3/apps/backend/src/modules/pengguna/auth.pengguna.service.ts#L34): `role: role?.toLowerCase() || 'employee'`). Siapa pun dapat mendaftar dengan `role="admin"` dan mendapatkan hak akses penuh tanpa otorisasi.

---

## 🚨 MODUL DENGAN TINGKAT RISIKO: TINGGI

Modul-modul ini mengelola data kredensial/autentikasi pengguna, data pribadi pegawai (*personally identifiable information*), data keuangan/gaji bulanan, arsip rahasia, cadangan database sistem, atau integrasi M2M eksternal.

### 1. Modul: pengguna (Manajemen Pengguna & Auth)

| Parameter | Keterangan / Hasil Investigasi |
| :--- | :--- |
| **Tujuan Bisnis** | Autentikasi pengguna (login, registrasi), manajemen akun, pengaturan password (reset & ubah mandiri), serta pengelolaan avatar profil. |
| **Route / Endpoint** | - `POST /api/auth/login`<br>- `POST /api/auth/register`<br>- `GET /api/users`<br>- `GET /api/users/:id`<br>- `PUT /api/users/:id`<br>- `PUT /api/users/:id/password`<br>- `PUT /api/users/:id/reset-password`<br>- `POST /api/users/:id/avatar`<br>- `DELETE /api/users/:id` |
| **Controller & Service** | - Controller: [auth.pengguna.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pengguna/auth.pengguna.controller.ts), [pengguna.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pengguna/pengguna.controller.ts)<br>- Service: [auth.pengguna.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pengguna/auth.pengguna.service.ts), [pengguna.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pengguna/pengguna.service.ts)<br>- Repository: [pengguna.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pengguna/pengguna.repository.ts)<br>- Model: [pengguna.model.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pengguna/pengguna.model.ts) |
| **Tabel Database** | `pengguna` (aktif) |
| **Middleware & Permission** | - Rute `/api/auth/*`: **Publik**.<br>- Rute `/api/users/*`: **Publik / Tidak terproteksi**[^1] (tidak ada `authenticateToken` pada berkas router). |
| **Dependensi Modul** | `pegawai` (ketika membuat user baru tanpa `employeeId`, otomatis membuat entri pegawai baru). |
| **Status Testing** | Tidak ada pengujian otomatis (No tests). |
| **Tingkat Risiko** | **TINGGI** (Mengelola kredensial masuk, kata sandi, dan peran hak akses). |

[^1]: Klaim serupa ditemukan di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian Autentikasi Pengguna) dan [AGENTS.md:69](file:///opt/portal-sdmv3/AGENTS.md#L69) yang menyatakan seluruh endpoint backend (kecuali `/auth`) wajib dilindungi JWT. Namun, setelah dicocokkan dengan kode aktual, klaim ini **TERVERIFIKASI BERBEDA** karena rute `/api/users` tidak dibungkus middleware autentikasi.

---

### 2. Modul: pegawai (Manajemen Pegawai)

| Parameter | Keterangan / Hasil Investigasi |
| :--- | :--- |
| **Tujuan Bisnis** | Mengelola data induk karyawan, informasi personal, riwayat pendidikan, riwayat kerja, data keluarga, data gaji dasar, jenis kelamin, alamat, dan NIP. |
| **Route / Endpoint** | - `GET /api/employees`<br>- `GET /api/employees/:id`<br>- `POST /api/employees`<br>- `POST /api/employees/with-user`<br>- `PUT /api/employees/:id`<br>- `DELETE /api/employees/:id`<br>- `PUT /api/employees/:id/payroll-info`<br>- `GET /api/employees/charts/gender-distribution`<br>- `GET /api/employees/charts/education-distribution`<br>- `GET /api/employees/charts/department-distribution` |
| **Controller & Service** | - Controller: [pegawai.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pegawai/pegawai.controller.ts), [pegawai.auth.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pegawai/pegawai.auth.controller.ts)<br>- Service: [pegawai.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pegawai/pegawai.service.ts), [pegawai.auth.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pegawai/pegawai.auth.service.ts)<br>- Repository: [pegawai.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pegawai/pegawai.repository.ts)<br>- Model: [pegawai.model.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pegawai/pegawai.model.ts) |
| **Tabel Database** | `pegawai` (utama). Operasi hapus (`DELETE`) melakukan pembersihan berantai (cascade manual) pada tabel: `absensi`, `permintaan_cuti`, `penggajian`, `penilaian_kinerja`, `kontrak`, `data_change_requests`, `analisis_beban_kerja`, `kpi_targets`, `pelatihan`, `riwayat_jabatan`, `tugas_orientasi`, `notifications`, `assigned_tasks`, `log_aktivitas_harian`, `pinjaman_karyawan`, `daily_activities`, `users`. |
| **Middleware & Permission** | Seluruh rute pada berkas [pegawai.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pegawai/pegawai.routes.ts): **Publik / Tidak terproteksi**[^2] (tidak menggunakan `authenticateToken`). |
| **Dependensi Modul** | `jabatan` (untuk sinkronisasi nama, departemen, dan level atasan), `pengguna` (untuk pembuatan user-pegawai gabungan). |
| **Status Testing** | Tidak ada pengujian otomatis. |
| **Tingkat Risiko** | **TINGGI** (Menyentuh data personal pegawai (PII) secara penuh). |

[^2]: Klaim serupa ditemukan di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian Pegawai) dan [AGENTS.md:69](file:///opt/portal-sdmv3/AGENTS.md#L69) yang menyatakan endpoint ini dilindungi JWT. Kenyataannya, berkas rute tidak memasang middleware autentikasi. **TERVERIFIKASI BERBEDA** dengan kode aktual.

---

### 3. Modul: cuti (Manajemen Cuti & Izin)

| Parameter | Keterangan / Hasil Investigasi |
| :--- | :--- |
| **Tujuan Bisnis** | Pencatatan hak cuti tahunan, pengajuan permohonan cuti baru, persetujuan status cuti oleh atasan/admin, dan batch update hari cuti bersama. |
| **Route / Endpoint** | - `GET /api/leave-requests`<br>- `GET /api/leave-requests/batch-sisa-cuti`<br>- `GET /api/leave-requests/cuti-bersama`<br>- `GET /api/leave-requests/employee/:employeeId`<br>- `GET /api/leave-requests/sisa-cuti/:employeeId`<br>- `GET /api/leave-requests/:id`<br>- `POST /api/leave-requests`<br>- `PUT /api/leave-requests/:id/status`<br>- `DELETE /api/leave-requests/:id` |
| **Controller & Service** | - Controller: [cuti.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/cuti/cuti.controller.ts)<br>- Service: [cuti.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/cuti/cuti.service.ts)<br>- Repository: [permintaanCuti.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/cuti/permintaanCuti.repository.ts)<br>- Model: [permintaanCuti.model.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/cuti/permintaanCuti.model.ts) |
| **Tabel Database** | `permintaan_cuti`, `pegawai` (mengurangi `leaveBalance` saat disetujui), `jabatan`. |
| **Middleware & Permission** | Seluruh rute pada berkas [cuti.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/cuti/cuti.routes.ts): **Publik / Tidak terproteksi**[^3] (tidak ada `authenticateToken`). |
| **Dependensi Modul** | `pegawai` (validasi sisa cuti dan identitas pemohon). |
| **Status Testing** | Tidak ada pengujian otomatis. |
| **Tingkat Risiko** | **TINGGI** (Menyentuh status ketidakhadiran kerja dan saldo cuti). |

[^3]: Klaim serupa ditemukan di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian Cuti) menyatakan endpoint membutuhkan token. Kenyataannya, berkas rute tidak memasang middleware autentikasi. **TERVERIFIKASI BERBEDA** dengan kode aktual.

---

### 4. Modul: absensi (Pencatatan Kehadiran)

| Parameter | Keterangan / Hasil Investigasi |
| :--- | :--- |
| **Tujuan Bisnis** | Mencatar kehadiran harian pegawai (clock-in/out), upload log absensi massal dari mesin sidik jari, dan modifikasi data absen karyawan oleh admin. |
| **Route / Endpoint** | - `GET /api/attendance`<br>- `GET /api/attendance/:id`<br>- `POST /api/attendance/clock-in`<br>- `POST /api/attendance/clock-out`<br>- `GET /api/attendance/employee/:id`<br>- `POST /api/attendance/upload`<br>- `POST /api/attendance`<br>- `PUT /api/attendance/:id`<br>- `DELETE /api/attendance/:id` |
| **Controller & Service** | - Controller: [absensi.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/absensi/absensi.controller.ts)<br>- Service: [absensi.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/absensi/absensi.service.ts)<br>- Repository: [absensi.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/absensi/absensi.repository.ts)<br>- Model: [absensi.model.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/absensi/absensi.model.ts) |
| **Tabel Database** | `absensi`, `pegawai`, `jabatan`. |
| **Middleware & Permission** | Seluruh rute pada berkas [absensi.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/absensi/absensi.routes.ts): **Publik / Tidak terproteksi**[^4]. |
| **Dependensi Modul** | `pegawai` (mengambil detail nama, jabatan, NIP, serta validasi pegawai aktif). |
| **Status Testing** | Tidak ada pengujian otomatis. |
| **Tingkat Risiko** | **TINGGI** (Menyentuh rekap kehadiran kerja yang mempengaruhi integritas data disiplin). |

[^4]: Klaim serupa ditemukan di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian Absensi) menyatakan rute terproteksi JWT. Kenyataannya, berkas rute tidak memasang middleware autentikasi. **TERVERIFIKASI BERBEDA** dengan kode aktual.

---

### 5. Modul: penggajian (Manajemen Payroll)

| Parameter | Keterangan / Hasil Investigasi |
| :--- | :--- |
| **Tujuan Bisnis** | Generate penggajian bulanan karyawan secara massal (`run`), manipulasi komponen gaji kustom (tunjangan/potongan), mengunduh slip gaji format PDF, dan persetujuan status bayar. |
| **Route / Endpoint** | - `GET /api/payrolls`<br>- `GET /api/payrolls/:id`<br>- `GET /api/payrolls/employee/:id`<br>- `POST /api/payrolls`<br>- `PUT /api/payrolls/:id`<br>- `POST /api/payrolls/run`<br>- `DELETE /api/payrolls/:id`<br>- `POST /api/payrolls/:id/components`<br>- `GET /api/payrolls/:id/download`<br>- `PATCH /api/payrolls/:id/status` |
| **Controller & Service** | - Controller: [penggajian.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/penggajian/penggajian.controller.ts)<br>- Service: [penggajian.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/penggajian/penggajian.service.ts)<br>- Repository: [penggajian.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/penggajian/penggajian.repository.ts)<br>- Model: [penggajian.model.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/penggajian/penggajian.model.ts) |
| **Tabel Database** | `penggajian`, `pegawai`, `jabatan`. |
| **Middleware & Permission** | - `PATCH /api/payrolls/:id/status`: Terproteksi `authenticateToken` + `restrictTo('admin')`.<br>- Rute lainnya di berkas [penggajian.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/penggajian/penggajian.routes.ts): **Publik / Tidak terproteksi**[^5] (tidak menggunakan `authenticateToken`). |
| **Dependensi Modul** | `pegawai` (mengambil payrollInfo dasar dan persentase kehadiran absensi). |
| **Status Testing** | Tidak ada pengujian otomatis. |
| **Tingkat Risiko** | **TINGGI** (Sangat sensitif karena mengelola dana keluar, komponen gaji, dan slip transfer). |

[^5]: Klaim serupa ditemukan di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian Penggajian) menyatakan rute terproteksi. Namun, setelah ditinjau langsung di kode rute, proteksi autentikasi hanya terpasang di endpoint pembaruan status (`PATCH /:id/status`). Rute lain seperti posting payroll run bersifat publik. **TERVERIFIKASI BERBEDA** dengan kode aktual.

---

### 6. Modul: kontrak (Kontrak & Riwayat Jabatan)

| Parameter | Keterangan / Hasil Investigasi |
| :--- | :--- |
| **Tujuan Bisnis** | Mengelola dokumen masa kerja karyawan (PKWT/PKWTT), pengunggahan berkas kontrak kerja, monitoring pengingat tanggal kadaluwarsa kontrak, serta riwayat mutasi jabatan karyawan. |
| **Route / Endpoint** | - `GET /api/contracts`<br>- `GET /api/contracts/expiring`<br>- `GET /api/contracts/employee/:employeeId`<br>- `GET /api/contracts/:id`<br>- `POST /api/contracts`<br>- `PUT /api/contracts/:id`<br>- `DELETE /api/contracts/:id`<br>- `GET /api/contracts/job-history/employee/:id`<br>- `POST /api/contracts/job-history/employee/:id` |
| **Controller & Service** | - Controller: [kontrak.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kontrak/kontrak.controller.ts)<br>- Service: [kontrak.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kontrak/kontrak.service.ts)<br>- Repository: [kontrak.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kontrak/kontrak.repository.ts), [riwayatJabatan.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kontrak/riwayatJabatan.repository.ts)<br>- Model: [kontrak.model.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kontrak/kontrak.model.ts), [riwayatJabatan.model.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kontrak/riwayatJabatan.model.ts) |
| **Tabel Database** | `kontrak`, `riwayat_jabatan`, `pegawai` (mengupdate jabatan_id & position saat mutasi). |
| **Middleware & Permission** | Seluruh rute pada berkas [kontrak.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kontrak/kontrak.routes.ts): **Publik / Tidak terproteksi**[^6] (tidak ada `authenticateToken`). |
| **Dependensi Modul** | `pegawai` (verifikasi data karyawan penerima kontrak). |
| **Status Testing** | Tidak ada pengujian otomatis. |
| **Tingkat Risiko** | **TINGGI** (Menyentuh berkas legalitas kepegawaian dan detail mutasi karier). |

[^6]: Klaim serupa ditemukan di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian Kontrak) menyatakan rute terproteksi. Namun, aktualnya tidak ada auth middleware pada rute kontrak. **TERVERIFIKASI BERBEDA** dengan kode aktual.

---

### 7. Modul: permintaanPerubahanData (Persetujuan Data Mandiri)

| Parameter | Keterangan / Hasil Investigasi |
| :--- | :--- |
| **Tujuan Bisnis** | Menampung usulan perubahan data pribadi yang diisi secara mandiri oleh pegawai sebelum akhirnya ditinjau dan disetujui/ditolak oleh admin. |
| **Route / Endpoint** | - `POST /api/data-change-requests` (Pegawai)<br>- `GET /api/data-change-requests` (Admin)<br>- `PATCH /api/data-change-requests/:id/handle` (Admin) |
| **Controller & Service** | - Controller: [permintaanPerubahanData.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/permintaanPerubahanData/permintaanPerubahanData.controller.ts)<br>- Service: [permintaanPerubahanData.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/permintaanPerubahanData/permintaanPerubahanData.service.ts)<br>- Repository: [permintaanPerubahanData.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/permintaanPerubahanData/permintaanPerubahanData.repository.ts)<br>- Model: [permintaanPerubahanData.model.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/permintaanPerubahanData/permintaanPerubahanData.model.ts) |
| **Tabel Database** | `data_change_requests`, `pegawai` (dimodifikasi jika usulan disetujui). |
| **Middleware & Permission** | - Menggunakan `authenticateToken` untuk semua rute.<br>- Submit request: `restrictTo('employee')`.<br>- Read & handle request: `restrictTo('admin')`. |
| **Dependensi Modul** | `pegawai` (menerapkan perubahan data), `notifikasi` (kirim notifikasi ke admin). |
| **Status Testing** | Tidak ada pengujian otomatis. |
| **Tingkat Risiko** | **TINGGI** (Akses untuk memodifikasi record master data pegawai secara langsung). |
| **Catatan Kaki** | Rute dan otentikasi di berkas [permintaanPerubahanData.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/permintaanPerubahanData/permintaanPerubahanData.routes.ts) **TERVERIFIKASI SAMA** dengan klaim di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md). |

---

### 8. Modul: kredit-berkas (Pengajuan Kredit Nasabah)

| Parameter | Keterangan / Hasil Investigasi |
| :--- | :--- |
| **Tujuan Bisnis** | Alur pencatatan pengajuan berkas pinjaman/kredit nasabah, pelacakan riwayat mutasi tahap verifikasi oleh staf verifikator, serta pengiriman log logistik status via WhatsApp Gateway. |
| **Route / Endpoint** | - `POST /api/kredit-berkas`<br>- `GET /api/kredit-berkas`<br>- `GET /api/kredit-berkas/pending`<br>- `GET /api/kredit-berkas/monitoring`<br>- `GET /api/kredit-berkas/:id`<br>- `GET /api/kredit-berkas/:id/wa-log`<br>- `PUT /api/kredit-berkas/:id/process`<br>- `POST /api/kredit-berkas/wa-resend/:logId` |
| **Controller & Service** | - Controller: [kredit-berkas.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kredit-berkas/kredit-berkas.controller.ts)<br>- Service: [kredit-berkas.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kredit-berkas/kredit-berkas.service.ts), [kredit-wa-notification.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kredit-berkas/kredit-wa-notification.service.ts)<br>- Repository: [kredit-berkas.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kredit-berkas/kredit-berkas.repository.ts) |
| **Tabel Database** | `kredit_berkas`, `kredit_berkas_tracking`, `wa_notification_log`. |
| **Middleware & Permission** | Menggunakan `authenticateToken` untuk semua rute. Tidak ada batasan `restrictTo` (semua akun ber-token aktif diizinkan mengelola). |
| **Dependensi Modul** | `notifikasi` (menulis entri log notifikasi WA). |
| **Status Testing** | Tidak ada pengujian otomatis. |
| **Tingkat Risiko** | **TINGGI** (Menyentuh berkas keuangan, nama nasabah, nominal kredit, dan persetujuan pencairan). |
| **Catatan Kaki** | Modul kredit-berkas tidak terdaftar dalam modul standar di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) atau [docs/FINAL_IMPLEMENTATION_STATUS.md](file:///opt/portal-sdmv3/docs/FINAL_IMPLEMENTATION_STATUS.md), melainkan merupakan modul tambahan yang terverifikasi aktif di kode. **TERVERIFIKASI BERBEDA**.

---

### 9. Modul: backup (Cadangan Sistem)

| Parameter | Keterangan / Hasil Investigasi |
| :--- | :--- |
| **Tujuan Bisnis** | Membuat berkas cadangan database SQLite (`.sqlite`), memulihkan kondisi database dari daftar cadangan yang ada, melihat daftar berkas cadangan, serta mengunduhnya langsung. |
| **Route / Endpoint** | - `GET /api/backup/list`<br>- `POST /api/backup/backup`<br>- `POST /api/backup/restore`<br>- `GET /api/backup/download/:filename` |
| **Controller & Service** | - Controller: [backup.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/backup/backup.controller.ts)<br>- Service: [backup.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/backup/backup.service.ts) |
| **Tabel Database** | Tidak ada tabel khusus (melakukan operasi file salin/timpa langsung terhadap `database.sqlite` pada disk server). |
| **Middleware & Permission** | Seluruh rute pada berkas [backup.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/backup/backup.routes.ts): **Publik / Tidak terproteksi**[^7] (tidak menggunakan `authenticateToken`). |
| **Dependensi Modul** | Tidak ada. |
| **Status Testing** | Tidak ada pengujian otomatis. |
| **Tingkat Risiko** | **TINGGI** (Bahaya luar biasa jika diakses publik; penyerang dapat menghapus/mengunduh seluruh database secara instan). |

[^7]: Klaim serupa ditemukan di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian Backup) menyatakan rute terproteksi JWT untuk level Administrator. Namun, kenyataannya berkas rute sama sekali tidak memanggil middleware autentikasi. **TERVERIFIKASI BERBEDA** dengan kode aktual.

---

### 10. Modul: integration (Konsumsi Pihak Ketiga)

| Parameter | Keterangan / Hasil Investigasi |
| :--- | :--- |
| **Tujuan Bisnis** | Menyediakan jembatan pertukaran data (inbound/outbound) dengan sistem eksternal untuk sinkronisasi data pegawai, kehadiran, cuti, serta posting data absensi dan aktivitas harian. |
| **Route / Endpoint** | - `GET /api/integrations/employees`<br>- `GET /api/integrations/attendance`<br>- `GET /api/integrations/leaves`<br>- `POST /api/integrations/attendance`<br>- `POST /api/integrations/daily-activities` |
| **Controller & Service** | - Controller: [integration.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/integration/integration.controller.ts)<br>- Service: [integration.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/integration/integration.service.ts) |
| **Tabel Database** | `api_keys`, `integration_logs`, `pegawai`, `absensi`, `permintaan_cuti`, `log_aktivitas_harian`, `activity_library`. |
| **Middleware & Permission** | Menggunakan `apiKeyMiddleware` untuk semua rute. Memvalidasi kecocokan token API Key yang terdaftar pada tabel `api_keys`. Tidak menggunakan JWT. |
| **Dependensi Modul** | `pegawai`, `absensi`, `cuti`, `log-aktivitas-harian`. |
| **Status Testing** | Tidak ada pengujian otomatis. |
| **Tingkat Risiko** | **TINGGI** (Gerbang masuk/keluar data otomatis dari luar sistem). |
| **Catatan Kaki** | Rute dan proteksi integrasi berbasis API Key **TERVERIFIKASI SAMA** dengan spesifikasi yang tertulis pada [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian 24).

---

### 11. Modul: laporan (Laporan Operasional & Analitik)

| Parameter | Keterangan / Hasil Investigasi |
| :--- | :--- |
| **Tujuan Bisnis** | Rekapitulasi laporan agregat berkala untuk seluruh modul bisnis HRMS, tren turnover, laporan demografi, serta mesin generator laporan kustom (Custom Report Builder) yang fleksibel. |
| **Route / Endpoint** | - Laporan: `GET /api/reports/employees`, `/api/reports/attendance`, `/api/reports/payroll`, `/api/reports/leave`, `/api/reports/performance`, `/api/reports/turnover`, `/api/reports/demographics`<br>- Analitik: `/employees/comprehensive`, `/attendance/analytics`, `/payroll/analytics`<br>- Ekspor: `/employees/export`, `/attendance/export`, `/payroll/export`, `/leave/export`, `/performance/export`<br>- Kustom: `GET /api/reports/custom/metadata`, `POST /api/reports/custom/generate`, `POST /api/reports/custom/export` |
| **Controller & Service** | - Controller: [laporan.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/laporan/laporan.controller.ts), [custom-report.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/laporan/custom-report.controller.ts)<br>- Service: [laporan.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/laporan/laporan.service.ts), [custom-report.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/laporan/custom-report.service.ts)<br>- Repository: [laporan.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/laporan/laporan.repository.ts) |
| **Tabel Database** | `pegawai`, `absensi`, `permintaan_cuti`, `penggajian`, `penilaian_kinerja`, `jabatan`. |
| **Middleware & Permission** | Seluruh rute pada berkas [laporan.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/laporan/laporan.routes.ts) dan [custom-report.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/laporan/custom-report.routes.ts): **Publik / Tidak terproteksi**[^8]. |
| **Dependensi Modul** | `pegawai`, `absensi`, `cuti`, `penggajian`, `kinerja`, `jabatan`. |
| **Status Testing** | Tidak ada pengujian otomatis. |
| **Tingkat Risiko** | **TINGGI** (Akses pembacaan data massal seluruh pegawai secara publik tanpa token). |

[^8]: Klaim di [docs/FINAL_IMPLEMENTATION_STATUS.md](file:///opt/portal-sdmv3/docs/FINAL_IMPLEMENTATION_STATUS.md) menyatakan modul laporan memiliki sistem pembatasan akses berbasis peran (*role-based access control*). Kenyataannya, berkas rute laporan sama sekali tidak memasang middleware pembatasan akses. **TERVERIFIKASI BERBEDA** dengan kode aktual.

---

### 12. Modul: arsip-dokumen (Arsip Elektronik)

| Parameter | Keterangan / Hasil Investigasi |
| :--- | :--- |
| **Tujuan Bisnis** | Penyimpanan berkas arsip elektronik kantor, klasifikasi tingkat kerahasiaan dokumen (Confidential/Secret), pelacakan tanggal kadaluwarsa berkas, dan grafik statistik. |
| **Route / Endpoint** | - `GET /api/arsip-dokumen`<br>- `GET /api/arsip-dokumen/stats`<br>- `GET /api/arsip-dokumen/expiring`<br>- `GET /api/arsip-dokumen/:id`<br>- `POST /api/arsip-dokumen`<br>- `PUT /api/arsip-dokumen/:id`<br>- `DELETE /api/arsip-dokumen/:id` |
| **Controller & Service** | - Controller: [arsip-dokumen.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/arsip-dokumen/arsip-dokumen.controller.ts)<br>- Service: [arsip-dokumen.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/arsip-dokumen/arsip-dokumen.service.ts)<br>- Repository: [arsip-dokumen.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/arsip-dokumen/arsip-dokumen.repository.ts)<br>- Model: [arsip-dokumen.model.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/arsip-dokumen/arsip-dokumen.model.ts) |
| **Tabel Database** | `arsip_dokumen`. |
| **Middleware & Permission** | - Menggunakan `authenticateToken` untuk seluruh rute.<br>- Post/Put/Delete: Terproteksi `restrictTo('admin', 'pimpinan', 'supervisor')`. |
| **Dependensi Modul** | `pegawai` (untuk merekam informasi pengunggah berkas). |
| **Status Testing** | Tidak ada pengujian otomatis. |
| **Tingkat Risiko** | **TINGGI** (Menyentuh berkas rahasia/dokumen penting kantor). |
| **Catatan Kaki** | Modul arsip-dokumen tidak dideklarasikan pada [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) tetapi terverifikasi aktif di rute backend. **TERVERIFIKASI BERBEDA**.

---
---

## ⚠️ MODUL DENGAN TINGKAT RISIKO: SEDANG

Modul-modul ini mengelola evaluasi kinerja, koordinasi siklus penilaian, target KPI individu, manajemen beban kerja harian, struktur hirarki organisasi, penugasan tugas operasional, rekrutmen kandidat pelamar, log audit, atau pengaturan umum kantor.

### 13. Modul: kinerja (Penilaian Kinerja)

* **Tujuan Bisnis**: Proses pengisian evaluasi kinerja karyawan berkala, pengisian evaluasi mandiri (*self-assessment*), pencatatan *feedback* atasan, dan transisi tahapan status evaluasi (*workflow*).
* **Route / Endpoint**: 
  - `GET /api/performance-reviews`
  - `GET /api/performance-reviews/employee/:id`
  - `GET /api/performance-reviews/:id`
  - `POST /api/performance-reviews`
  - `PUT /api/performance-reviews/:id`
  - `PUT /api/performance-reviews/:id/feedback`
  - `PUT /api/performance-reviews/:id/self-assessment`
  - `PUT /api/performance-reviews/:id/transition`
  - `DELETE /api/performance-reviews/:id`
* **Controller & Service**: [kinerja.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kinerja/kinerja.controller.ts), [kinerja.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kinerja/kinerja.service.ts), [penilaianKinerja.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kinerja/penilaianKinerja.repository.ts), [penilaianKinerja.model.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kinerja/penilaianKinerja.model.ts)
* **Tabel Database**: `penilaian_kinerja`, `pegawai`, `jabatan`.
* **Middleware & Permission**: 
  - `authenticateToken` aktif untuk semua rute.
  - CRUD & Transition: Terproteksi `restrictTo('admin', 'pimpinan', 'supervisor')` (via `MANAGER_ROLES`).
  - Read employee review: `restrictTo('admin', 'pimpinan', 'supervisor', 'employee')` + custom middleware `ensureEmployeeReviewScope`.
  - Feedback & Self-assessment: `restrictTo('admin', 'pimpinan', 'supervisor', 'employee')` + custom middleware `ensureOwnedReviewAccess`.
* **Dependensi Modul**: `pegawai` (relasi penilai & yang dinilai), `jabatan` (validasi kepangkatan).
* **Status Testing**: Tidak ada pengujian otomatis.
* **Risk Level**: **SEDANG** (Akses penilaian kerja internal).
* **Catatan Kaki**: Rute dan middleware penilaian kinerja **TERVERIFIKASI SAMA** dengan klaim deskripsi di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian 7).

---

### 14. Modul: kpi (Manajemen Target & Template KPI)

* **Tujuan Bisnis**: Penentuan target KPI pegawai, rebalancing bobot KPI, pembuatan target otomatis berdasarkan Analisis Beban Kerja (ABK), sinkronisasi nilai aktual dari WLA, pengunggahan bukti realisasi (*evidence*), serta penerapan template KPI departemen secara massal.
* **Route / Endpoint**: 
  - Targets: `GET /api/kpi-targets`, `/api/kpi-targets/summary`, `/api/kpi-targets/monitoring-summary`, `/api/kpi-targets/employee/:employeeId`, `/api/kpi-targets/:id`
  - Actions: `POST /api/kpi-targets`, `/api/kpi-targets/generate-from-abk`, `/api/kpi-targets/rebalance`, `/api/kpi-targets/sync-wla`
  - Updates: `PUT /api/kpi-targets/:id`, `/api/kpi-targets/:id/actual`, `/api/kpi-targets/:id/evidence`
  - Templates: `GET /api/kpi-templates`, `POST /api/kpi-templates/apply`
* **Controller & Service**: [kpi.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kpi/kpi.controller.ts), [kpi.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kpi/kpi.service.ts), [kpi-nominal-target.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kpi/kpi-nominal-target.service.ts), [kpi.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kpi/kpi.repository.ts)
* **Tabel Database**: `kpi_targets`, `kpi_nominal_targets`, `kpi_templates`, `pegawai`, `jabatan`, `activity_library`, `log_aktivitas_harian`.
* **Middleware & Permission**: 
  - `kpi.routes.ts`: `authenticateToken` untuk semua. Write & actions terproteksi `restrictTo('admin', 'pimpinan', 'supervisor')`. Rute `/sync-wla` dan `/:id/actual` dapat diakses oleh `employee`.
  - `kpiTemplate.routes.ts`: **Publik / Tidak terproteksi**[^9] (tidak memanggil `authenticateToken` pada berkas router).
* **Dependensi Modul**: `pegawai`, `workload` (ABK), `activity-library`.
* **Status Testing**: Tidak ada pengujian otomatis.
* **Risk Level**: **SEDANG** (Evaluasi pencapaian kerja pegawai).

[^9]: Klaim di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian 8) menyatakan modifikasi template KPI dibatasi bagi role manajerial dengan token JWT. Kenyataannya, berkas rute kpiTemplate tidak dibungkus middleware autentikasi. **TERVERIFIKASI BERBEDA** dengan kode aktual.

---

### 15. Modul: performance-management (Orkestrasi Periode Kinerja)

* **Tujuan Bisnis**: Orkestrator tingkat tinggi (batch operations) untuk membuka periode evaluasi kinerja baru, melakukan sinkronisasi data WLA ke KPI target secara massal, membuat record draf penilaian kinerja pegawai secara otomatis, serta mengunci (finalisasi) periode kinerja.
* **Route / Endpoint**: 
  - `POST /api/performance-cycle/open`
  - `POST /api/performance-cycle/sync-kpi`
  - `POST /api/performance-cycle/create-reviews`
  - `POST /api/performance-cycle/finalize`
* **Controller & Service**: [performance-cycle.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/performance-management/orchestration/performance-cycle.controller.ts), [performance-cycle.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/performance-management/orchestration/performance-cycle.service.ts)
* **Tabel Database**: Tidak mengelola tabel mandiri. Melakukan modifikasi data koordinatif pada tabel `penilaian_kinerja`, `kpi_targets`, `log_aktivitas_harian`, `pegawai`.
* **Middleware & Permission**: `authenticateToken` dan `restrictTo('admin', 'pimpinan', 'supervisor')` diaktifkan di tingkat teratas router file untuk semua endpoint.
* **Dependensi Modul**: `kinerja`, `kpi`, `workload`, `pegawai`.
* **Status Testing**: **Memiliki Integration Test** pada berkas [tests/performance-cycle.integration.ts](file:///opt/portal-sdmv3/apps/backend/tests/performance-cycle.integration.ts).
* **Risk Level**: **SEDANG** (Mempengaruhi status siklus performa tahunan/semesteran seluruh pegawai).
* **Catatan Kaki**: Mekanisme koordinasi siklus ini **TERVERIFIKASI SAMA** dengan penjelasan di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian 9).

---

### 16. Modul: workload (Analisis Beban Kerja - WLA)

* **Tujuan Bisnis**: Pengisian rincian target beban kerja tahunan pegawai (WLA), penyimpanan draf beban kerja, penyerahan usulan beban kerja ke atasan, dan persetujuan (approval) usulan oleh supervisor/admin.
* **Route / Endpoint**: 
  - `GET /api/workload/:employeeId`
  - `POST /api/workload`
  - `PUT /api/workload/:id/submit`
  - `PUT /api/workload/:id/approve`
* **Controller & Service**: [workload.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/workload/workload.controller.ts), [workload.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/workload/workload.service.ts), [workload.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/workload/workload.repository.ts)
* **Tabel Database**: `analisis_beban_kerja`, `detail_beban_kerja`.
* **Middleware & Permission**: 
  - `authenticateToken` diaktifkan untuk seluruh rute.
  - Submit & Approve WLA: Terproteksi `restrictTo('admin', 'pimpinan', 'supervisor')`.
  - Read & Save draft: Terbuka untuk semua user ber-token (termasuk `employee`).
* **Dependensi Modul**: `pegawai` (mengidentifikasi pemilik beban kerja).
* **Status Testing**: Tidak ada pengujian otomatis.
* **Risk Level**: **SEDANG** (Mengatur proporsi tugas dan beban kerja staf).
* **Catatan Kaki**: Rute dan otentikasi WLA **TERVERIFIKASI SAMA** dengan deskripsi di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian 16).

---

### 17. Modul: jabatan (Hirarki Jabatan)

* **Tujuan Bisnis**: Pemetaan pohon organisasi (organization tree), pembagian tingkat jabatan (level), pembuatan detail jabatan baru, mutasi atasan/bawahan langsung, dan pelacakan bawahan langsung (*subordinates*).
* **Route / Endpoint**: 
  - `GET /api/jabatan/tree`
  - `GET /api/jabatan/tree-with-employees`
  - `GET /api/jabatan/level/:level`
  - `GET /api/jabatan/subordinates/:pegawaiId`
  - `GET /api/jabatan`
  - `GET /api/jabatan/:id`
  - `POST /api/jabatan`
  - `PUT /api/jabatan/:id`
  - `DELETE /api/jabatan/:id`
* **Controller & Service**: [jabatan.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/jabatan/jabatan.controller.ts), [jabatan.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/jabatan/jabatan.service.ts), [jabatan.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/jabatan/jabatan.repository.ts)
* **Tabel Database**: `jabatan`, `pegawai`.
* **Middleware & Permission**: Seluruh rute pada berkas [jabatan.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/jabatan/jabatan.routes.ts): **Publik / Tidak terproteksi**[^10] (tidak menggunakan `authenticateToken`).
* **Dependensi Modul**: `pegawai` (menemukan data bawahan berdasarkan atasan_id).
* **Status Testing**: Tidak ada pengujian otomatis.
* **Risk Level**: **SEDANG** (Struktur organisasi menentukan alur persetujuan surat/cuti/kinerja).

[^10]: Klaim di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian 10) menyatakan modul jabatan digunakan untuk reporting line & approval. Namun, endpoint perubahan data organisasi tidak memiliki pengaman rute. **TERVERIFIKASI BERBEDA** dengan kode aktual.

---

### 18. Modul: log-aktivitas-harian (Timesheet Harian)

* **Tujuan Bisnis**: Pengisian rincian logs aktivitas pekerjaan harian karyawan baik secara eceran maupun massal (*bulk*), rekap laporan log harian, pemantauan ringkasan oleh admin, dan verifikasi/persetujuan logs aktivitas oleh atasan.
* **Route / Endpoint**: 
  - `POST /api/log-aktivitas-harian`
  - `POST /api/log-aktivitas-harian/bulk`
  - `GET /api/log-aktivitas-harian/my-logs`
  - `GET /api/log-aktivitas-harian/summary`
  - `GET /api/log-aktivitas-harian/admin/summary`
  - `GET /api/log-aktivitas-harian/admin/logs`
  - `PUT /api/log-aktivitas-harian/:id/status`
* **Controller & Service**: [log-aktivitas-harian.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/log-aktivitas-harian/log-aktivitas-harian.controller.ts), [log-aktivitas-harian.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/log-aktivitas-harian/log-aktivitas-harian.service.ts), [log-aktivitas-harian.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/log-aktivitas-harian/log-aktivitas-harian.repository.ts)
* **Tabel Database**: `log_aktivitas_harian`, `pegawai`, `jabatan`, `activity_library`.
* **Middleware & Permission**: 
  - `authenticateToken` wajib untuk seluruh rute.
  - Admin/Supervisor endpoints (`/admin/summary`, `/admin/logs`, `/:id/status`): Terproteksi `restrictTo('admin', 'pimpinan', 'supervisor')`.
  - Pegawai endpoints: Terbuka untuk semua user ber-token.
* **Dependensi Modul**: `pegawai` (verifikasi bawahan), `activity-library` (untuk mencocokkan id aktivitas acuan).
* **Status Testing**: Tidak ada pengujian otomatis.
* **Risk Level**: **SEDANG** (Data logs aktivitas harian disinkronkan ke nilai aktual KPI).
* **Catatan Kaki**: Rute dan batasan role pada timesheet harian **TERVERIFIKASI SAMA** dengan klaim deskripsi di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian 17).

---

### 19. Modul: task (Penugasan Operasional)

* **Tujuan Bisnis**: Penugasan tugas operasional harian secara instan dari supervisor ke staf, pembaruan status pengerjaan tugas oleh bawahan (To Do, In Progress, Done), dan pelacakan riwayat pengerjaan tugas.
* **Route / Endpoint**: 
  - `POST /api/tasks`
  - `GET /api/tasks/supervisor/:supervisor_id`
  - `GET /api/tasks/employee/:employee_id`
  - `PUT /api/tasks/:id/status`
  - `DELETE /api/tasks/:id`
* **Controller & Service**: [task.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/task/task.controller.ts), [task.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/task/task.service.ts), [task.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/task/task.repository.ts)
* **Tabel Database**: `assigned_tasks`, `pegawai`.
* **Middleware & Permission**: 
  - `authenticateToken` wajib untuk semua rute.
  - Create & Delete task: `restrictTo('admin', 'pimpinan', 'supervisor')` + custom middleware `ensureTaskCreateScope`/`ensureTaskDeleteScope`.
  - Get supervisor tasks: `restrictTo('admin', 'pimpinan', 'supervisor')` + `ensureSupervisorScope`.
  - Get employee tasks & Update status: `restrictTo('admin', 'pimpinan', 'supervisor', 'employee')` + `ensureEmployeeScope`/`ensureTaskStatusScope`.
* **Dependensi Modul**: `pegawai` (untuk validasi relasi kepengawasan atasan-bawahan).
* **Status Testing**: Tidak ada pengujian otomatis.
* **Risk Level**: **SEDANG** (Mengatur instruksi penugasan kerja harian).
* **Catatan Kaki**: Rute dan validasi batas wewenang (*scope guard*) **TERVERIFIKASI SAMA** dengan klaim di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian 15).

---

### 20. Modul: perekrutan (Kandidat Pelamar)

* **Tujuan Bisnis**: Pendaftaran data kandidat pelamar pekerjaan, posisi yang dilamar, pelacakan tahapan status lamaran (applied, interview, rejected, hired), dan kontak pelamar.
* **Route / Endpoint**: 
  - `GET /api/recruitment/candidates`
  - `GET /api/recruitment/candidates/:id`
  - `POST /api/recruitment/candidates`
  - `PUT /api/recruitment/candidates/:id`
  - `DELETE /api/recruitment/candidates/:id`
* **Controller & Service**: [perekrutan.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/perekrutan/perekrutan.controller.ts), [perekrutan.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/perekrutan/perekrutan.service.ts), [kandidat.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/perekrutan/kandidat.repository.ts), [kandidat.model.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/perekrutan/kandidat.model.ts)
* **Tabel Database**: `kandidat`.
* **Middleware & Permission**: Seluruh rute pada berkas [perekrutan.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/perekrutan/perekrutan.routes.ts): **Publik / Tidak terproteksi**[^11] (tidak menggunakan `authenticateToken`).
* **Dependensi Modul**: Tidak ada.
* **Status Testing**: Tidak ada pengujian otomatis.
* **Risk Level**: **SEDANG** (Menampung data pribadi kandidat luar).

[^11]: Klaim di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian 13) menyatakan modul rekrutmen selesai dibangun untuk kelola kandidat. Namun, tidak ada middleware JWT terpasang di rutenya. **TERVERIFIKASI BERBEDA** dengan kode aktual.

---

### 21. Modul: company-settings (Pengaturan Profil Perusahaan)

* **Tujuan Bisnis**: Membaca profil dasar perusahaan (BPR Bapera Batang), alamat, kontak resmi, mengunggah file logo instansi, serta inisialisasi awal bobot kpi organisasi.
* **Route / Endpoint**: 
  - `GET /api/company-settings`
  - `PUT /api/company-settings`
* **Controller & Service**: [company-settings.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/company-settings/company-settings.controller.ts), [company-settings.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/company-settings/company-settings.service.ts), [company-settings.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/company-settings/company-settings.repository.ts), [company-settings.model.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/company-settings/company-settings.model.ts)
* **Tabel Database**: `company_settings`.
* **Middleware & Permission**: Seluruh rute pada berkas [company-settings.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/company-settings/company-settings.routes.ts): **Publik / Tidak terproteksi**[^12] (tidak menggunakan `authenticateToken`).
* **Dependensi Modul**: Tidak ada.
* **Status Testing**: Tidak ada pengujian otomatis.
* **Risk Level**: **SEDANG** (Mengubah informasi publik profil instansi BPR).

[^12]: Klaim di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian 21) menyatakan profil perusahaan dikelola dengan otentikasi. Kenyataannya, berkas rute tidak memasang middleware autentikasi. **TERVERIFIKASI BERBEDA** dengan kode aktual.

---

### 22. Modul: notifikasi (Sistem Notifikasi & Pengingat)

* **Tujuan Bisnis**: Inbox notifikasi aplikasi internal karyawan (pesan dibaca/belum dibaca), penjadwalan notifikasi mendatang, serta pemicu jobs berkala (melalui scheduler internal) untuk pengiriman notifikasi pengingat otomatis (ulang tahun, kontrak habis, pengajuan cuti, rilis payroll).
* **Route / Endpoint**: 
  - In-app: `GET /api/notifikasi/employee/:employeeId`, `GET /api/notifikasi/employee/:employeeId/unread`, `POST /api/notifikasi/employee/:employeeId`, `PUT /api/notifikasi/:notificationId/read`, `GET /api/notifikasi/scheduled`
  - Automated: `POST /api/notifikasi/automated/contracts/expiring`, `/leave/approvals`, `/payroll/releases`, `/performance/reviews`, `/birthdays`, `/all`
* **Controller & Service**: [notifikasi.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/notifikasi/notifikasi.controller.ts), [notifikasi.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/notifikasi/notifikasi.service.ts), [pengingat.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/notifikasi/pengingat.service.ts), [pengingat.otomatis.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/notifikasi/pengingat.otomatis.service.ts), [pengingat.otomatis.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/notifikasi/pengingat.otomatis.controller.ts), [notifikasi.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/notifikasi/notifikasi.repository.ts)
* **Tabel Database**: `notifications`.
* **Middleware & Permission**: Seluruh rute pada berkas [notifikasi.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/notifikasi/notifikasi.routes.ts) dan pengingat otomatis: **Publik / Tidak terproteksi**[^13].
* **Dependensi Modul**: `pegawai`, `cuti`, `kontrak`, `penggajian`, `kinerja`.
* **Status Testing**: Tidak ada pengujian otomatis.
* **Risk Level**: **SEDANG** (Pengiriman notifikasi massal internal).

[^13]: Klaim di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian 18) menyatakan sistem notifikasi dan scheduler dilindungi otentikasi. Kenyataannya, berkas rute tidak memiliki middleware pembatasan akses. **TERVERIFIKASI BERBEDA** dengan kode aktual.

---

### 23. Modul: audit-log (Jejak Aktivitas Sistem)

* **Tujuan Bisnis**: Mencatat rekam jejak aktivitas penting yang dilakukan oleh pengguna sistem (operasi tulis/modifikasi data) demi keperluan audit kepatuhan, menyertakan alamat IP, detail agen pengguna (browser), dan tipe perangkat.
* **Route / Endpoint**: 
  - `GET /api/audit-logs`
  - `POST /api/audit-logs`
* **Controller & Service**: [audit-log.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/audit-log/audit-log.controller.ts), [audit-log.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/audit-log/audit-log.service.ts), [audit-log.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/audit-log/audit-log.repository.ts), [audit-log.model.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/audit-log/audit-log.model.ts)
* **Tabel Database**: `audit_logs`.
* **Middleware & Permission**: 
  - `authenticateToken` wajib untuk seluruh rute.
  - Read & Write: Terproteksi `restrictTo('admin', 'pimpinan')`.
* **Dependensi Modul**: Tidak ada.
* **Status Testing**: Tidak ada pengujian otomatis.
* **Risk Level**: **SEDANG** (Informasi riwayat operasional administrator).
* **Catatan Kaki**: Rute dan batasan role admin **TERVERIFIKASI SAMA** dengan deskripsi pada [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian 23).

---
---

## 🟢 MODUL DENGAN TINGKAT RISIKO: RENDAH

Modul-modul ini mengelola data pustaka acuan kerja, penanggalan hari libur nasional, orientasi tugas karyawan baru, data riwayat sertifikat pelatihan, dasbor data agregat, serta log versi komit (*changelog*).

### 24. Modul: activity-library (Perpustakaan Aktivitas)

* **Tujuan Bisnis**: Menyediakan pustaka nama aktivitas kantor standar yang dipetakan per jabatan untuk mempermudah pegawai saat menyusun logs harian mereka.
* **Route / Endpoint**: 
  - `GET /api/activity-library`
  - `GET /api/activity-library/positions`
  - `GET /api/activity-library/position/:position`
  - `GET /api/activity-library/:id`
  - `POST /api/activity-library`
  - `PUT /api/activity-library/:id`
  - `DELETE /api/activity-library/:id`
* **Controller & Service**: [activity-library.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/activity-library/activity-library.controller.ts), [activity-library.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/activity-library/activity-library.service.ts), [activity-library.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/activity-library/activity-library.repository.ts)
* **Tabel Database**: `activity_library`.
* **Middleware & Permission**: 
  - `authenticateToken` wajib untuk semua rute.
  - Write (Post, Put, Delete): Terproteksi `restrictTo('admin', 'pimpinan')`.
  - Read (Get): Terbuka bagi seluruh user ber-token (termasuk `employee`).
* **Dependensi Modul**: Tidak ada.
* **Status Testing**: Tidak ada pengujian otomatis.
* **Risk Level**: **RENDAH** (Hanya data pustaka acuan teks aktivitas).
* **Catatan Kaki**: Rute dan middleware pustaka aktivitas **TERVERIFIKASI SAMA** dengan deskripsi pada [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian 22).

---

### 25. Modul: holidays (Kalender Hari Libur)

* **Tujuan Bisnis**: Menyimpan hari libur resmi nasional kantor untuk mengecualikan hari tersebut dari rekapitulasi kehadiran log absensi harian dan cuti.
* **Route / Endpoint**: 
  - `GET /api/holidays`
  - `POST /api/holidays`
  - `PUT /api/holidays/:id`
  - `DELETE /api/holidays/:id`
* **Controller & Service**: [holidays.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/holidays/holidays.controller.ts), [holidays.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/holidays/holidays.repository.ts), [holidays.model.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/holidays/holidays.model.ts)
* **Tabel Database**: `holidays`.
* **Middleware & Permission**: 
  - `authenticateToken` wajib untuk semua rute.
  - Write (Post, Put, Delete): Terproteksi `restrictTo('admin', 'pimpinan')`.
  - Read: Terbuka untuk seluruh user ber-token.
* **Dependensi Modul**: Tidak ada.
* **Status Testing**: Tidak ada pengujian otomatis.
* **Risk Level**: **RENDAH** (Hanya penanggalan hari libur).
* **Catatan Kaki**: Modul kalender hari libur tidak terdaftar di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) karena merupakan rute tambahan baru. Namun, rutenya terverifikasi aktif di kode. **TERVERIFIKASI BERBEDA**.

---

### 26. Modul: orientasi (Tugas Orientasi Pegawai Baru)

* **Tujuan Bisnis**: Menyusun daftar checklist tugas pengenalan lingkungan kantor (onboarding) bagi pegawai baru beserta status kemajuannya.
* **Route / Endpoint**: 
  - `GET /api/onboarding/employee/:employeeId/tasks`
  - `POST /api/onboarding/employee/:employeeId/tasks`
  - `PUT /api/onboarding/tasks/:taskId`
  - `DELETE /api/onboarding/tasks/:taskId`
* **Controller & Service**: [orientasi.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/orientasi/orientasi.controller.ts), [orientasi.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/orientasi/orientasi.service.ts), [tugasOrientasi.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/orientasi/tugasOrientasi.repository.ts), [tugasOrientasi.model.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/orientasi/tugasOrientasi.model.ts)
* **Tabel Database**: `tugas_orientasi`.
* **Middleware & Permission**: Seluruh rute pada berkas [orientasi.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/orientasi/orientasi.routes.ts): **Publik / Tidak terproteksi**[^14] (tidak menggunakan `authenticateToken`).
* **Dependensi Modul**: `pegawai` (mengidentifikasi pegawai baru penerima checklist).
* **Status Testing**: Tidak ada pengujian otomatis.
* **Risk Level**: **RENDAH** (Daftar checklist perkenalan staf baru).

[^14]: Klaim di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian 14) menyatakan modul orientasi membatasi rute tulis bagi supervisor. Kenyataannya, berkas rute tidak memasang middleware autentikasi. **TERVERIFIKASI BERBEDA** dengan kode aktual.

---

### 27. Modul: pelatihan (Riwayat Pelatihan Pegawai)

* **Tujuan Bisnis**: Pencatatan keikutsertaan pelatihan, webinar, seminar karyawan, penyelenggara acara, tanggal pelaksanaan, serta upload dokumen scan sertifikat.
* **Route / Endpoint**: 
  - `GET /api/pelatihan`
  - `GET /api/pelatihan/employee/:id`
  - `POST /api/pelatihan/employee/:id`
* **Controller & Service**: [pelatihan.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pelatihan/pelatihan.controller.ts), [pelatihan.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pelatihan/pelatihan.service.ts), [pelatihan.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pelatihan/pelatihan.repository.ts), [pelatihan.model.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pelatihan/pelatihan.model.ts)
* **Tabel Database**: `pelatihan`, `pegawai`.
* **Middleware & Permission**: Seluruh rute pada berkas [pelatihan.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pelatihan/pelatihan.routes.ts): **Publik / Tidak terproteksi**[^15] (tidak menggunakan `authenticateToken`).
* **Dependensi Modul**: `pegawai` (menghubungkan sertifikat ke profil pegawai).
* **Status Testing**: Tidak ada pengujian otomatis.
* **Risk Level**: **RENDAH** (Hanya data sertifikasi pelatihan internal/eksternal).

[^15]: Klaim di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian 12) menyatakan modul pelatihan fully implemented dengan proteksi JWT. Kenyataannya, berkas rute tidak menggunakan middleware autentikasi. **TERVERIFIKASI BERBEDA** dengan kode aktual.

---

### 28. Modul: dashboard (Agregasi Visual Dasbor)

* **Tujuan Bisnis**: Menyajikan data statistik ringkasan grafik absensi harian, total karyawan aktif/nonaktif, jumlah pengajuan cuti pending, dan daftar riwayat aktivitas terbaru.
* **Route / Endpoint**: 
  - `GET /api/dashboard/admin`
  - `GET /api/dashboard/supervisor`
  - `GET /api/dashboard/employee/:employeeId`
  - `GET /api/dashboard/recent-activity`
* **Controller & Service**: [dashboard.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/dashboard/dashboard.controller.ts), [dashboard.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/dashboard/dashboard.service.ts), [dashboard.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/dashboard/dashboard.repository.ts)
* **Tabel Database**: Mengakses data agregat tanpa memodifikasi tabel: `pegawai`, `absensi`, `permintaan_cuti`, `penilaian_kinerja`, `kontrak`, `penggajian`.
* **Middleware & Permission**: 
  - `GET /api/dashboard/supervisor`: Terproteksi `authenticateToken`.
  - Rute lainnya (`/admin`, `/employee/:employeeId`, `/recent-activity`): **Publik / Tidak terproteksi**[^16] (tidak menggunakan `authenticateToken`).
* **Dependensi Modul**: `pegawai`, `absensi`, `cuti`, `kinerja`, `kontrak`, `penggajian`.
* **Status Testing**: Tidak ada pengujian otomatis.
* **Risk Level**: **RENDAH** (Hanya tampilan visual agregasi data read-only).

[^16]: Klaim di [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian 20) menyatakan modul dashboard menyajikan data role-specific yang aman. Kenyataannya, sebagian besar rutenya tidak diproteksi oleh auth middleware di file routes. **TERVERIFIKASI BERBEDA** dengan kode aktual.

---

### 29. Modul: changelog (Catatan Rilis IT)

* **Tujuan Bisnis**: Menyimpan catatan log kemajuan pembaruan sistem (release changelog) oleh tim pengembang untuk konsumsi admin/manajemen.
* **Route / Endpoint**: 
  - `GET /api/changelog`
  - `POST /api/changelog`
* **Controller & Service**: [changelog.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/changelog/changelog.controller.ts), [changelog.service.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/changelog/changelog.service.ts), [changelog.repository.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/changelog/changelog.repository.ts), [changelog.model.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/changelog/changelog.model.ts)
* **Tabel Database**: `release_changelog`.
* **Middleware & Permission**: 
  - `authenticateToken` wajib untuk seluruh rute.
  - Read & Write: Terproteksi `restrictTo('admin', 'pimpinan')`.
* **Dependensi Modul**: Tidak ada.
* **Status Testing**: Tidak ada pengujian otomatis.
* **Risk Level**: **RENDAH** (Hanya catatan deskripsi teks pembaruan rilis sistem).
* **Catatan Kaki**: Rute dan proteksi release changelog **TERVERIFIKASI SAMA** dengan deskripsi pada [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (bagian 23).
