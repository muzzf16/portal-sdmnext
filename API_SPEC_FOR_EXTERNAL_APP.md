# API Specification — Portal SDM v3 (External Application)

> Dokumen ini ditujukan untuk developer aplikasi eksternal yang ingin berintegrasi dengan Portal SDM v3.
>
> **Versi:** 1.0  
> **Terakhir diperbarui:** 22 Mei 2026

---

## Daftar Isi

1. [Base URL](#1-base-url)
2. [Authentication](#2-authentication)
3. [Endpoint — Integration API](#3-endpoint--integration-api)
4. [Error Codes](#4-error-codes)
5. [Rate Limits](#5-rate-limits)
6. [Panduan Umum](#6-panduan-umum)

---

## 1. Base URL

| Environment | URL |
|-------------|-----|
| **Development** | `http://localhost:3333/api` |
| **Docker (host)** | `http://<server-ip>:3334/api` |
| **Production** | `https://<domain>/api` |

Semua endpoint di bawah menggunakan prefix `/api`.  
Contoh: `GET /api/integrations/employees`

---

## 2. Authentication

Portal SDM v3 menggunakan metode autentikasi **API Key** untuk komunikasi **Machine-to-Machine (M2M)** antar sistem eksternal.

| Header | Nilai |
|--------|-------|
| `x-api-key` | `<your_api_key>` |

**Cara mendapatkan API Key:**

1. Admin Portal SDM membuat record dengan key yang sudah di-hash (bcrypt) ke database internal.
2. API Key plaintext diberikan ke developer aplikasi eksternal secara aman (out-of-band).
3. Setiap request, key dikirim melalui header `x-api-key`.

**Contoh Request:**

```http
GET /api/integrations/employees HTTP/1.1
Host: your-server:3334
x-api-key: sk_live_abc123xyz789
Content-Type: application/json
```

> ⚠️ **Jangan pernah menyimpan API Key di source code atau repository publik.**

---

## 3. Endpoint — Integration API

Semua endpoint di bawah menggunakan autentikasi **API Key** via header `x-api-key`.
Semua request dicatat di tabel `integration_logs` untuk audit.

---

### 3.1 `GET /api/integrations/employees`

Mengambil daftar pegawai aktif.

**Request:**

```http
GET /api/integrations/employees HTTP/1.1
x-api-key: sk_live_abc123xyz789
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "external_id": "emp-001",
      "nip": "19900101001",
      "name": "Budi Santoso",
      "gender": "Laki-laki",
      "email": "budi@company.com",
      "phone_number": "081234567890",
      "position": "Analis Kredit",
      "department": "Kredit",
      "employment_status": "aktif",
      "join_date": "2020-01-15"
    }
  ],
  "meta": {
    "total": 1,
    "timestamp": "2026-05-22T08:00:00.000Z"
  }
}
```

---

### 3.2 `GET /api/integrations/attendance`

Mengambil daftar data absensi.

**Query Parameters:**

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| `startDate` | `string` (YYYY-MM-DD) | Tidak | Filter tanggal mulai |
| `endDate` | `string` (YYYY-MM-DD) | Tidak | Filter tanggal akhir |
| `employeeId` | `string` | Tidak | Filter berdasarkan ID pegawai |

**Request:**

```http
GET /api/integrations/attendance?startDate=2026-05-01&endDate=2026-05-22 HTTP/1.1
x-api-key: sk_live_abc123xyz789
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "attendance_id": "att-1716000000",
      "employee_external_id": "emp-001",
      "nip": "19900101001",
      "date": "2026-05-22",
      "clock_in": "08:00",
      "clock_out": "17:00",
      "attendance_status": "hadir",
      "work_duration": 540,
      "notes": null
    }
  ],
  "meta": {
    "total": 1,
    "timestamp": "2026-05-22T08:00:00.000Z",
    "params": {
      "startDate": "2026-05-01",
      "endDate": "2026-05-22"
    }
  }
}
```

---

### 3.3 `GET /api/integrations/leaves`

Mengambil daftar pengajuan cuti.

**Query Parameters:**

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| `startDate` | `string` (YYYY-MM-DD) | Tidak | Filter tanggal mulai cuti |
| `endDate` | `string` (YYYY-MM-DD) | Tidak | Filter tanggal akhir cuti |
| `employeeId` | `string` | Tidak | Filter berdasarkan ID pegawai |
| `status` | `string` | Tidak | Filter status: `pending`, `disetujui`, `ditolak` |

**Request:**

```http
GET /api/integrations/leaves?status=disetujui HTTP/1.1
x-api-key: sk_live_abc123xyz789
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "leave_id": "lv-001",
      "employee_external_id": "emp-001",
      "nip": "19900101001",
      "leave_type": "Cuti Tahunan",
      "start_date": "2026-06-01",
      "end_date": "2026-06-03",
      "total_days": 3,
      "reason": "Keperluan keluarga",
      "leave_status": "disetujui",
      "created_at": "2026-05-20T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "timestamp": "2026-05-22T08:00:00.000Z",
    "params": {
      "status": "disetujui"
    }
  }
}
```

---

### 3.4 `POST /api/integrations/attendance`

Mengirim/menyinkronkan data absensi dari sistem eksternal (Inbound).
Jika data absensi untuk pegawai + tanggal sudah ada, akan di-**update**.

**Request Body:**

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `nip` | `string` | ✅ | NIP pegawai |
| `date` | `string` (YYYY-MM-DD) | ✅ | Tanggal absensi |
| `clock_in` | `string` (HH:mm) | ✅ | Jam masuk |
| `clock_out` | `string` (HH:mm) | Tidak | Jam keluar |
| `status` | `string` | Tidak | Default: `hadir` |
| `notes` | `string` | Tidak | Catatan tambahan |

**Request:**

```http
POST /api/integrations/attendance HTTP/1.1
x-api-key: sk_live_abc123xyz789
Content-Type: application/json

{
  "nip": "19900101001",
  "date": "2026-05-22",
  "clock_in": "08:05",
  "clock_out": "17:10",
  "status": "hadir",
  "notes": "via Mesin Fingerprint"
}
```

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Attendance record successfully processed (INSERT)",
  "data": {
    "action": "INSERT",
    "employeeName": "Budi Santoso",
    "date": "2026-05-22"
  }
}
```

**Response (jika NIP sudah ada sebelumnya di tanggal yang sama):**

```json
{
  "success": true,
  "message": "Attendance record successfully processed (UPDATE)",
  "data": {
    "action": "UPDATE",
    "employeeName": "Budi Santoso",
    "date": "2026-05-22"
  }
}
```

---

### 3.5 `POST /api/integrations/daily-activities`

Mengirim log aktivitas harian dari sistem eksternal (Inbound).
Jika master activity belum ada, akan dibuat otomatis.

**Request Body:**

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `nip` | `string` | ✅ | NIP pegawai |
| `date` | `string` (YYYY-MM-DD) | ✅ | Tanggal aktivitas |
| `activity_name` | `string` | ✅ | Nama aktivitas |
| `duration_minutes` | `number` | ✅ | Durasi dalam menit |
| `notes` | `string` | Tidak | Catatan tambahan |

**Request:**

```http
POST /api/integrations/daily-activities HTTP/1.1
x-api-key: sk_live_abc123xyz789
Content-Type: application/json

{
  "nip": "19900101001",
  "date": "2026-05-22",
  "activity_name": "Kunjungan Nasabah",
  "duration_minutes": 60,
  "notes": "Kunjungan ke nasabah potensial area Sleman"
}
```

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Daily activity log successfully processed",
  "data": {
    "log_id": 42,
    "activityName": "Kunjungan Nasabah",
    "status": "pending"
  }
}
```

> **Catatan:** Log aktivitas masuk dengan status `pending` dan harus di-approve oleh atasan melalui Portal SDM.

---

## 4. Error Codes

### HTTP Status Codes

| Code | Arti | Keterangan |
|------|------|------------|
| `200` | OK | Request berhasil diproses |
| `201` | Created | Data baru berhasil dibuat |
| `400` | Bad Request | Validasi gagal — cek field wajib / format |
| `401` | Unauthorized | API Key tidak diberikan |
| `403` | Forbidden | API Key tidak valid atau sudah nonaktif |
| `404` | Not Found | Resource tidak ditemukan (ID/NIP salah) |
| `500` | Internal Server Error | Kesalahan internal server |

### Format Response Error

Semua error mengikuti format standar:

```json
{
  "success": false,
  "message": "Pesan error yang dapat dibaca manusia"
}
```

**Contoh validasi error (400):**

```json
{
  "success": false,
  "message": "Bad Request: nip, date, and clock_in are required fields"
}
```

**Contoh auth error (401):**

```json
{
  "success": false,
  "message": "Unauthorized: Missing x-api-key header"
}
```

**Contoh forbidden (403):**

```json
{
  "success": false,
  "message": "Forbidden: Invalid API Key"
}
```

**Contoh not found (404):**

```json
{
  "success": false,
  "message": "Pegawai aktif dengan NIP 99999 tidak ditemukan."
}
```

---

## 5. Rate Limits

| Kategori | Limit | Catatan |
|----------|-------|---------|
| **Integration API** (API Key) | **60 requests/menit** per API Key | Semua request di-log ke `integration_logs` |

### Perilaku saat limit terlampaui:

```json
HTTP/1.1 429 Too Many Requests

{
  "success": false,
  "message": "Rate limit exceeded. Silakan coba lagi nanti."
}
```

> **Catatan:** Rate limit belum diterapkan secara eksplisit di codebase saat ini. Nilai di atas adalah rekomendasi desain. Implementasi rate limiter (misal `express-rate-limit`) perlu ditambahkan sebelum production release.

---

## 6. Panduan Umum

### 6.1 Content-Type

Semua request body menggunakan `application/json`:

```http
Content-Type: application/json
```

### 6.2 Format Tanggal

| Tipe | Format | Contoh |
|------|--------|--------|
| Tanggal | `YYYY-MM-DD` | `2026-05-22` |
| Datetime | ISO 8601 | `2026-05-22T08:00:00.000Z` |
| Jam | `HH:mm` | `08:05` |

### 6.3 Logging & Audit

- **Integration API**: Semua request tercatat di tabel `integration_logs` (endpoint, method, status, response time).

### 6.4 Keamanan

- API Key di-hash dengan **bcrypt** dan disimpan di tabel `api_keys`. Plaintext tidak pernah disimpan di server.
- Semua endpoint menggunakan HTTPS di production.
