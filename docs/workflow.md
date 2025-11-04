
# Alur Kerja Aplikasi HRMS

Dokumen ini menjelaskan alur kerja utama (workflow) dari beberapa fitur kunci dalam aplikasi HRMS berdasarkan arsitektur yang ada.

## 1. Alur Kerja: Manajemen Pegawai (Admin)

Alur ini menjelaskan bagaimana seorang admin menambahkan data pegawai baru ke dalam sistem.

```mermaid
sequenceDiagram
    participant Admin as Admin (Frontend)
    participant API as Backend API
    participant DB as Database (sqlite)

    Admin->>API: POST /api/pegawai (data pegawai baru)
    activate API

    API->>API: Validasi input data (NIP, nama, email, dll.)
    alt Input tidak valid
        API-->>Admin: Response 400 (Bad Request)
    else Input valid
        API->>DB: INSERT INTO pegawai (...) VALUES (...)
        activate DB
        DB-->>API: Return lastID (ID pegawai baru)
        deactivate DB
        
        API-->>Admin: Response 201 (Created) dengan data pegawai baru
    end
    deactivate API
```

## 2. Alur Kerja: Absensi (Pegawai)

Alur ini menunjukkan proses saat seorang pegawai melakukan *clock-in*.

```mermaid
sequenceDiagram
    participant Pegawai as Pegawai (Frontend)
    participant API as Backend API
    participant DB as Database (sqlite)

    Pegawai->>API: POST /api/absensi/clock-in (id_pegawai)
    activate API

    API->>DB: SELECT * FROM absensi WHERE id_pegawai = ? AND tanggal = CURRENT_DATE
    activate DB
    DB-->>API: Return data absensi hari ini (jika ada)
    deactivate DB

    alt Pegawai sudah clock-in hari ini
        API-->>Pegawai: Response 409 (Conflict) - "Anda sudah clock-in hari ini"
    else Pegawai belum clock-in
        API->>API: Hitung keterlambatan (jika ada)
        API->>DB: INSERT INTO absensi (id_pegawai, tanggal, jam_masuk, ...) VALUES (...)
        activate DB
        DB-->>API: Return data absensi yang baru dibuat
        deactivate DB
        
        API-->>Pegawai: Response 200 (OK) - "Clock-in berhasil"
    end
    deactivate API
```

## 3. Alur Kerja: Pengajuan Cuti (Pegawai)

Alur ini menjelaskan bagaimana pegawai mengajukan cuti melalui sistem.

```mermaid
sequenceDiagram
    participant Pegawai as Pegawai (Frontend)
    participant API as Backend API
    participant DB as Database (sqlite)

    Pegawai->>API: POST /api/cuti (id_pegawai, tgl_mulai, tgl_selesai, alasan)
    activate API

    API->>API: Validasi jatah cuti & tanggal
    API->>DB: INSERT INTO cuti (id_pegawai, ..., status_pengajuan) VALUES (..., 'menunggu')
    activate DB
    DB-->>API: Return data pengajuan cuti
    deactivate DB

    API->>API: Trigger notifikasi ke atasan (opsional)
    API-->>Pegawai: Response 201 (Created) - "Pengajuan cuti berhasil dikirim"
    deactivate API
```

## 4. Alur Kerja: Persetujuan Cuti (Manajer/Atasan)

Alur ini menunjukkan bagaimana seorang atasan menyetujui atau menolak pengajuan cuti.

```mermaid
sequenceDiagram
    participant Atasan as Atasan (Frontend)
    participant API as Backend API
    participant DB as Database (sqlite)

    Atasan->>API: PUT /api/cuti/:id_cuti (status: 'disetujui'/'ditolak')
    activate API

    API->>DB: UPDATE cuti SET status_pengajuan = ? WHERE id_cuti = ?
    activate DB
    DB-->>API: Return jumlah baris yang diupdate
    deactivate DB

    alt Jika disetujui
        API->>DB: UPDATE absensi (buat record cuti di tabel absensi)
    end

    API->>API: Trigger notifikasi ke pegawai (opsional)
    API-->>Atasan: Response 200 (OK) - "Status pengajuan berhasil diubah"
    deactivate API
```

## 5. Alur Kerja: Proses Penggajian (Admin)

Alur ini menggambarkan proses kompleks saat admin menjalankan penggajian bulanan.

```mermaid
graph TD
    A[Admin klik "Jalankan Gaji" untuk Periode YYYY-MM] --> B{POST /api/penggajian/run};
    B --> C[Service Penggajian];
    C --> D{Ambil semua pegawai aktif};
    D --> E[Loop untuk setiap pegawai];
    E --> F{Hitung komponen gaji};
    F --> G[Ambil data absensi (kehadiran, lembur)];
    F --> H[Ambil data tunjangan];
    F --> I[Ambil data potongan (pinjaman, pajak)];
    G & H & I --> J{Kalkulasi Gaji Bersih};
    J --> K{Simpan hasil ke tabel `penggajian`};
    K --> E;
    E --> L[Selesai];
    L --> M{Response ke Admin: "Penggajian selesai"};
```
