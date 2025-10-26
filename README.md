# QWEN - HRMS (Human Resource Management System)

Sistem Manajemen Sumber Daya Manusia yang komprehensif untuk mengelola karyawan, cuti, penggajian, dan kinerja.

![QWEN HRMS Dashboard](https://placehold.co/800x400/1e3a8a/white?text=QWEN+HRMS+Dashboard)

## Fitur Utama

- **Manajemen Karyawan**: Profil lengkap karyawan dengan riwayat pendidikan dan pekerjaan
- **Sistem Cuti**: Pengajuan dan persetujuan cuti dengan pelacakan saldo cuti
- **Presensi**: Sistem absensi digital dengan pelacakan jam masuk/keluar
- **Penggajian**: Perhitungan gaji otomatis dengan komponen pendapatan dan potongan
- **Penilaian Kinerja**: Sistem penilaian kinerja berbasis KPI dengan laporan
- **Dasbor Eksekutif**: Tampilan ringkasan eksekutif dengan metrik penting
- **Laporan**: Laporan komprehensif untuk semua aspek manajemen SDM
- **Notifikasi**: Sistem notifikasi otomatis untuk peristiwa penting

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

### Responsivitas
- Layout fleksibel yang beradaptasi dengan ukuran layar
- Menu slide-over untuk perangkat mobile
- Ukuran font dan spasi yang optimal untuk semua perangkat

## Struktur Basis Data

Sistem menggunakan SQLite dengan tabel-tabel berikut:
- `users`: Informasi pengguna untuk autentikasi
- `employees`: Data karyawan lengkap
- `attendance`: Catatan presensi harian
- `leave_requests`: Permintaan cuti karyawan
- `payrolls`: Informasi penggajian
- `performance_reviews`: Penilaian kinerja

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
- `POST /payrolls/run` — proses penggajian bulanan

### Performance
- `GET /performance-reviews?employeeId=&period=YYYY-MM` — daftar penilaian
- `POST /performance-reviews` — buat penilaian baru

## Keamanan

- Password di-hash menggunakan bcrypt
- Autentikasi berbasis token JWT
- Validasi input di sisi server
- Perlindungan terhadap serangan umum (XSS, CSRF)
- Penggunaan prepared statements untuk mencegah SQL injection

## Dokumentasi Tambahan

- [QWEN.md](docs/QWEN.md) - Dokumentasi arsitektur lengkap
- [DESIGN_SYSTEM.md](frontend/DESIGN_SYSTEM.md) - Panduan sistem desain
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Ringkasan implementasi

## Kontribusi

1. Fork repositori ini
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## Lisensi

Proyek ini dilisensikan di bawah MIT License - lihat file LICENSE untuk detail lebih lanjut.

## Kontak

Untuk pertanyaan atau dukungan, silakan hubungi tim pengembang.