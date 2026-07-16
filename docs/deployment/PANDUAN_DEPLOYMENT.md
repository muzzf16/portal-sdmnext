# Deployment Guide: Docker & Single Tunnel (Internal Network Mode)

This guide explains how to deploy the Portal SDM application and connect it to your Cloudflare Tunnel securely using **Internal Docker Networking**.

## Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed.
- An existing Cloudflare Tunnel running in a Docker container.

## 1. Network Setup (CRITICAL)

Agar Tunnel bisa memanggil `http://sdm:8081`, Tunnel **harus** berada di dalam network yang sama dengan aplikasi ini.

Kita menamai network ini: `bpr_shared_network`.

### Langkah 1: Jalankan Aplikasi SDM
```bash
docker-compose up -d --build
```
Docker akan otomatis membuat network bernama `bpr_shared_network`.

### Langkah 2: Sambungkan Tunnel Lama ke Network Ini
Cari tahu nama container tunnel Anda (misal: `cloudflared` atau `tunnel`).
Jalankan perintah ini di terminal:

```bash
# Format: docker network connect [nama_network] [nama_container_tunnel]
docker network connect bpr_shared_network nama_container_tunnel_anda
```

*Contoh jika nama container tunnel adalah `cloudflared_tunnel`:*
`docker network connect bpr_shared_network cloudflared_tunnel`

> **Verifikasi:**
> Sekarang container Tunnel sudah punya "akses" langsung ke container `sdm` tanpa lewat host.

## 2. Setting Cloudflare Dashboard

Sekarang Anda bisa menggunakan Internal URL yang bersih dan portable.

1.  Buka Cloudflare Zero Trust Dashboard.
2.  Edit Tunnel -> Public Hostname.
3.  Add Route:
    *   **Subdomain**: `sdm`
    *   **Domain**: `bprbaperabatang.com`
    *   **Service Type**: `HTTP`
    *   **URL**: `sdm:8081`

Sekarang traffic mengalir seperti ini:
`Cloudflare` -> `Tunnel Container` --(internal network)--> `SDM Container`

✅ Tidak ada hop ke Host OS.
✅ Latency minimal.
✅ Portable di OS apa saja (Linux/Windows).

## Troubleshooting

-   **Error "Name or service not known"**: Tunnel belum connect ke network. Pastikan perintah `docker network connect` sukses.
-   **502 Bad Gateway**: Pastikan port 8081 benar (saya sudah ubah config Nginx untuk listen di 8081).
