# Kebijakan Cuti — Portal SDM

> **Acuan Regulasi:** UU No. 13/2003 tentang Ketenagakerjaan, UU No. 11/2020 tentang Cipta Kerja
> Berlaku untuk: Seluruh karyawan aktif | Disetujui oleh: Pimpinan Perusahaan

---

## 1. Jenis Cuti

| # | Jenis Cuti | Jatah/Tahun | Syarat | Referensi Hukum |
|---|---|---|---|---|
| 1 | **Cuti Tahunan** | Sesuai pengaturan perusahaan (min. 12 hari) | Setelah 12 bulan kerja terus-menerus | UU 13/2003 Pasal 79 Ayat 2c |
| 2 | **Cuti Sakit** | Sesuai diagnosa dokter | Wajib lampirkan surat dokter jika >1 hari | UU 13/2003 Pasal 93 Ayat 2a |
| 3 | **Cuti Melahirkan** | 3 bulan | 1.5 bulan sebelum + 1.5 bulan sesudah melahirkan | UU 13/2003 Pasal 82 Ayat 1 |
| 4 | **Cuti Pribadi** | Sesuai ketentuan | Pernikahan (3 hari), anak/istri/suami meninggal (2 hari), dll. | UU 13/2003 Pasal 93 Ayat 4 |
| 5 | **Cuti Bersama** | Ditentukan pemerintah/perusahaan | Mengurangi saldo cuti tahunan | SKB Menteri |

## 2. Prosedur Pengajuan Cuti

```
┌─────────────────────────────────────────────────────────┐
│ 1. Pegawai mengajukan cuti via Portal SDM               │
│    └─ Menu: Cuti Saya → Ajukan Cuti Baru                │
│ 2. Isi formulir: jenis cuti, tanggal, alasan             │
│ 3. Sistem cek saldo cuti (otomatis dari company_settings)│
│ 4. Atasan menerima notifikasi untuk approval              │
│ 5. Atasan menyetujui / menolak (dengan alasan)            │
│ 6. Pegawai menerima notifikasi hasil                      │
│ 7. Saldo cuti diperbarui otomatis di sistem               │
└─────────────────────────────────────────────────────────┘
```

## 3. Ketentuan Jatah Cuti

| Ketentuan | Aturan |
|---|---|
| **Jatah cuti tahunan** | Diatur di Pengaturan Perusahaan (`company_settings.annualLeaveQuota`) |
| **Minimum jatah** | 12 hari kerja per tahun (UU 13/2003) |
| **Prorata** | Pegawai masuk di tengah tahun mendapat prorata (bulan kerja / 12 × jatah) |
| **Carry-over** | Saldo cuti hangus di akhir tahun kecuali ada kebijakan khusus |
| **Cuti bersama** | Mengurangi saldo cuti tahunan |
| **Upah selama cuti** | Cuti tahunan = gaji penuh; Cuti sakit = gaji sesuai Pasal 93 |

## 4. Ketentuan Upah Selama Sakit Berkepanjangan (Pasal 93 Ayat 3)

| Periode | Besaran Upah |
|---|---|
| 4 bulan pertama | 100% dari upah |
| 4 bulan kedua | 75% |
| 4 bulan ketiga | 50% |
| Bulan selanjutnya | 25% (sampai PHK) |

## 5. Konfigurasi di Sistem

Jatah cuti dikelola di menu **Pengaturan → Pengaturan Perusahaan**:
- `annualLeaveQuota` — Jatah cuti tahunan (default: 12)
- `sickLeaveQuota` — Jatah cuti sakit (default: 14)

---

*Dokumen ini merupakan kebijakan resmi perusahaan terkait cuti karyawan dan berlaku sampai ada perubahan.*
