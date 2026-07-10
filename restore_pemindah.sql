BEGIN TRANSACTION;

INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category, default_nominal) VALUES ('act-restored-a3a80b62', 'Teller', 'Operasional', 'Pemindahbukuan', 3, 'Transaksi', 'operasional', NULL);
INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category, default_nominal) VALUES ('act-restored-7412a56b', 'Staf Adm Kredit', 'Pemasaran', 'Pengecekan pemindah buku angsuran', 30, 'Tagihan', 'administrasi', NULL);
INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category, default_nominal) VALUES ('act-restored-08c2012e', 'Staf Umum', 'SDM', 'Pengecekan Pemindah buku angsuran kredit', 15, 'Operasional', 'operasional', NULL);
INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category, default_nominal) VALUES ('act-restored-dcfe78c9', 'Staf Adm Kredit', 'Pemasaran', 'pemindah buku angsuran kredit', 60, 'atm', 'operasional', NULL);
INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category, default_nominal) VALUES ('act-restored-8be4db57', 'Staf Umum', 'SDM', 'cek Pemindah buku Siltap pamong', 60, 'atm', 'operasional', NULL);
INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category, default_nominal) VALUES ('act-restored-3ee4d00d', 'Kasubid Adminitrasi Kredit', 'Pemasaran', 'Cek Pemindah buku Angsuran', 30, 'atm', 'operasional', NULL);
INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category, default_nominal) VALUES ('act-restored-06507468', 'Kasubid Pembinaan Nasabah', 'Pemasaran', 'Penangganan Pemindah Bukuan', 2, 'atm', 'operasional', NULL);
INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category, default_nominal) VALUES ('act-restored-817975ae', 'KABID Dana Dan Pelayanan', 'Operasional', 'Pemindahbukuan setoran tabungan', 5, 'Transaksi', 'operasional', NULL);
INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category, default_nominal) VALUES ('act-restored-01fd9e3c', 'Kasubid Dana', 'Operasional', 'Pemindah Bukuan Tabungan', 15, 'tabungan', 'administrasi', NULL);
INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category, default_nominal) VALUES ('act-restored-ce7878c3', 'Staf Umum', 'SDM', 'Pengecekan pemindah buku angsuran', 30, 'menit', 'administrasi', NULL);

COMMIT;
