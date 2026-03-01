# Portal SDM - API Integration Manual

Dokumen ini berisi panduan teknis untuk melakukan integrasi *Machine-to-Machine* (M2M) dengan backend Portal SDM. API ini dirancang menggunakan arsitektur RESTful JSON dan menggunakan skema autentikasi berbasis API Key.

## 1. Lingkungan (Environment)

*   **Base URL (Development):** `http://localhost:3333/api/integrations`
*   **Base URL (Production):** `https://api.domain-anda.com/api/integrations` (sesuaikan dengan domain produksi)
*   **Format Data:** HTTP Header selalu menggunakan `Content-Type: application/json` untuk pengiriman *payload* dan setiap *response* akan dikembalikan dalam format struktur JSON standar.

## 2. Autentikasi Keamanan

Seluruh *endpoint* integrasi diproteksi dengan keamanan **API Key**. 
Anda harus menyertakan header HTTP `x-api-key` ke dalam setiap request yang ditujukan ke server Portal SDM.

**Header Format:**
```http
x-api-key: <YOUR_VALID_API_KEY>
```

> **Catatan Uji Coba:**
> Untuk tahap pengembangan *(development)* lokal, Anda bisa menggunakan dummy key berikut: `test-api-key-12345`

*Peringatan: Proses request HTTP tanpa header tersebut akan ditolak oleh sistem dan log-nya akan tercatat di database.*

---

## 3. Endpoints

### 3.1 Daftar Pegawai Aktif (`GET /employees`)

Digunakan untuk menarik data dasar/master dari seluruh pegawai yang berstatus **"aktif"**.

*   **Endpoint:** `GET /integrations/employees`
*   **Query Parameters:** (Tidak Ada)
*   **Contoh Request (cURL):**
    ```bash
    curl -H "x-api-key: YOUR_KEY" http://localhost:3333/api/integrations/employees
    ```

**Contoh Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "external_id": "emp-1760675845254",
      "nip": "60410713",
      "name": "APRIYANTO",
      "gender": "L",
      "email": "apriyanto@gmail.com",
      "phone_number": "085215684358",
      "position": "SPI",
      "department": "Kepatuhan dan IT",
      "employment_status": "aktif",
      "join_date": "2004-01-01"
    }
  ],
  "meta": {
    "total": 1,
    "timestamp": "2026-03-01T15:55:16.289Z"
  }
}
```

---

### 3.2 Rekap Kehadiran/Absensi (`GET /attendance`)

Digunakan untuk menarik riwayat absen atau data presensi harian pegawai (jam *clock-in* dan jam *clock-out*).

*   **Endpoint:** `GET /integrations/attendance`
*   **Query Parameters (Opsional):**
    *   `employeeId` (string): Jika ingin memfilter absensi berdasarkan `external_id` (id di tabel `pegawai`) dari sang pegawai.
    *   `startDate` (string, format YYYY-MM-DD): Filter rentang absen mulai dari tanggal awal pencarian.
    *   `endDate` (string, format YYYY-MM-DD): Filter rentang absen hingga tanggal akhir pencarian.
*   **Contoh Request (cURL):**
    ```bash
    curl -H "x-api-key: YOUR_KEY" "http://localhost:3333/api/integrations/attendance?startDate=2026-03-01&endDate=2026-03-31"
    ```

**Contoh Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "attendance_id": "att-1762311395215",
      "employee_external_id": "emp-1760672593545",
      "nip": "60410707",
      "date": "2026-03-01",
      "clock_in": "08:15",
      "clock_out": "17:05",
      "attendance_status": "hadir",
      "work_duration": "08j 50m",
      "notes": null
    }
  ],
  "meta": {
    "total": 1,
    "timestamp": "2026-03-01T16:00:00.000Z",
    "params": {
      "startDate": "2026-03-01",
      "endDate": "2026-03-31"
    }
  }
}
```

---

### 3.3 Rekap Permohonan Cuti (`GET /leaves`)

Digunakan untuk melihat permohonan status cuti pegawai (seperti Cuti Tahunan, Sakit, dsb).

*   **Endpoint:** `GET /integrations/leaves`
*   **Query Parameters (Opsional):**
    *   `employeeId` (string): Filter riwayat cuti khusus dari pegawai dengan `external_id` tertentu.
    *   `status` (string): Filter berdasarkan status aproval permohonan, misal: `menunggu`, `disetujui`, atau `ditolak`.
    *   `startDate` (string, YYYY-MM-DD): Filter batas awal dari dimulainya pengajuan acara cuti *(start date)*.
    *   `endDate` (string, YYYY-MM-DD): Filter batas akhir dari cuti yang diajukan *(end date)*.
*   **Contoh Request (cURL):**
    ```bash
    curl -H "x-api-key: YOUR_KEY" "http://localhost:3333/api/integrations/leaves?status=disetujui"
    ```

**Contoh Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "leave_id": "cuti-1762344451886",
      "employee_external_id": "emp-1760677257306",
      "nip": "60411124",
      "leave_type": "Tahunan",
      "start_date": "2026-03-05",
      "end_date": "2026-03-08",
      "total_days": 4,
      "reason": "Acara Keluarga",
      "leave_status": "disetujui",
      "created_at": "2026-03-01 10:15:00"
    }
  ],
  "meta": {
    "total": 1,
    "timestamp": "2026-03-01T16:05:00.000Z",
    "params": {
      "status": "disetujui"
    }
  }
}
```

---

## 4. Handling Error (Format Standard)

Setiap request yang memiliki error dari server (baik berupa *Missing Key*, *Invalid Key*, *Internal Server Error* dsb) akan merespon dengan format HTTP code standard (mis. `401`, `403`, `500`) dan format body yang seragam, yaitu seperti berikut:

```json
{
    "success": false,
    "message": "Unauthorized: Missing x-api-key header"
}
```

## 5. Kontak Dukungan dan Observability
- API memiliki fitur audit terintegrasi (Tabel `integration_logs`).
- Jika terdapat masalah atau hasil yang *Null/Empty* dalam integrasi, silakan verifikasi apakah tabel database aplikasi sudah terhubung ke API dengan mencocokkan *header logging*. Hubungi admin pengelola sistem Portal SDM bila membutuhkan pembuatan API Key produksi terbaru via *Database Administrasi*.
