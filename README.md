# PORTALS-SDM - HRMS (Human Resource Management System)

Sistem Manajemen Sumber Daya Manusia yang komprehensif untuk mengelola karyawan, absensi, cuti, penggajian, kinerja, pelatihan, rekrutmen, kontrak, dan analitik.

![PORTALS-SDM HRMS Dashboard](https://placehold.co/800x400/1e3a8a/white?text=PORTALS-SDM+HRMS+Dashboard)

## Fitur Utama

- **Manajemen Karyawan**: Profil lengkap karyawan dengan riwayat pendidikan dan pekerjaan
- **Sistem Absensi**: Sistem absensi digital dengan pelacakan jam masuk/keluar
- **Sistem Cuti**: Pengajuan dan persetujuan cuti dengan pelacakan saldo cuti
- **Penggajian**: Perhitungan gaji otomatis dengan komponen pendapatan dan potongan
- **Penilaian Kinerja**: Sistem penilaian kinerja berbasis KPI dengan laporan
- **Manajemen Pelatihan**: Pelacakan pelatihan dan sertifikasi karyawan
- **Manajemen Kontrak & Jabatan**: Pengelolaan kontrak kerja dan riwayat jabatan
- **Rekrutmen & Onboarding**: Sistem rekrutmen dan onboarding karyawan baru
- **Dasbor Analitik**: Tampilan ringkasan eksekutif dengan metrik penting
- **Laporan & Analitik**: Laporan komprehensif dengan builder laporan kustom
- **Notifikasi & Pengingat Otomatis**: Sistem notifikasi otomatis untuk peristiwa penting

## Arsitektur

QWEN HRMS adalah sistem modular full-stack dengan arsitektur sebagai berikut:

### Frontend
- **Teknologi**: React + TypeScript + Vite + Tailwind CSS
- **Pola**: Arsitektur berbasis fitur (`features/*`)
- **Routing**: React Router v6+
- **UI Library**: Komponen UI yang dapat digunakan kembali di `shared/components/ui`
- **State Management**: Context API dan custom hooks

### Backend
- **Teknologi**: Node.js + Express + SQLite
- **Pola**: Arsitektur berlapis (Controller → Service → Repository → DB)
- **Modularitas**: Modul berbasis domain (pegawai, kehadiran, cuti, penggajian, kinerja)
- **Keamanan**: Autentikasi JWT, validasi input, sanitasi data

### Struktur Proyek
```
sistem-manajemen-sdm/
├── apps/
│   ├── backend/           # Node/Express API (SQLite)
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
│   │   ├── app.ts
│   │   └── server.ts
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
├── docs/
│   └── QWEN.md (dokumentasi arsitektur)
├── .env
└── README.md (file ini)
```

## Teknologi

### Frontend
- React dengan TypeScript
- Tailwind CSS untuk styling
- React Router untuk navigasi
- Vite sebagai build tool
- Arsitektur komponen terorganisasi berdasarkan fitur

### Backend
- Node.js dengan Express
- SQLite sebagai database
- bcrypt untuk hashing password
- jsonwebtoken untuk autentikasi
- express-validator untuk validasi input
- Arsitektur MVC dengan service layer

## Instalasi

1. Clone repositori ini
   ```bash
   git clone <repository-url>
   cd sistem-manajemen-sdm
   ```

2. Install dependensi backend:
   ```bash
   cd apps/backend
   npm install
   ```

3. Install dependensi frontend:
   ```bash
   cd apps/frontend
   npm install
   ```

## Menjalankan Aplikasi

### Backend
```bash
cd apps/backend
npm run dev
```

Server akan berjalan di `http://localhost:3333`

### Frontend
```bash
cd apps/frontend
npm run dev
```

Aplikasi frontend akan tersedia di `http://localhost:5173`

## Modul yang Telah Diimplementasikan

### ✅ Modul Inti HRMS
1. **Master Data Pegawai** - Manajemen data karyawan lengkap
2. **Absensi & Kehadiran** - Sistem absensi digital dengan pelacakan kehadiran
3. **Cuti & Izin** - Pengajuan dan persetujuan cuti dengan pelacakan saldo
4. **Penggajian** - Perhitungan gaji otomatis dengan komponen pendapatan dan potongan
5. **Penilaian Kinerja** - Sistem penilaian kinerja berbasis KPI
6. **Pelatihan** - Manajemen pelatihan dan sertifikasi karyawan
7. **Manajemen Kontrak & Jabatan** - Pengelolaan kontrak kerja dan riwayat jabatan
8. **Rekrutmen & Onboarding** - Sistem rekrutmen dan onboarding karyawan baru
9. **Laporan & Analitik** - Laporan komprehensif dengan builder laporan kustom
10. **Notifikasi & Pengingat Otomatis** - Sistem notifikasi otomatis untuk peristiwa penting

### 🔄 Modul yang Ditingkatkan
- **Dasbor Analitik** - Dashboard eksekutif dengan metrik real-time dan visualisasi data
- **Sistem Notifikasi** - Ditingkatkan dengan pengingat otomatis dan multi-channel delivery
- **Laporan & Analitik** - Diperluas dengan fitur analitik tingkat lanjut dan ekspor data

## Desain Modern

Aplikasi ini menggunakan desain modern dengan:

### Palet Warna
- **Utama**: Biru Tua (`#1e3a8a`) - Untuk elemen navigasi dan header
- **Aksen**: Oranye (`#f97316`) - Untuk tombol utama dan elemen interaktif
- **Netral**: Abu-abu terang hingga gelap untuk teks dan latar belakang

### Komponen UI
- **Header**: Navigasi responsif dengan menu mobile
- **Sidebar**: Menu navigasi permanen untuk desktop
- **Kartu Statistik**: Tampilan metrik penting dengan ikon
- **Formulir**: Elemen input yang konsisten dan mudah digunakan
- **Tabel**: Tampilan data yang dapat diurutkan dan difilter
- **Dasbor Analitik**: Visualisasi data dengan grafik dan metrik real-time

### Responsivitas
- Layout fleksibel yang beradaptasi dengan ukuran layar
- Menu slide-over untuk perangkat mobile
- Ukuran font dan spasi yang optimal untuk semua perangkat

## Struktur Basis Data

Sistem menggunakan SQLite dengan tabel-tabel berikut:
- `users`: Informasi pengguna untuk autentikasi
- `pegawai`: Data karyawan lengkap
- `absensi`: Catatan presensi harian
- `permintaan_cuti`: Permintaan cuti karyawan
- `penggajian`: Informasi penggajian
- `penilaian_kinerja`: Penilaian kinerja
- `pelatihan`: Riwayat pelatihan karyawan
- `kontrak`: Kontrak kerja karyawan
- `riwayat_jabatan`: Riwayat perubahan jabatan
- `kandidat`: Data kandidat rekrutmen
- `tugas_orientasi`: Tugas orientasi karyawan baru
- `notifikasi`: Sistem notifikasi

## API Endpoints

### Auth
- `POST /auth/login` — login pengguna
- `POST /auth/refresh` — perbarui token

### Employee
- `GET /employees` — daftar karyawan
- `GET /employees/:id` — detail karyawan
- `POST /employees` — buat karyawan baru
- `PUT /employees/:id` — perbarui karyawan
- `DELETE /employees/:id` — hapus karyawan

### Attendance
- `POST /attendance/clock-in` — absen masuk
- `POST /attendance/clock-out` — absen pulang
- `GET /attendance?employeeId=&month=YYYY-MM` — rekap kehadiran

### Leave
- `GET /leave-requests` — daftar permintaan cuti
- `POST /leave-requests` — buat permintaan cuti baru
- `PUT /leave-requests/:id` — setujui/tolak permintaan

### Payroll
- `GET /payrolls?period=YYYY-MM` — rekap penggajian
- `POST /payrolls` — buat penggajian baru
- `PUT /payrolls/:id` — perbarui penggajian
- `DELETE /payrolls/:id` — hapus penggajian
- `POST /payrolls/:id/components` — tambah komponen gaji

### Performance
- `GET /performance-reviews` — daftar penilaian kinerja
- `GET /performance-reviews/:id` — detail penilaian kinerja
- `POST /performance-reviews` — buat penilaian baru
- `PUT /performance-reviews/:id` — perbarui penilaian
- `PUT /performance-reviews/:id/feedback` — tambah feedback
- `DELETE /performance-reviews/:id` — hapus penilaian

### Training
- `GET /pelatihan` — daftar pelatihan
- `GET /pelatihan/employee/:id` — pelatihan untuk karyawan tertentu
- `POST /pelatihan/employee/:id` — tambah pelatihan untuk karyawan

### Contracts
- `GET /contracts` — daftar kontrak
- `GET /contracts/:id` — detail kontrak
- `GET /contracts/employee/:employeeId` — kontrak untuk karyawan tertentu
- `POST /contracts` — buat kontrak baru
- `PUT /contracts/:id` — perbarui kontrak
- `DELETE /contracts/:id` — hapus kontrak

### Recruitment
- `GET /recruitment/candidates` — daftar kandidat
- `GET /recruitment/candidates/:id` — detail kandidat
- `POST /recruitment/candidates` — tambah kandidat baru
- `PUT /recruitment/candidates/:id` — perbarui kandidat
- `DELETE /recruitment/candidates/:id` — hapus kandidat

### Reports
- `GET /reports/employees` — laporan karyawan
- `GET /reports/attendance` — laporan absensi
- `GET /reports/payroll` — laporan penggajian
- `GET /reports/leave` — laporan cuti
- `GET /reports/performance` — laporan kinerja
- `GET /reports/turnover` — laporan turnover
- `GET /reports/demographics` — laporan demografi
- `GET /reports/employees/comprehensive` — laporan karyawan komprehensif
- `GET /reports/attendance/analytics` — analitik absensi
- `GET /reports/payroll/analytics` — analitik penggajian

### Dashboard
- `GET /dashboard/admin` — data dasbor admin
- `GET /dashboard/employee/:employeeId` — data dasbor karyawan

### Notifications
- `GET /notifikasi/employee/:employeeId` — notifikasi untuk karyawan
- `GET /notifikasi/employee/:employeeId/unread` — notifikasi belum dibaca
- `POST /notifikasi/employee/:employeeId` — buat notifikasi baru
- `PUT /notifikasi/:notificationId/read` — tandai notifikasi sudah dibaca
- `GET /notifikasi/scheduled` — notifikasi terjadwal

## Keamanan

- Password di-hash menggunakan bcrypt
- Autentikasi berbasis token JWT
- Validasi input di sisi server
- Perlindungan terhadap serangan umum (XSS, CSRF)
- Penggunaan prepared statements untuk mencegah SQL injection
- Role-based access control (RBAC) untuk otorisasi
- Audit logging untuk pelacakan aktivitas

## Dokumentasi Tambahan

- [QWEN.md](docs/QWEN.md) - Dokumentasi arsitektur lengkap
- [DESIGN_SYSTEM.md](frontend/DESIGN_SYSTEM.md) - Panduan sistem desain
- [FINAL_IMPLEMENTATION_STATUS.md](FINAL_IMPLEMENTATION_STATUS.md) - Status implementasi akhir
- [apps/backend/docs/complete-hrms-enhancement-summary.md](apps/backend/docs/complete-hrms-enhancement-summary.md) - Ringkasan peningkatan HRMS lengkap
- [apps/backend/IMPLEMENTATION_SUMMARY.md](apps/backend/IMPLEMENTATION_SUMMARY.md) - Ringkasan implementasi backend
- [apps/backend/docs/laporan-module.md](apps/backend/docs/laporan-module.md) - Dokumentasi modul laporan
- [apps/backend/docs/notifikasi-otomatis-module.md](apps/backend/docs/notifikasi-otomatis-module.md) - Dokumentasi modul notifikasi otomatis
- [apps/backend/docs/dashboard-module.md](apps/backend/docs/dashboard-module.md) - Dokumentasi modul dashboard

## Kontribusi

1. Fork repositori ini
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## Status Implementasi

Sistem HRMS ini telah **SELESAI DIIMPLEMENTASIKAN** sepenuhnya dengan semua modul yang direncanakan berhasil dikembangkan dan diintegrasikan. Rincian implementasi dapat dilihat di:

- [FINAL_IMPLEMENTATION_STATUS.md](FINAL_IMPLEMENTATION_STATUS.md) - Status implementasi akhir
- [apps/backend/IMPLEMENTATION_SUMMARY.md](apps/backend/IMPLEMENTATION_SUMMARY.md) - Ringkasan implementasi backend

## Lisensi

Proyek ini dilisensikan di bawah MIT License - lihat file LICENSE untuk detail lebih lanjut.

## Kontak

Untuk pertanyaan atau dukungan, silakan hubungi tim pengembang.#   p o r t a l - s d m n e x t 
 
 
