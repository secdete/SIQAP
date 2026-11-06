# AGENTS.md — SIQAP Agent Collaboration & Operational Rules

Dokumen panduan koordinasi lintas-agen untuk pengembangan sistem **SIQAP** (Kahoot-like Realtime Platform).

---

## 1. Pembagian Wilayah Kerja Agen (Ownership Boundaries)

Setiap agen yang mengerjakan bagian dalam monorepo ini wajib mematuhi batas wilayah:

| Wilayah | Tanggung Jawab Utama | Larangan Keras |
|---|---|---|
| **Agen Contract** (`packages/shared`) | Menjaga `CONTRACT.md`, skema Zod, event socket, rumus kalkulasi skor & bonus streak. | Dilarang mengubah skema atau payload tanpa sinkronisasi langsung dengan agen realtime dan agen web. |
| **Agen Database** (`packages/db`) | Skema Prisma, relasi antar tabel (`Quiz`, `Question`, `GameSession`, dll.), migrasi database. | Dilarang menyimpan kunci jawaban dalam bentuk plain text yang terbuka ke publik sebelum fase reveal. |
| **Agen Realtime** (`apps/realtime`) | Server Socket.IO, room isolation, authoritative timer, state machine, reconnect handling, kalkulasi skor. | Dilarang mempercayai timestamp atau skor yang dikirim oleh client. Server adalah single source of truth. |
| **Agen Web** (`apps/web`) | Dashboard Host, Quiz Builder, Live Screen Proyektor, Player Mobile Screen, AI Quiz Generator (9router). | Dilarang mengakses kunci jawaban di client sebelum event `question:reveal` diterima. |

---

## 2. Protokol Perubahan Kontrak (Contract Change Protocol)

Jika ada penambahan event baru atau perubahan struktur payload:
1. Perbarui `CONTRACT.md` terlebih dahulu.
2. Perbarui `packages/shared/src/contract/*` dengan skema Zod dan TypeScript type yang sepadan.
3. Jalankan `pnpm --filter @siqap/shared test` untuk memastikan semua unit test lulus.
4. Beri tahu agen `apps/realtime` dan `apps/web` sebelum melakukan perubahan kode di kedua aplikasi tersebut.

---

## 3. Protokol Integrasi AI 9router

* Server lokal 9router aktif di `http://localhost:20128/v1`.
* Model yang didukung: Gemini 3.8 / 3.7 / 3.5, Claude, DeepSeek, Nemotron.
* Agen web menggunakan helper API route `/api/ai/generate` yang memanggil 9router di sisi server.
* Hasil generate divalidasi dengan `GenerateQuizOutput` Zod schema. Jika gagal, ulangi maksimal 2 kali sebelum mengembalikan error ke pengguna.

---

## 4. Checklist Kualitas Sebelum Selesai (Definition of Done)

- [ ] Seluruh payload Socket.IO tervalidasi skema Zod `@siqap/shared`.
- [ ] Timer dan skor 100% server-authoritative (`calcPoints` & `streakBonus`).
- [ ] Room Socket.IO terisolasi: `game:{pin}`, `host:{pin}`, `player:{playerId}`.
- [ ] Reconnect token tersimpan di client dan bisa memulihkan sesi game saat koneksi terputus.
- [ ] Build monorepo (`pnpm build`) berhasil tanpa error TypeScript.
- [ ] Tes unit (`pnpm test`) lulus seluruhnya.
