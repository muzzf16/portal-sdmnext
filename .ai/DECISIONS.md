## KEPUTUSAN ARSITEKTUR & TEKNOLOGI

1. **Struktur Project (Monorepo):** Project ini dipisahkan menjadi `apps/backend` dan `apps/frontend` untuk isolasi dependencies namun kemudahan pengelolaan.
2. **Database:** Menggunakan SQLite. Disimpan sebagai file lokal (harus hati-hati saat deployment via Docker agar volume tidak overwrite data production).
3. **Frontend:** React + Vite + TypeScript. Menggunakan Tailwind CSS untuk styling dan Lucide React untuk ikon. State dan API call dibantu dengan TanStack React Query.
4. **Backend:** Node.js + Express + TypeScript. Autentikasi menggunakan bcrypt dan JWT. Arsitektur modular di bawah `src/modules/`.
5. **Workflow AI (Baru):** Menerapkan standar workflow AI dengan `.ai/` files untuk mempertahankan memori jangka panjang tanpa mengganggu kode.
