# CLAUDE.md — SIQAP (Platform Kuis Realtime)

Panduan arsitektur, konvensi monorepo, protokol agen, dan standar kode untuk proyek **SIQAP** (Kahoot-like Realtime Quiz).

---

## 1. Perintah Proyek (Commands)

```bash
# Menjalankan seluruh workspace (web & realtime secara paralel)
pnpm dev

# Membangun seluruh workspace (typecheck & bundle)
pnpm build

# Menjalankan unit & integration tests
pnpm test

# Type checking tanpa build
pnpm check-types

# Database Prisma
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push skema ke database lokal/dev
pnpm db:migrate   # Jalankan migrasi dev
pnpm db:studio    # Buka Prisma Studio GUI
```

---

## 2. Arsitektur Monorepo & Pembagian Peran Agen

Proyek ini menggunakan struktur monorepo Turborepo + pnpm workspaces dengan pemisahan tanggung jawab (*separation of concerns*) yang ketat:

```
SIQAP/
├── apps/
│   ├── web/        # Next.js App Router (Host dashboard, Quiz builder, Live display, Player mobile)
│   └── realtime/   # Node.js + Socket.IO server (Game engine, authoritative timer, Redis state)
├── packages/
│   ├── shared/     # CONTRACT (Zod schemas, event types, scoring formula, AI types)
│   └── db/         # Prisma ORM & PostgreSQL Client
```

### Agen Pemilik Modul (Agent Ownership)
1. **Agen Contract (`packages/shared`):**
   * Pemilik file `CONTRACT.md` dan `packages/shared/src/contract/*`.
   * **Aturan Absolut:** `CONTRACT.md` dan kode di `packages/shared/src/contract/*` WAJIB selalu identik. Tidak boleh diubah sepihak tanpa koordinasi dengan agen `apps/web` dan `apps/realtime`.
2. **Agen Database (`packages/db`):**
   * Pemilik skema Prisma (`packages/db/prisma/schema.prisma`) dan koneksi database.
   * Model data: `User`, `Account`, `Session`, `Quiz`, `Question`, `GameSession`, `Player`, `Answer`.
3. **Agen Realtime (`apps/realtime`):**
   * Pemilik engine state machine game, authoritative timer, socket room, dan kalkulasi skor di server.
   * Tidak boleh mempercayai input client: semua payload divalidasi dengan Zod schema dari `@siqap/shared`.
4. **Agen Web (`apps/web`):**
   * Pemilik antarmuka Host dan Player (Next.js, Tailwind, shadcn/ui, Zustand, Framer Motion).
   * Menghubungkan Quiz Generator dengan 9router (`http://localhost:20128/v1`).

---

## 3. Aturan Inti Contract (Server-Authoritative)

1. **Server adalah Sumber Kebenaran:**
   * Timer, penilaian jawaban, dan skor total hanya dihitung di server (`apps/realtime`).
   * Client hanya menerima `startedAt`, `endsAt`, dan `question:tick` untuk sinkronisasi tampilan countdown.
2. **Kunci Jawaban Dirahasiakan:**
   * Kunci jawaban (`correctIndexes`) dan `explanation` **TIDAK PERNAH** dikirim ke player sebelum fase `question:reveal`.
3. **Satu Jawaban Per Player Per Soal:**
   * Player hanya boleh submit 1 kali per soal. Jawaban pertama yang sah yang dicatat; jawaban kedua ditolak dengan `ALREADY_ANSWERED`.
4. **Format Event Socket:**
   * Selalu menggunakan format `domain:aksi` (huruf kecil).
   * Client $\rightarrow$ Server: `host:create`, `host:start`, `host:next`, `host:skip`, `host:pause`, `host:resume`, `host:end`, `host:kick`, `player:join`, `player:rejoin`, `player:answer`.
   * Server $\rightarrow$ Client: `lobby:update`, `game:phase`, `question:show`, `question:tick`, `question:reveal`, `player:result`, `leaderboard:update`, `game:end`, `player:final`, `player:kicked`.

---

## 4. State Machine Alur Permainan

```
LOBBY → QUESTION_INTRO → QUESTION_ACTIVE → QUESTION_REVEAL → LEADERBOARD
                ▲                                                   │
                └───────────── (masih ada soal berikutnya) ─────────┘
                                                                    │ (soal habis)
                                                                    ▼
                                                                 PODIUM → ENDED
```

* `QUESTION_INTRO`: Countdown 3 detik sebelum soal aktif.
* `QUESTION_ACTIVE`: Soal tampil, timer berjalan. Berpindah ke `QUESTION_REVEAL` jika timer habis, semua pemain sudah menjawab, atau host menekan skip (`host:skip`).
* `QUESTION_REVEAL`: Kunci jawaban terbuka, distribusi pilihan tampil di layar host, hasil personal (`player:result`) dikirim ke masing-masing player.
* `LEADERBOARD`: Tampilan Top 5 peringkat sementara.
* `PODIUM`: Peringkat 1, 2, 3 akhir permainan.
* `ENDED`: Hasil disimpan permanen ke PostgreSQL (`GameSession`, `Player`, `Answer`).

---

## 5. Integrasi AI Quiz Generator (9router)

* **Proxy Router:** `http://localhost:20128/v1` (OpenAI-compatible endpoint).
* **Format Request:** Menggunakan skema `GenerateQuizInput` (topik atau teks dari PDF, jumlah soal, kesulitan, bahasa).
* **Format Response:** JSON terstruktur yang wajib lolos validasi `GenerateQuizOutput`.
* **Keamanan:** API key hanya disimpan di server environment (`.env`), tidak pernah bocor ke client bundle. Soal hasil generate selalu diberi label *"Dibuat oleh AI, silakan periksa sebelum dimainkan"*.

---

## 6. Standar Kualitas Desain UI (Anti-Slop)

* **Aset Orisinal:** Dilarang meniru aset, logo, suara, dan warna resmi Kahoot untuk menghindari isu hak cipta.
* **Aksesibilitas:**
  * Tombol jawaban pada layar player wajib memiliki kombinasi **warna** dan **bentuk simbol geometris** (segitiga, belah ketupat, lingkaran, persegi) agar ramah pengguna buta warna.
  * Target sentuh tombol minimal 44x44 px.
  * Kontras warna teks memenuhi standar WCAG AA.
* **Performa Mobile:**
  * Bundle awal client player ringan (< 150 KB JS).
  * Desain responsif dioptimalkan untuk smartphone layar kecil hingga monitor proyektor host.
