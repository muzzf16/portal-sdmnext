# Panduan Stop Adminer / Web-Based DB Tools di Docker

Pastikan setelah selesai menggunakan Adminer, SQLite Web, atau tool serupa via Docker, container ADMIN-INSTRUMEN dihentikan agar tidak jadi risiko keamanan & resource.

---

## 🛑 Cara Cepat Stop Adminer/SQLite Web

### Jika nama container Adminer adalah `adminer-sqlite`:
```bash
docker stop adminer-sqlite
```

### Jika nama container SQLite Web adalah `sqlite-web`:
```bash
docker stop sqlite-web
```

### Jika lupa nama container (lihat, lalu stop):
```bash
docker ps        # Cek nama container aktif
docker stop <nama-container>
```

---

## CATATAN KEAMANAN
- Tutup (stop) container admin GUI setelah selesai dipakai.
- Pastikan tidak ada port 8088/8089 (atau custom) dibiarkan terbuka di server production.
- Jika ada operasi batch/structural, sebaiknya lakukan backup dan stop backend utama sementara.

---

_Simpan guideline ini di docs project dan SOP deploy/deployops!_
