1. Tabel Pegawai

| Kolom                | Tipe      | Keterangan                |
| -------------------- | --------- | ------------------------- |
| id                   | TEXT (PK) | ID unik pegawai           |
| name                 | TEXT      | Nama lengkap              |
| nip                  | TEXT      | Nomor Induk Pegawai       |
| position             | TEXT      | Jabatan                   |
| pangkat              | TEXT      | Pangkat/golongan pegawai  |
| golongan             | TEXT      | Golongan                  |
| department           | TEXT      | Departemen tempat bekerja |
| joinDate             | TEXT      | Tanggal masuk             |
| avatarUrl            | TEXT      | Foto profil               |
| jenis_kelamin        | TEXT      | Jenis kelamin             |
| leaveBalance         | INTEGER   | Sisa cuti                 |
| isActive             | INTEGER   | Status aktif (1=aktif)    |
| address              | TEXT      | Alamat                    |
| phone                | TEXT      | Nomor telepon             |
| pob                  | TEXT      | Tempat lahir              |
| dob                  | TEXT      | Tanggal lahir             |
| religion             | TEXT      | Agama                     |
| maritalStatus        | TEXT      | Status perkawinan         |
| numberOfChildren     | INTEGER   | Jumlah anak               |
| educationHistory     | TEXT      | Riwayat pendidikan        |
| workHistory          | TEXT      | Riwayat pekerjaan         |
| trainingCertificates | TEXT      | Sertifikat pelatihan      |
| payrollInfo          | TEXT      | Informasi gaji            |
| email                | TEXT      | Email                     |
| statusKaryawan       | TEXT      | Default `'aktif'`         |
| tanggalKeluar        | TEXT      | Jika resign               |
| createdAt            | DATETIME  | Timestamp pembuatan       |

2. Tabel Pengguna
| Kolom      | Tipe                   | Keterangan                  |
| ---------- | ---------------------- | --------------------------- |
| id         | TEXT (PK)              |                             |
| name       | TEXT                   |                             |
| email      | TEXT (unik)            |                             |
| password   | TEXT                   |                             |
| role       | TEXT                   | `'admin'` atau `'employee'` |
| employeeId | TEXT (FK → pegawai.id) |                             |
| createdAt  | DATETIME               |                             |

Relasi:
🔗 pengguna.employeeId → pegawai.id


3. Absensi

| Kolom        | Tipe                     |
| ------------ | ------------------------ |
| id           | TEXT (PK)                |
| employeeId   | TEXT (FK → pegawai.id)   |
| employeeName | TEXT                     |
| date         | TEXT                     |
| clockIn      | TEXT                     |
| clockOut     | TEXT                     |
| status       | TEXT (default `'hadir'`) |
| workDuration | TEXT                     |
| notes        | TEXT                     |
| created_at   | DATETIME                 |


4. permintaan cuti
| Kolom              | Tipe                        |
| ------------------ | --------------------------- |
| id                 | TEXT (PK)                   |
| employeeId         | TEXT (FK → pegawai.id)      |
| employeeName       | TEXT                        |
| leaveType          | TEXT                        |
| startDate          | TEXT                        |
| endDate            | TEXT                        |
| jumlahHari         | INTEGER                     |
| reason             | TEXT                        |
| status             | TEXT (default `'menunggu'`) |
| supportingDocument | TEXT                        |
| rejectionReason    | TEXT                        |
| createdAt          | DATETIME                    |


5. penggajian

| Kolom             | Tipe                   |
| ----------------- | ---------------------- |
| id                | TEXT (PK)              |
| employeeId        | TEXT (FK → pegawai.id) |
| employeeName      | TEXT                   |
| period            | TEXT                   |
| baseSalary        | REAL                   |
| incomes           | TEXT                   |
| deductions        | TEXT                   |
| totalIncome       | REAL                   |
| totalDeductions   | REAL                   |
| netSalary         | REAL                   |
| tanggalPembayaran | TEXT                   |
| createdAt         | DATETIME               |

6. penilaian_kinerja
| Kolom               | Tipe                   |
| ------------------- | ---------------------- |
| id                  | TEXT (PK)              |
| employeeId          | TEXT (FK → pegawai.id) |
| employeeName        | TEXT                   |
| period              | TEXT                   |
| reviewerName        | TEXT                   |
| reviewDate          | TEXT                   |
| overallScore        | REAL                   |
| status              | TEXT                   |
| strengths           | TEXT                   |
| areasForImprovement | TEXT                   |
| employeeFeedback    | TEXT                   |
| kpis                | TEXT                   |
| penilaiId           | TEXT                   |
| createdAt           | DATETIME               |



7. kontrak

| Kolom          | Tipe                   |
| -------------- | ---------------------- |
| id             | TEXT (PK)              |
| employeeId     | TEXT (FK → pegawai.id) |
| contractNumber | TEXT                   |
| contractType   | TEXT                   |
| startDate      | TEXT                   |
| endDate        | TEXT                   |
| status         | TEXT                   |
| contractFile   | TEXT                   |
| terms          | TEXT                   |
| salary         | REAL                   |
| notes          | TEXT                   |
| createdAt      | DATETIME               |

8. pelatihan

| Kolom            | Tipe                   |
| ---------------- | ---------------------- |
| id               | INTEGER (PK)           |
| pegawai_id       | TEXT (FK → pegawai.id) |
| nama_pelatihan   | TEXT                   |
| penyelenggara    | TEXT                   |
| tanggal_mulai    | TEXT                   |
| tanggal_selesai  | TEXT                   |
| nomor_sertifikat | TEXT                   |


9️⃣ riwayat_jabatan

| Kolom             | Tipe                   |
| ----------------- | ---------------------- |
| id                | INTEGER (PK)           |
| pegawai_id        | TEXT (FK → pegawai.id) |
| jabatan_lama      | TEXT                   |
| jabatan_baru      | TEXT                   |
| tanggal_perubahan | TEXT                   |


🔟 tugas_orientasi

| Kolom       | Tipe                   |
| ----------- | ---------------------- |
| id          | INTEGER (PK)           |
| employee_id | TEXT (FK → pegawai.id) |
| task_name   | TEXT                   |
| description | TEXT                   |
| due_date    | TEXT                   |
| completed   | INTEGER                |

📨 notifikasi

| Kolom       | Tipe                   |
| ----------- | ---------------------- |
| id          | INTEGER (PK)           |
| employee_id | TEXT (FK → pegawai.id) |
| message     | TEXT                   |
| type        | TEXT                   |
| is_read     | INTEGER                |
| created_at  | DATETIME               |


cuti

| Kolom               | Tipe                      |
| ------------------- | ------------------------- |
| id_cuti             | INTEGER (PK)              |
| id_pegawai          | INTEGER (FK → pegawai.id) |
| jenis_cuti          | TEXT                      |
| tanggal_mulai       | DATE                      |
| tanggal_selesai     | DATE                      |
| alasan              | TEXT                      |
| status_pengajuan    | TEXT                      |
| id_atasan_penyetuju | INTEGER                   |
| created_at          | DATETIME                  |


pinjaman_karyawan

| Kolom            | Tipe                      |
| ---------------- | ------------------------- |
| id_pinjaman      | INTEGER (PK)              |
| id_pegawai       | INTEGER (FK → pegawai.id) |
| tanggal_pinjaman | DATE                      |
| jumlah           | REAL                      |
| tenor            | INTEGER                   |
| cicilan_perbulan | REAL                      |
| sisa_pinjaman    | REAL                      |
| status_pinjaman  | TEXT                      |
| created_at       | DATETIME                  |


users

| Kolom      | Tipe                    |
| ---------- | ----------------------- |
| id         | INTEGER (PK)            |
| username   | TEXT                    |
| email      | TEXT                    |
| password   | TEXT                    |
| role       | TEXT                    |
| employeeId | TEXT (FK → pegawai.nip) |
| avatarUrl  | TEXT                    |
| created_at | DATETIME                |



notifications

| Kolom             | Tipe                    |
| ----------------- | ----------------------- |
| id                | TEXT (PK)               |
| employee_id       | TEXT (FK → pegawai.nip) |
| message           | TEXT                    |
| type              | TEXT                    |
| is_read           | INTEGER                 |
| created_at        | DATETIME                |
| scheduled_for     | DATETIME                |
| delivery_channel  | TEXT                    |
| related_entity    | TEXT                    |
| related_entity_id | TEXT                    |


pegawai.id ← pengguna.employeeId  
pegawai.id ← absensi.employeeId  
pegawai.id ← penggajian.employeeId  
pegawai.id ← permintaan_cuti.employeeId  
pegawai.id ← penilaian_kinerja.employeeId  
pegawai.id ← kontrak.employeeId  
pegawai.id ← pelatihan.pegawai_id  
pegawai.id ← riwayat_jabatan.pegawai_id  
pegawai.id ← tugas_orientasi.employee_id  
pegawai.id ← notifikasi.employee_id  
pegawai.id ← cuti.id_pegawai  
pegawai.id ← pinjaman_karyawan.id_pegawai  
pegawai.nip ← users.employeeId  
pegawai.nip ← notifications.employee_id
