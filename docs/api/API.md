# API Documentation: Portal SDM v3 Backend

Dokumen ini menyajikan dokumentasi teknis seluruh endpoint API aktif di backend, diidentifikasi melalui pembacaan langsung terhadap file-file `.routes.ts` dan `.controller.ts` di direktori [apps/backend/src/modules/](file:///opt/portal-sdmv3/apps/backend/src/modules/).

## 💡 Informasi Umum & Keamanan Global

* **Prefix Rute**: Seluruh endpoint API dipasang di bawah prefix `/api`.
* **Protokol**: HTTP/JSON (kecuali multipart-form data untuk unggahan dokumen/gambar).
* **Mekanisme Autentikasi**:
  * **JWT Auth**: Diterapkan menggunakan middleware `authenticateToken` pada modul tertentu. Token JWT berdurasi 24 jam harus dikirim melalui header `Authorization: Bearer <token>`.
  * **API Key Auth**: Diterapkan menggunakan middleware `apiKeyMiddleware` pada rute `/api/integrations/*` untuk konsumsi sistem M2M eksternal.
  * **Bypass Autentikasi (Celah Keamanan Terbuka)**: Banyak rute penting (termasuk yang mengelola data sensitif pegawai, keuangan, dan cadangan database) **sama sekali tidak diamankan oleh middleware autentikasi**.
* **Mekanisme Validasi**: Tidak ditemukan pustaka validator seperti `express-validator` di seluruh codebase. Validasi dilakukan secara manual melalui pengkondisian `if` di tingkat controller, pengecekan properti kosong, atau langsung menggunakan *type casting* TypeScript (`req.body as CreateKpiPayload`). [^1]

---

> [!CAUTION]
> **ACCEPTED RISK - SEC-02 [KRITIS - DITUNDA SECARA SADAR]**
> Modul `backup`, `pengguna`, `pegawai`, `cuti`, `absensi`, `penggajian`, `kontrak`, dan `laporan` tidak memiliki proteksi autentikasi pada rute-nya, meski dokumen `GEMINI.md` dan `AGENTS.md` mengklaim sebaliknya. Server bersifat internet-facing.
> Keputusan pemilik proyek per 11 Juli 2026: **DITUNDA** hingga sesi development berikutnya.
> Risiko: akses/modifikasi/pengambilan data tanpa otorisasi dapat terjadi kapan saja selama masa penundaan ini.

---

## 🚨 ENDPOINT MODUL DENGAN TINGKAT RISIKO: TINGGI

### 1. Modul: pengguna (Manajemen Pengguna & Auth)
* **Base Path**: `/api/auth` (Registrasi & Login) dan `/api/users` (Manajemen Profil)
* **Status Autentikasi**: Rute `/api/auth/*` bersifat Publik. Rute `/api/users/*` bersifat **Publik (TIDAK DIAMANKAN)** [^2].

#### Rute Autentikasi (`/api/auth`)
* Sumber Rute: [auth.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pengguna/auth.routes.ts#L7-L8)
* Sumber Controller: [auth.pengguna.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pengguna/auth.pengguna.controller.ts#L8-L46)

##### `POST /api/auth/login`
* **Deskripsi**: Login ke aplikasi dan mendapatkan token akses JWT.
* **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@company.com",
      "role": "admin",
      "employeeId": "emp-01"
    }
  }
  ```

##### `POST /api/auth/register`
* **Deskripsi**: Registrasi akun pengguna baru (default ke role `employee`).
* **Request Body**:
  ```json
  {
    "name": "Budi",
    "email": "budi@company.com",
    "password": "securepassword",
    "role": "employee" // Opsional
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "message": "Registration successful",
    "userId": 2
  }
  ```

#### Rute Manajemen Profil (`/api/users`)
* Sumber Rute: [pengguna.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pengguna/pengguna.routes.ts#L8-L14)
* Sumber Controller: [pengguna.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pengguna/pengguna.controller.ts#L31-L120)

##### `GET /api/users`
* **Deskripsi**: Mendapatkan seluruh data akun pengguna (Tanpa Proteksi).
* **Success Response (200 OK)**: Array of user objects.

##### `GET /api/users/:id`
* **Deskripsi**: Mendapatkan detail pengguna berdasarkan ID (Tanpa Proteksi).
* **Success Response (200 OK)**: User object.

##### `PUT /api/users/:id`
* **Deskripsi**: Memperbarui profil pengguna (Tanpa Proteksi).
* **Request Body**: Partial user fields (`name`, `email`, dll.).
* **Success Response (200 OK)**: Updated user object.

##### `PUT /api/users/:id/password`
* **Deskripsi**: Mengubah password secara mandiri oleh pengguna (Tanpa Proteksi).
* **Request Body**:
  ```json
  {
    "currentPassword": "oldpassword",
    "newPassword": "newpassword"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Password berhasil diubah."
  }
  ```

##### `PUT /api/users/:id/reset-password`
* **Deskripsi**: Mereset password pengguna oleh Admin/Atasan (Tanpa Proteksi).
* **Request Body**:
  ```json
  {
    "newPassword": "newpassword"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Password berhasil direset."
  }
  ```

##### `POST /api/users/:id/avatar`
* **Deskripsi**: Mengunggah foto profil/avatar pengguna (Tanpa Proteksi).
* **Request Body**: Multipart Form Data dengan file field `avatar`.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "avatarUrl": "/avatars/avatar-1712345678.png",
    "data": { ... }
  }
  ```

##### `DELETE /api/users/:id`
* **Deskripsi**: Menghapus akun pengguna dari database (Tanpa Proteksi).
* **Success Response (200 OK)**: Object hasil penghapusan database.

---

### 2. Modul: pegawai (Manajemen Pegawai)
* **Base Path**: `/api/employees`
* **Status Autentikasi**: **Publik (TIDAK DIAMANKAN)** [^3]
* Sumber Rute: [pegawai.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pegawai/pegawai.routes.ts#L9-L20)
* Sumber Controller: [pegawai.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pegawai/pegawai.controller.ts#L44-L173), [pegawai.auth.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pegawai/pegawai.auth.controller.ts#L7-L32)

##### `GET /api/employees`
* **Deskripsi**: Mendapatkan daftar semua pegawai.
* **Query Params**:
  * `includeDirectors` (boolean, opsional): Jika `true`, menyertakan direktur utama.
* **Success Response (200 OK)**: `{ success: true, data: [...] }`

##### `GET /api/employees/:id`
* **Deskripsi**: Mendapatkan profil detail pegawai berdasarkan ID.
* **Success Response (200 OK)**: `{ success: true, data: { ... } }`

##### `POST /api/employees`
* **Deskripsi**: Membuat record pegawai baru.
* **Request Body**: Multipart Form Data dengan file optional `avatar`, dan form field profile pegawai.
* **Success Response (201 Created)**: `{ success: true, data: { ... } }`

##### `POST /api/employees/with-user`
* **Deskripsi**: Membuat record pegawai sekaligus membuat akun pengguna (user account) terkait.
* **Request Body**: Multipart Form Data dengan file optional `avatar`, form field pegawai, dan properti akun `email`, `role`, `name`.
* **Success Response (201 Created)**: `{ success: true, message: "Employee and User account created successfully", data: { ... } }`

##### `PUT /api/employees/:id`
* **Deskripsi**: Memperbarui data profil pegawai.
* **Request Body**: Multipart Form Data.
* **Success Response (200 OK)**: `{ success: true, data: { ... } }`

##### `PUT /api/employees/:id/payroll-info`
* **Deskripsi**: Memperbarui informasi rekening dan penggajian pegawai.
* **Request Body**: `bankName`, `bankAccountNumber`, `baseSalary`, `allowance`.
* **Success Response (200 OK)**: `{ success: true, data: { ... } }`

##### `DELETE /api/employees/:id`
* **Deskripsi**: Menghapus data pegawai. Menghapus data terkait secara bertingkat (cascade delete) di tabel `users` dan `contracts`.
* **Success Response (200 OK)**: `{ success: true, data: { message: "Employee deleted successfully" } }`

##### `GET /api/employees/charts/gender-distribution`
* **Deskripsi**: Distribusi pegawai berdasarkan gender.
* **Success Response (200 OK)**: `{ success: true, data: [...] }`

##### `GET /api/employees/charts/education-distribution`
* **Deskripsi**: Distribusi pegawai berdasarkan jenjang pendidikan.
* **Success Response (200 OK)**: `{ success: true, data: [...] }`

##### `GET /api/employees/charts/department-distribution`
* **Deskripsi**: Distribusi pegawai berdasarkan divisi/departemen.
* **Success Response (200 OK)**: `{ success: true, data: [...] }`

---

### 3. Modul: penggajian (Manajemen Penggajian)
* **Base Path**: `/api/payrolls`
* **Status Autentikasi**: **Publik (TIDAK DIAMANKAN)**, kecuali endpoint PATCH status [^4].
* Sumber Rute: [penggajian.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/penggajian/penggajian.routes.ts#L8-L18)
* Sumber Controller: [penggajian.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/penggajian/penggajian.controller.ts#L8-L114)

##### `GET /api/payrolls`
* **Deskripsi**: Mendapatkan seluruh data riwayat penggajian.
* **Success Response (200 OK)**: Array of payroll objects.

##### `GET /api/payrolls/:id`
* **Deskripsi**: Mendapatkan slip/detail gaji berdasarkan ID penggajian.
* **Success Response (200 OK)**: Payroll object.

##### `GET /api/payrolls/employee/:id`
* **Deskripsi**: Mendapatkan daftar riwayat gaji untuk pegawai tertentu.
* **Success Response (200 OK)**: Array of payroll objects.

##### `POST /api/payrolls`
* **Deskripsi**: Membuat entri penggajian baru secara manual.
* **Request Body**: `employeeId`, `period`, `baseSalary`, `allowances`, `deductions`, `status`.
* **Success Response (201 Created)**: Payroll object.

##### `PUT /api/payrolls/:id`
* **Deskripsi**: Mengubah nilai atau rincian komponen penggajian.
* **Request Body**: Fields updated.
* **Success Response (200 OK)**: Updated payroll object.

##### `POST /api/payrolls/run`
* **Deskripsi**: Menjalankan kalkulasi penggajian bulanan masal untuk periode tertentu.
* **Request Body**: `{ "period": "YYYY-MM" }`
* **Success Response (201 Created)**: `{ "message": "Payroll run completed", "count": 12 }`

##### `DELETE /api/payrolls/:id`
* **Deskripsi**: Menghapus entri penggajian.
* **Success Response (200 OK)**: Object hasil operasi database.

##### `POST /api/payrolls/:id/components`
* **Deskripsi**: Menambahkan rincian komponen gaji tambahan/potongan khusus.
* **Request Body**: `{ "name": "Bonus Proyek", "type": "allowance", "amount": 500000 }`
* **Success Response (200 OK)**: Updated payroll object.

##### `GET /api/payrolls/:id/download`
* **Deskripsi**: Mengunduh berkas payslip PDF.
* **Success Response (200 OK)**: File stream PDF.

##### `PATCH /api/payrolls/:id/status`
* **Deskripsi**: Menyetujui/memperbarui status pembayaran gaji.
* **Auth**: Wajib Token JWT & Role `admin` (`authenticateToken`, `restrictTo('admin')`).
* **Request Body**: `{ "status": "paid" }`
* **Success Response (200 OK)**: Updated payroll object.

---

### 4. Modul: kontrak (Manajemen Kontrak Kerja & Riwayat Jabatan)
* **Base Path**: `/api/contracts`
* **Status Autentikasi**: **Publik (TIDAK DIAMANKAN)** [^5].
* Sumber Rute: [kontrak.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kontrak/kontrak.routes.ts#L8-L18)
* Sumber Controller: [kontrak.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kontrak/kontrak.controller.ts#L10-L133)

##### `GET /api/contracts`
* **Deskripsi**: Mendapatkan seluruh data kontrak pegawai.
* **Success Response (200 OK)**: `{ success: true, data: [...] }`

##### `GET /api/contracts/:id`
* **Deskripsi**: Mendapatkan detail kontrak berdasarkan ID kontrak.
* **Success Response (200 OK)**: `{ success: true, data: { ... } }`

##### `GET /api/contracts/employee/:employeeId`
* **Deskripsi**: Mendapatkan daftar kontrak untuk pegawai tertentu.
* **Success Response (200 OK)**: `{ success: true, data: [...] }`

##### `GET /api/contracts/expiring`
* **Deskripsi**: Mendapatkan daftar kontrak yang akan segera berakhir.
* **Query Params**: `days` (number, default: 30).
* **Success Response (200 OK)**: `{ success: true, data: [...] }`

##### `POST /api/contracts`
* **Deskripsi**: Membuat record kontrak kerja baru.
* **Request Body**: Multipart Form Data dengan file field `contractFile`, dan form fields `employeeId`, `contractNumber`, `contractType`, `startDate`, `endDate`, `status`.
* **Success Response (201 Created)**: `{ success: true, data: { ... } }`

##### `PUT /api/contracts/:id`
* **Deskripsi**: Memperbarui data kontrak kerja.
* **Request Body**: Multipart Form Data.
* **Success Response (200 OK)**: `{ success: true, data: { ... } }`

##### `DELETE /api/contracts/:id`
* **Deskripsi**: Menghapus data kontrak.
* **Success Response (200 OK)**: `{ success: true, data: { message: "Contract deleted" } }`

##### `GET /api/contracts/job-history/employee/:id`
* **Deskripsi**: Mendapatkan riwayat jabatan/promosi/mutasi pegawai.
* **Success Response (200 OK)**: `{ success: true, data: [...] }`

##### `POST /api/contracts/job-history/employee/:id`
* **Deskripsi**: Menambahkan catatan riwayat jabatan baru (promosi/mutasi).
* **Request Body**: `position`, `department`, `startDate`, `changeType`, `notes`.
* **Success Response (201 Created)**: `{ success: true, data: { ... } }`

---

### 5. Modul: backup (Cadangan Sistem)
* **Base Path**: `/api/backup`
* **Status Autentikasi**: **Publik (TIDAK DIAMANKAN)** [^6].
* Sumber Rute: [backup.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/backup/backup.routes.ts#L7-L10)
* Sumber Controller: [backup.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/backup/backup.controller.ts#L8-L38)

##### `GET /api/backup/list`
* **Deskripsi**: Mendapatkan daftar berkas backup database SQLite yang tersedia di server.
* **Success Response (200 OK)**: Array of backup file metadata.

##### `POST /api/backup/backup`
* **Deskripsi**: Membuat salinan cadangan (*backup*) database SQLite aktif.
* **Success Response (200 OK)**: `{ "message": "Backup created successfully", "filename": "backup-1712345678.sqlite" }`

##### `POST /api/backup/restore`
* **Deskripsi**: Mengembalikan data database (*restore*) menggunakan file backup tertentu.
* **Request Body**: `{ "filename": "backup-1712345678.sqlite" }`
* **Success Response (200 OK)**: `{ "message": "Database restored successfully" }`

##### `GET /api/backup/download/:filename`
* **Deskripsi**: Mengunduh langsung file fisik database SQLite backup dari server.
* **Success Response (200 OK)**: File Stream (.sqlite).

---

### 6. Modul: laporan (Laporan Terkonsolidasi & Custom Builder)
* **Base Path**: `/api/reports`
* **Status Autentikasi**: **Publik (TIDAK DIAMANKAN)** [^7].
* Sumber Rute: [laporan.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/laporan/laporan.routes.ts#L9-L30), [custom-report.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/laporan/custom-report.routes.ts#L6-L8)
* Sumber Controller: [laporan.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/laporan/laporan.controller.ts#L9-L306), [custom-report.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/laporan/custom-report.controller.ts#L8-L79)

##### `GET /api/reports/employees`
* **Deskripsi**: Mendapatkan laporan statistik pegawai.
* **Success Response (200 OK)**: `{ success: true, data: { ... } }`

##### `GET /api/reports/attendance`
* **Deskripsi**: Rekapitulasi absensi pegawai.
* **Query Params**: `startDate` (YYYY-MM-DD), `endDate` (YYYY-MM-DD).
* **Success Response (200 OK)**: `{ success: true, data: { ... } }`

##### `GET /api/reports/payroll`
* **Deskripsi**: Rekapitulasi nilai penggajian pegawai.
* **Query Params**: `month`, `year`.
* **Success Response (200 OK)**: `{ success: true, data: { ... } }`

##### `GET /api/reports/leave`
* **Deskripsi**: Laporan pengajuan dan persetujuan cuti.
* **Query Params**: `month`, `year`.
* **Success Response (200 OK)**: `{ success: true, data: { ... } }`

##### `GET /api/reports/performance`
* **Deskripsi**: Laporan rata-rata nilai penilaian kinerja.
* **Query Params**: `month`, `year`.
* **Success Response (200 OK)**: `{ success: true, data: { ... } }`

##### `GET /api/reports/turnover`
* **Deskripsi**: Laporan tingkat pengunduran diri/masuk pegawai.
* **Query Params**: `startDate`, `endDate`.
* **Success Response (200 OK)**: `{ success: true, data: { ... } }`

##### `GET /api/reports/demographics`
* **Deskripsi**: Laporan demografi pegawai (berdasarkan umur, status kerja).
* **Success Response (200 OK)**: `{ success: true, data: { ... } }`

##### `GET /api/reports/employees/comprehensive`
* **Deskripsi**: Laporan data detail komprehensif seluruh pegawai.
* **Success Response (200 OK)**: `{ success: true, data: [...] }`

##### `GET /api/reports/attendance/analytics`
* **Deskripsi**: Analisis pola keterlambatan dan tren ketidakhadiran.
* **Query Params**: `startDate`, `endDate`.
* **Success Response (200 OK)**: `{ success: true, data: { ... } }`

##### `GET /api/reports/payroll/analytics`
* **Deskripsi**: Laporan tren pengeluaran biaya gaji kantor.
* **Query Params**: `month`, `year`.
* **Success Response (200 OK)**: `{ success: true, data: { ... } }`

##### `GET /api/reports/employees/export`
* **Deskripsi**: Ekspor file Excel (.xlsx) laporan pegawai.
* **Success Response (200 OK)**: File Stream (.xlsx).

##### `GET /api/reports/attendance/export`
* **Deskripsi**: Ekspor file Excel (.xlsx) data absensi.
* **Query Params**: `month`, `year`.
* **Success Response (200 OK)**: File Stream (.xlsx).

##### `GET /api/reports/payroll/export`
* **Deskripsi**: Ekspor file Excel (.xlsx) data penggajian.
* **Query Params**: `month`, `year`.
* **Success Response (200 OK)**: File Stream (.xlsx).

##### `GET /api/reports/leave/export`
* **Deskripsi**: Ekspor file Excel (.xlsx) rekap cuti.
* **Query Params**: `month`, `year`.
* **Success Response (200 OK)**: File Stream (.xlsx).

##### `GET /api/reports/performance/export`
* **Deskripsi**: Ekspor file Excel (.xlsx) data penilaian kinerja.
* **Query Params**: `month`, `year`.
* **Success Response (200 OK)**: File Stream (.xlsx).

##### `GET /api/reports/custom/metadata`
* **Deskripsi**: Mendapatkan daftar tabel dan kolom database yang diizinkan untuk kustomisasi laporan.
* **Success Response (200 OK)**: `{ success: true, data: { ... } }`

##### `POST /api/reports/custom/generate`
* **Deskripsi**: Membangun laporan kustom secara dinamis.
* **Request Body**:
  ```json
  {
    "reportType": "employees",
    "fields": ["name", "nip", "department"],
    "filters": { "department": "IT" }
  }
  ```
* **Success Response (200 OK)**: `{ success: true, data: [...] }`

##### `POST /api/reports/custom/export`
* **Deskripsi**: Ekspor file Excel (.xlsx) laporan kustom.
* **Request Body**: Sama seperti `/generate`.
* **Success Response (200 OK)**: File Stream (.xlsx).

---

### 7. Modul: integration (Integrasi Konsumsi API Key M2M)
* **Base Path**: `/api/integrations`
* **Status Autentikasi**: Wajib Header `x-api-key`.
* Sumber Rute: [integration.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/integration/integration.routes.ts#L14-L19)
* Sumber Controller: [integration.controller.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/integration/integration.controller.ts#L11-L180)

##### `GET /api/integrations/employees`
* **Deskripsi**: Mendapatkan data master pegawai untuk sinkronisasi eksternal.
* **Success Response (200 OK)**: `{ success: true, data: [...] }`

##### `GET /api/integrations/attendance`
* **Deskripsi**: Menarik data log kehadiran pegawai.
* **Query Params**: `startDate`, `endDate`, `employeeId`.
* **Success Response (200 OK)**: `{ success: true, data: [...] }`

##### `GET /api/integrations/leaves`
* **Deskripsi**: Menarik data log cuti pegawai.
* **Query Params**: `startDate`, `endDate`, `employeeId`, `status`.
* **Success Response (200 OK)**: `{ success: true, data: [...] }`

##### `POST /api/integrations/attendance`
* **Deskripsi**: Mengirimkan log absen dari mesin absensi fisik (fingerprint/RFID).
* **Request Body**:
  ```json
  {
    "nip": "EMP-001",
    "date": "2026-07-11",
    "clock_in": "08:00:00",
    "clock_out": "17:00:00",
    "status": "present",
    "notes": "Fingerprint office"
  }
  ```
* **Success Response (200 OK)**: `{ success: true, data: { ... } }`

##### `POST /api/integrations/daily-activities`
* **Deskripsi**: Sinkronisasi log beban kerja dari aplikasi produktivitas eksternal.
* **Request Body**:
  ```json
  {
    "nip": "EMP-001",
    "date": "2026-07-11",
    "activity_name": "Coding Backend API",
    "duration_minutes": 240,
    "notes": "Jira ticket DEV-123"
  }
  ```
* **Success Response (200 OK)**: `{ success: true, data: { ... } }`

---

## 🛡️ ENDPOINT MODUL DENGAN TINGKAT RISIKO: SEDANG / RENDAH

### 8. Modul: absensi (Kehadiran & Absen)
* **Base Path**: `/api/attendance`
* **Status Autentikasi**: **Publik (TIDAK DIAMANKAN)** [^8].
* Sumber Rute: [absensi.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/absensi/absensi.routes.ts#L6-L32)

* `GET /api/attendance` -> Mendapatkan riwayat kehadiran (Query params: `employeeId`, `startDate`, `endDate`).
* `GET /api/attendance/:id` -> Detail kehadiran berdasarkan ID.
* `GET /api/attendance/employee/:id` -> Daftar kehadiran pegawai tertentu (Query params: `startDate`, `endDate`).
* `POST /api/attendance/clock-in` -> Melakukan pencatatan absen masuk kerja. Request body: `{ "employeeId": "emp-1" }` (opsional).
* `POST /api/attendance/clock-out` -> Melakukan pencatatan absen pulang kerja. Request body: `{ "employeeId": "emp-1" }` (opsional).
* `POST /api/attendance/upload` -> Impor berkas kehadiran (Fingerprint). Multipart form data dengan file field `file`.
* `POST /api/attendance` -> Membuat entri kehadiran manual. Request body: `AbsensiCreatePayload`.
* `PUT /api/attendance/:id` -> Memperbarui entri kehadiran manual. Request body: `AbsensiUpdatePayload`.
* `DELETE /api/attendance/:id` -> Menghapus entri kehadiran.

---

### 9. Modul: cuti (Pengajuan Cuti Pegawai)
* **Base Path**: `/api/leave-requests`
* **Status Autentikasi**: **Publik (TIDAK DIAMANKAN)** [^9].
* Sumber Rute: [cuti.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/cuti/cuti.routes.ts#L22-L30)

* `GET /api/leave-requests` -> Daftar semua pengajuan cuti.
* `GET /api/leave-requests/batch-sisa-cuti` -> Proses kalkulasi pembaruan saldo cuti masal.
* `GET /api/leave-requests/cuti-bersama` -> Mendapatkan konfigurasi hari cuti bersama nasional.
* `GET /api/leave-requests/employee/:employeeId` -> Daftar pengajuan cuti pegawai tertentu.
* `GET /api/leave-requests/sisa-cuti/:employeeId` -> Mendapatkan detail sisa kuota cuti tahunan pegawai.
* `GET /api/leave-requests/:id` -> Detail permintaan cuti berdasarkan ID.
* `POST /api/leave-requests` -> Mengajukan cuti baru. Multipart form data dengan file optional `supportingDocument` dan parameter cuti.
* `PUT /api/leave-requests/:id/status` -> Persetujuan cuti (Approve/Reject). Request body: `{ "status": "approved", "rejectionReason": "" }`.
* `DELETE /api/leave-requests/:id` -> Membatalkan/menghapus pengajuan cuti.

---

### 10. Modul: kinerja (Evaluasi Kinerja Pegawai)
* **Base Path**: `/api/performance-reviews`
* **Status Autentikasi**: Wajib Token JWT (`authenticateToken` di tingkat rute teratas).
* Sumber Rute: [kinerja.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kinerja/kinerja.routes.ts#L45-L53)

* `GET /api/performance-reviews` -> Mendapatkan semua evaluasi kinerja. Diperlukan role pimpinan/admin (`restrictTo('admin', 'pimpinan', 'supervisor')`).
* `GET /api/performance-reviews/employee/:id` -> Mendapatkan evaluasi pegawai tertentu. Dilakukan pengecekan kepemilikan data (`ensureEmployeeReviewScope`).
* `GET /api/performance-reviews/:id` -> Mendapatkan detail evaluasi berdasarkan ID.
* `POST /api/performance-reviews` -> Membuat formulir penilaian baru oleh atasan.
* `PUT /api/performance-reviews/:id` -> Memperbarui formulir penilaian.
* `PUT /api/performance-reviews/:id/feedback` -> Menambahkan umpan balik pegawai (`employeeFeedback`). Dilindungi oleh `ensureOwnedReviewAccess`.
* `PUT /api/performance-reviews/:id/self-assessment` -> Mengisi evaluasi mandiri oleh pegawai (`selfAssessment`). Dilindungi oleh `ensureOwnedReviewAccess`.
* `PUT /api/performance-reviews/:id/transition` -> Mengubah tahapan status alur evaluasi. Request body: `{ "targetStatus": "approved" }`.
* `DELETE /api/performance-reviews/:id` -> Menghapus formulir evaluasi kinerja.

---

### 11. Modul: kpi (Target & Template KPI)
* **Base Path**: `/api/kpi-targets` (Rute KPI) dan `/api/kpi-templates` (Template KPI)
* **Status Autentikasi**:
  * `/api/kpi-targets`: Wajib Token JWT (`authenticateToken`).
  * `/api/kpi-templates`: **Publik (TIDAK DIAMANKAN)** [^10].
* Sumber Rute: [kpi.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kpi/kpi.routes.ts#L11-L63), [kpiTemplate.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kpi/kpiTemplate.routes.ts#L8-L39)

#### Rute Target KPI (`/api/kpi-targets`)
* `GET /api/kpi-targets/summary` -> Ringkasan status target KPI.
* `GET /api/kpi-targets/monitoring-summary` -> Ringkasan status pemantauan realisasi KPI.
* `GET /api/kpi-targets` -> Daftar target KPI (Query params: `employeeId`, `period`, `status`).
* `GET /api/kpi-targets/employee/:employeeId` -> Daftar target KPI pegawai tertentu.
* `GET /api/kpi-targets/nominal-targets` -> Menarik konfigurasi nominal target KPI.
* `GET /api/kpi-targets/nominal-targets/defaults` -> Nilai target default.
* `GET /api/kpi-targets/nominal-targets/employee/:employeeId` -> Nilai target nominal khusus pegawai.
* `PUT /api/kpi-targets/nominal-targets/employee/:employeeId` -> Mengubah nilai target nominal. Diperlukan role `admin`.
* `GET /api/kpi-targets/:id` -> Detail target KPI berdasarkan ID.
* `POST /api/kpi-targets` -> Membuat target KPI baru (Role atasan).
* `POST /api/kpi-targets/generate-from-abk` -> Generate otomatis target KPI berdasarkan form beban kerja (WLA).
* `POST /api/kpi-targets/rebalance` -> Menyeimbangkan bobot KPI secara otomatis agar bernilai total 100.
* `POST /api/kpi-targets/sync-wla` -> Sinkronisasi realisasi KPI berdasarkan data isian lembar log harian WLA.
* `PUT /api/kpi-targets/:id` -> Memperbarui target KPI.
* `PUT /api/kpi-targets/:id/actual` -> Mengunggah nilai pencapaian riil KPI beserta file bukti dukung (`evidence`). Multipart form data.
* `POST /api/kpi-targets/:id/evidence` -> Hanya mengunggah file bukti dukung KPI. Multipart form data.
* `DELETE /api/kpi-targets/:id` -> Menghapus data target KPI.

#### Rute Template KPI (`/api/kpi-templates`)
* `GET /api/kpi-templates` -> Mendapatkan seluruh rancangan template target KPI per divisi.
* `POST /api/kpi-templates/apply` -> Menerapkan template KPI massal ke pegawai. Request body: `{ "employeeId": "emp-1", "period": "2026-Q1", "department": "IT" }`.

---

### 12. Modul: log-aktivitas-harian (Lembar WLA Harian)
* **Base Path**: `/api/log-aktivitas-harian`
* **Status Autentikasi**: Wajib Token JWT (`authenticateToken`).
* Sumber Rute: [log-aktivitas-harian.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/log-aktivitas-harian/log-aktivitas-harian.routes.ts#L11-L19)

* `POST /api/log-aktivitas-harian` -> Membuat log aktivitas tunggal (termasuk unggah bukti dukung opsional). Multipart form data.
* `POST /api/log-aktivitas-harian/bulk` -> Membuat banyak log sekaligus untuk tanggal tertentu. Request body: `{ "tanggal": "YYYY-MM-DD", "logs": [...] }`.
* `GET /api/log-aktivitas-harian/my-logs` -> Mendapatkan log milik pribadi pegawai yang sedang login (Query: `tanggal`, `id_pegawai`).
* `GET /api/log-aktivitas-harian/summary` -> Mendapatkan rekapitulasi beban kerja mingguan/bulanan (Query: `startDate`, `endDate`).
* `GET /api/log-aktivitas-harian/admin/summary` -> Rekap log pegawai untuk kebutuhan verifikasi atasan.
* `GET /api/log-aktivitas-harian/admin/logs` -> Daftar log seluruh pegawai untuk administrasi.
* `PUT /api/log-aktivitas-harian/:id/status` -> Menyetujui/menolak log aktivitas harian pegawai oleh atasan. Request body: `{ "status": "APPROVED" | "REJECTED" }`.

---

### 13. Modul: workload (Analisis Beban Kerja / WLA)
* **Base Path**: `/api/workload`
* **Status Autentikasi**: Wajib Token JWT (`authenticateToken`).
* Sumber Rute: [workload.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/workload/workload.routes.ts#L10-L13)

* `GET /api/workload/:employeeId` -> Mendapatkan analisis beban kerja pegawai (Query: `year`).
* `POST /api/workload` -> Mengirim draf/formulir beban kerja pegawai.
* `PUT /api/workload/:id/submit` -> Mengajukan analisis beban kerja ke atasan untuk ditinjau.
* `PUT /api/workload/:id/approve` -> Menyetujui analisis beban kerja oleh atasan.

---

### 14. Modul: task (Tugas Mandat Supervisor)
* **Base Path**: `/api/tasks`
* **Status Autentikasi**: Wajib Token JWT (`authenticateToken`).
* Sumber Rute: [task.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/task/task.routes.ts#L83-L87)

* `POST /api/tasks` -> Atasan memberikan tugas baru kepada bawahan (`ensureTaskCreateScope`).
* `GET /api/tasks/supervisor/:supervisor_id` -> Mendapatkan penugasan yang diberikan oleh atasan tertentu (`ensureSupervisorScope`).
* `GET /api/tasks/employee/:employee_id` -> Pegawai melihat daftar penugasan yang diberikan kepadanya (`ensureEmployeeScope`).
* `PUT /api/tasks/:id/status` -> Pegawai memperbarui status penugasan (Draft/In-Progress/Completed) (`ensureTaskStatusScope`).
* `DELETE /api/tasks/:id` -> Menghapus penugasan oleh atasan (`ensureTaskDeleteScope`).

---

### 15. Modul: permintaanPerubahanData (Data Change Request)
* **Base Path**: `/api/data-change-requests`
* **Status Autentikasi**: Wajib Token JWT (`authenticateToken`).
* Sumber Rute: [permintaanPerubahanData.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/permintaanPerubahanData/permintaanPerubahanData.routes.ts#L9-L13)

* `POST /api/data-change-requests` -> Mengajukan perubahan profil mandiri (Role: `employee`). Request body: `{ "requestedChanges": { ... } }`.
* `GET /api/data-change-requests` -> Mendapatkan riwayat pengajuan perubahan (Role: `admin`).
* `PATCH /api/data-change-requests/:id/handle` -> Menyetujui/menolak pengajuan perubahan profil (Role: `admin`). Request body: `{ "status": "approved" | "rejected", "reviewNotes": "" }`.

---

### 16. Modul: kredit-berkas (Pemantauan Berkas Kredit & Whatsapp Notifikasi)
* **Base Path**: `/api/kredit-berkas`
* **Status Autentikasi**: Wajib Token JWT (`authenticateToken`).
* Sumber Rute: [kredit-berkas.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kredit-berkas/kredit-berkas.routes.ts#L9-L16)

* `POST /api/kredit-berkas` -> Mencatat berkas permohonan kredit nasabah baru (Otomatis memicu notifikasi Whatsapp ke analis kredit).
* `GET /api/kredit-berkas` -> Mendapatkan seluruh daftar berkas kredit.
* `GET /api/kredit-berkas/pending` -> Daftar permohonan kredit yang belum diproses.
* `GET /api/kredit-berkas/monitoring` -> Laporan pelacakan status penugasan kredit per analis.
* `GET /api/kredit-berkas/:id` -> Detail data permohonan kredit.
* `GET /api/kredit-berkas/:id/wa-log` -> Log pengiriman pesan notifikasi Whatsapp untuk berkas tertentu.
* `PUT /api/kredit-berkas/:id/process` -> Memperbarui tahapan status proses kredit nasabah.
* `POST /api/kredit-berkas/wa-resend/:logId` -> Mengirim ulang pesan notifikasi Whatsapp yang gagal terkirim.

---

### 17. Modul: arsip-dokumen (Manajemen Arsip Dokumen Digital)
* **Base Path**: `/api/arsip-dokumen`
* **Status Autentikasi**: Wajib Token JWT (`authenticateToken`).
* Sumber Rute: [arsip-dokumen.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/arsip-dokumen/arsip-dokumen.routes.ts#L13-L33)

* `GET /api/arsip-dokumen` -> Pencarian arsip dokumen (Sesuai role tingkat kerahasiaan dokumen).
* `GET /api/arsip-dokumen/stats` -> Statistik berkas per kategori dokumen.
* `GET /api/arsip-dokumen/expiring` -> Daftar dokumen dengan masa berlaku yang segera habis.
* `GET /api/arsip-dokumen/:id` -> Detail file dokumen.
* `POST /api/arsip-dokumen` -> Mengunggah dokumen baru (Multipart form data dengan file field `file`). Diperlukan role `admin`/`pimpinan`/`supervisor`.
* `PUT /api/arsip-dokumen/:id` -> Memperbarui berkas atau data indeks dokumen. Multipart form data.
* `DELETE /api/arsip-dokumen/:id` -> Menghapus dokumen dari arsip digital.

---

### 18. Modul: orientasi (Orientasi Pegawai Baru / Onboarding)
* **Base Path**: `/api/onboarding`
* **Status Autentikasi**: **Publik (TIDAK DIAMANKAN)** [^11].
* Sumber Rute: [orientasi.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/orientasi/orientasi.routes.ts#L7-L10)

* `GET /api/onboarding/employee/:employeeId/tasks` -> Daftar tugas orientasi pegawai.
* `POST /api/onboarding/employee/:employeeId/tasks` -> Membuat item tugas orientasi baru.
* `PUT /api/onboarding/tasks/:taskId` -> Memperbarui data/status tugas orientasi.
* `DELETE /api/onboarding/tasks/:taskId` -> Menghapus tugas orientasi.

---

### 19. Modul: pelatihan (Pelatihan & Sertifikat)
* **Base Path**: `/api/pelatihan`
* **Status Autentikasi**: **Publik (TIDAK DIAMANKAN)** [^12].
* Sumber Rute: [pelatihan.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pelatihan/pelatihan.routes.ts#L8-L10)

* `GET /api/pelatihan` -> Mendapatkan seluruh data pelatihan pegawai.
* `GET /api/pelatihan/employee/:id` -> Daftar riwayat pelatihan pegawai tertentu.
* `POST /api/pelatihan/employee/:id` -> Menambahkan data pelatihan baru beserta berkas sertifikat (.pdf/.jpg). Multipart form data dengan file field `certificate`.

---

### 20. Modul: perekrutan (Perekrutan Kandidat)
* **Base Path**: `/api/recruitment`
* **Status Autentikasi**: **Publik (TIDAK DIAMANKAN)** [^13].
* Sumber Rute: [perekrutan.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/perekrutan/perekrutan.routes.ts#L7-L11)

* `GET /api/recruitment/candidates` -> Mendapatkan seluruh data lamaran kandidat.
* `GET /api/recruitment/candidates/:id` -> Detail data kandidat.
* `POST /api/recruitment/candidates` -> Mencatat data kandidat pelamar baru.
* `PUT /api/recruitment/candidates/:id` -> Memperbarui status/data kandidat pelamar.
* `DELETE /api/recruitment/candidates/:id` -> Menghapus data kandidat pelamar.

---

### 21. Modul: notifikasi (Notifikasi & Pengingat Otomatis)
* **Base Path**: `/api/notifikasi`
* **Status Autentikasi**: **Publik (TIDAK DIAMANKAN)** [^14].
* Sumber Rute: [notifikasi.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/notifikasi/notifikasi.routes.ts#L8-L12), [pengingat.otomatis.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/notifikasi/pengingat.otomatis.routes.ts#L6-L11)

#### Rute Notifikasi (`/api/notifikasi`)
* `GET /api/notifikasi/employee/:employeeId` -> Mendapatkan semua notifikasi pegawai.
* `GET /api/notifikasi/employee/:employeeId/unread` -> Mendapatkan notifikasi yang belum dibaca.
* `POST /api/notifikasi/employee/:employeeId` -> Mengirim notifikasi manual.
* `PUT /api/notifikasi/:notificationId/read` -> Menandai notifikasi telah dibaca.
* `GET /api/notifikasi/scheduled` -> Daftar notifikasi terjadwal.

#### Rute Pengingat Otomatis (`/api/notifikasi/automated`)
* `POST /api/notifikasi/automated/contracts/expiring` -> Memicu kirim pengingat kontrak habis.
* `POST /api/notifikasi/automated/leave/approvals` -> Memicu kirim notifikasi persetujuan cuti.
* `POST /api/notifikasi/automated/payroll/releases` -> Memicu notifikasi slip gaji dirilis.
* `POST /api/notifikasi/automated/performance/reviews` -> Memicu notifikasi siklus evaluasi kerja.
* `POST /api/notifikasi/automated/birthdays` -> Memicu ucapan selamat ulang tahun pegawai.
* `POST /api/notifikasi/automated/all` -> Menjalankan seluruh pemicu di atas sekaligus.

---

### 22. Modul: performance-management (Orkestrasi Siklus Kinerja)
* **Base Path**: `/api/performance-cycle`
* **Status Autentikasi**: Wajib Token JWT & Role Manager (`authenticateToken`, `restrictTo('admin', 'pimpinan', 'supervisor')`).
* Sumber Rute: [performance-cycle.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/performance-management/orchestration/performance-cycle.routes.ts#L10-L13)

* `POST /api/performance-cycle/open` -> Membuka periode penilaian kinerja baru. Request body: `{ "period": "2026-Q3", "startDate": "2026-07-01", "endDate": "2026-09-30" }`.
* `POST /api/performance-cycle/sync-kpi` -> Sinkronisasi data log harian WLA pegawai yang disetujui ke target realisasi KPI periode tersebut.
* `POST /api/performance-cycle/create-reviews` -> Membuat batch penilaian kinerja otomatis untuk seluruh pegawai aktif di periode terpilih.
* `POST /api/performance-cycle/finalize` -> Menutup periode evaluasi kinerja secara permanen (kunci nilai akhir).

---

### 23. Modul: dashboard (Agregasi Data Dashboard)
* **Base Path**: `/api/dashboard`
* **Status Autentikasi**: **Publik (TIDAK DIAMANKAN)**, kecuali rute `/supervisor` [^15].
* Sumber Rute: [dashboard.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/dashboard/dashboard.routes.ts#L8-L11)

* `GET /api/dashboard/admin` -> Mendapatkan data metrik dashboard admin.
* `GET /api/dashboard/supervisor` -> Mendapatkan data bawahan untuk dashboard supervisor. **(Wajib Token JWT)**.
* `GET /api/dashboard/employee/:employeeId` -> Statistik performa & kehadiran untuk dashboard pegawai.
* `GET /api/dashboard/recent-activity` -> Daftar aktivitas log terbaru sistem.

---

### 24. Modul: company-settings (Pengaturan Profil Perusahaan)
* **Base Path**: `/api/company-settings`
* **Status Autentikasi**: **Publik (TIDAK DIAMANKAN)** [^16].
* Sumber Rute: [company-settings.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/company-settings/company-settings.routes.ts#L8-L9)

* `GET /api/company-settings` -> Mendapatkan profil instansi dan konfigurasi logo aktif.
* `PUT /api/company-settings` -> Memperbarui profil instansi dan logo (.jpg/.png). Multipart form data dengan file field `logo`.

---

### 25. Modul: activity-library (Katalog Aktivitas Kerja)
* **Base Path**: `/api/activity-library`
* **Status Autentikasi**: Wajib Token JWT (`authenticateToken`).
* Sumber Rute: [activity-library.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/activity-library/activity-library.routes.ts#L9-L15)

* `GET /api/activity-library` -> Mendapatkan seluruh katalog aktivitas acuan (Query: `position`, `department`, `category`).
* `GET /api/activity-library/positions` -> Daftar jabatan unik yang ada di katalog.
* `GET /api/activity-library/position/:position` -> Mendapatkan aktivitas khusus jabatan tertentu.
* `GET /api/activity-library/:id` -> Detail aktivitas.
* `POST /api/activity-library` -> Menambahkan aktivitas baru ke katalog. (Role: `admin`/`pimpinan`).
* `PUT /api/activity-library/:id` -> Mengubah data aktivitas katalog. (Role: `admin`/`pimpinan`).
* `DELETE /api/activity-library/:id` -> Menghapus aktivitas dari katalog. (Role: `admin`/`pimpinan`).

---

### 26. Modul: audit-log (Jejak Aktivitas Sistem)
* **Base Path**: `/api/audit-logs`
* **Status Autentikasi**: Wajib Token JWT & Role Manager (`authenticateToken`, `restrictTo('admin', 'pimpinan')`).
* Sumber Rute: [audit-log.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/audit-log/audit-log.routes.ts#L8-L9)

* `GET /api/audit-logs` -> Menampilkan daftar log audit aktivitas sistem (Query: `module`, `action`, `userId`, `device`, `startDate`, `endDate`, `search`, `limit`).
* `POST /api/audit-logs` -> Menulis data log audit baru secara manual ke database.

---

### 27. Modul: changelog (Catatan Perubahan Versi Aplikasi)
* **Base Path**: `/api/changelog`
* **Status Autentikasi**: Wajib Token JWT & Role Manager (`authenticateToken`, `restrictTo('admin', 'pimpinan')`).
* Sumber Rute: [changelog.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/changelog/changelog.routes.ts#L8-L9)

* `GET /api/changelog` -> Mendapatkan daftar seluruh catatan pembaruan aplikasi.
* `POST /api/changelog` -> Membuat entri catatan pembaruan baru. Request body: `release_tag`, `module`, `type`, `description`, `impacted_files`.

---

### 28. Modul: holidays (Hari Libur Nasional)
* **Base Path**: `/api/holidays`
* **Status Autentikasi**: Wajib Token JWT (`authenticateToken`).
* Sumber Rute: [holidays.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/holidays/holidays.routes.ts#L9-L12)

* `GET /api/holidays` -> Daftar seluruh libur nasional aktif.
* `POST /api/holidays` -> Menambah tanggal libur baru. Request body: `{ "tanggal": "YYYY-MM-DD", "deskripsi": "Hari Raya" }` (Role: `admin`/`pimpinan`).
* `PUT /api/holidays/:id` -> Memperbarui deskripsi/tanggal libur (Role: `admin`/`pimpinan`).
* `DELETE /api/holidays/:id` -> Menghapus hari libur nasional (Role: `admin`/`pimpinan`).

---

### 29. Modul: jabatan (Struktur Jabatan Organisasi)
* **Base Path**: `/api/jabatan`
* **Status Autentikasi**: **Publik (TIDAK DIAMANKAN)** [^17].
* Sumber Rute: [jabatan.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/jabatan/jabatan.routes.ts#L7-L17)

* `GET /api/jabatan/tree` -> Mendapatkan visualisasi struktur hierarki jabatan pohon.
* `GET /api/jabatan/tree-with-employees` -> Hierarki jabatan beserta daftar pegawai yang mendudukinya.
* `GET /api/jabatan/level/:level` -> Menampilkan jabatan berdasarkan tingkatan eselon (level numerik).
* `GET /api/jabatan/subordinates/:pegawaiId` -> Menampilkan seluruh bawahan langsung/tidak langsung dari pegawai (Query: `recursive=true`).
* `GET /api/jabatan` -> Daftar seluruh data jabatan datar.
* `GET /api/jabatan/:id` -> Mendapatkan detail jabatan tunggal.
* `POST /api/jabatan` -> Menambah jabatan baru di organisasi.
* `PUT /api/jabatan/:id` -> Mengubah relasi parent/nama jabatan.
* `DELETE /api/jabatan/:id` -> Menghapus jabatan dari organisasi.

---

## 📝 Catatan Kaki (Footnotes - Verifikasi Dokumen Lama)

[^1]: **KLAIM KONTRAKTIF**: Dokumen [AGENTS.md](file:///opt/portal-sdmv3/AGENTS.md) mengklaim *"Strict input validation (express-validator everywhere)"*. Investigasi kode membuktikan **TIDAK ADA** penggunaan `express-validator` di modul manapun di repositori. Validasi dikerjakan manual di controller.

[^2]: **KLAIM KONTRAKTIF**: Dokumen [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (Bagian Pengguna) dan [AGENTS.md](file:///opt/portal-sdmv3/AGENTS.md) mengklaim *"JWT auth required for all backend routes"*. Rute `/api/users/*` terbukti **TIDAK MEMILIKI** middleware `authenticateToken` sama sekali di rutenya ([pengguna.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pengguna/pengguna.routes.ts#L8-L14)).

[^3]: **KLAIM KONTRAKTIF**: Dokumen [AGENTS.md](file:///opt/portal-sdmv3/AGENTS.md) and [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) mengklaim akses pegawai dibatasi ketat JWT. Aktual rute pegawai ([pegawai.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pegawai/pegawai.routes.ts#L9-L20)) terbuka sepenuhnya tanpa token JWT.

[^4]: **KLAIM KONTRAKTIF**: Dokumen [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (Bagian Penggajian) menyatakan admin-only untuk status penggajian. Rute lain di penggajian ([penggajian.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/penggajian/penggajian.routes.ts#L8-L16)) terbuka untuk publik, termasuk kalkulasi bulanan masal (`POST /run`).

[^5]: **KLAIM KONTRAKTIF**: Rute kontrak ([kontrak.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kontrak/kontrak.routes.ts#L8-L18)) tidak memiliki pengamanan JWT, padahal mengelola arsip fail kerja pegawai.

[^6]: **KLAIM KONTRAKTIF**: Rute backup ([backup.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/backup/backup.routes.ts#L7-L10)) tidak memiliki pengamanan JWT, padahal file database mentah dapat diunduh bebas lewat rute `/download/:filename`.

[^7]: **KLAIM KONTRAKTIF**: Dokumen [GEMINI.md](file:///opt/portal-sdmv3/GEMINI.md) (Bagian Laporan) mengklaim integrasi query aman. Seluruh endpoint rekap & ekspor Excel ([laporan.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/laporan/laporan.routes.ts#L9-L27)) terbukti terbuka publik tanpa JWT.

[^8]: **KLAIM KONTRAKTIF**: Rute absensi ([absensi.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/absensi/absensi.routes.ts#L6-L32)) terbuka publik tanpa `authenticateToken`.

[^9]: **KLAIM KONTRAKTIF**: Rute cuti ([cuti.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/cuti/cuti.routes.ts#L22-L30)) terbuka publik tanpa `authenticateToken`.

[^10]: **KLAIM KONTRAKTIF**: Rute template KPI ([kpiTemplate.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/kpi/kpiTemplate.routes.ts#L8-L39)) terbukti terbuka publik tanpa token JWT.

[^11]: **KLAIM KONTRAKTIF**: Rute orientasi onboarding ([orientasi.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/orientasi/orientasi.routes.ts#L7-L10)) terbuka publik tanpa `authenticateToken`.

[^12]: **KLAIM KONTRAKTIF**: Rute pelatihan ([pelatihan.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/pelatihan/pelatihan.routes.ts#L8-L10)) terbuka publik tanpa `authenticateToken`.

[^13]: **KLAIM KONTRAKTIF**: Rute perekrutan ([perekrutan.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/perekrutan/perekrutan.routes.ts#L7-L11)) terbuka publik tanpa `authenticateToken`.

[^14]: **KLAIM KONTRAKTIF**: Rute notifikasi ([notifikasi.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/notifikasi/notifikasi.routes.ts#L8-L12)) terbuka publik tanpa `authenticateToken`.

[^15]: **KLAIM KONTRAKTIF**: Rute dashboard ([dashboard.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/dashboard/dashboard.routes.ts#L8-L11)) terbuka publik tanpa JWT, kecuali `/supervisor` yang memiliki middleware `authenticateToken`.

[^16]: **KLAIM KONTRAKTIF**: Rute pengaturan perusahaan ([company-settings.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/company-settings/company-settings.routes.ts#L8-L9)) terbuka publik tanpa JWT.

[^17]: **KLAIM KONTRAKTIF**: Rute jabatan ([jabatan.routes.ts](file:///opt/portal-sdmv3/apps/backend/src/modules/jabatan/jabatan.routes.ts#L7-L17)) terbuka publik tanpa JWT.
