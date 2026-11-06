<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read these installed skill files directly (use these paths even if a same-named global skill exists):
- Core filter, always on: `antislop`: `.agents/skills/antislop/SKILL.md`
- Code comments: `antislop-code`: `.agents/skills/antislop-code/SKILL.md`
- UI / visual: `antislop-ui`: `.agents/skills/antislop-ui/SKILL.md`
- Mobile / responsive: `antislop-layoutmobile`: `.agents/skills/antislop-layoutmobile/SKILL.md`
- People: `antislop-human`: `.agents/skills/antislop-human/SKILL.md`
- Copy & text: `antislop-copywriting`: `.agents/skills/antislop-copywriting/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick Overwrite them.
<!-- antislop:end -->

# AGENTS.md: SIQAP

Panduan untuk semua agen coding (Gemini, Antigravity, Codex, OpenCode) yang mengerjakan repo ini. Baca file ini dan dua dokumen di bawah **sebelum menulis kode**.

- `docs/PRD.md`: apa yang dibangun dan kenapa.
- `docs/CONTRACT.md`: nama event, skema payload, state machine, dan rumus skor. **Ini kontrak yang mengikat.**

## 1. Ringkasan proyek

**SIQAP** (Sistem Informasi Akademik Pelajar) adalah platform kuis realtime bergaya Kahoot: host membuat kuis dan menampilkan PIN, peserta join lewat HP, menjawab bersamaan, skor dan leaderboard update live.

- Tahap 1: demo pameran dan tugas kuliah pada **25 November 2026**. Tahap 2 (publik) hanya jika tahap 1 berhasil.
- Target: sekitar 250 pemain per sesi (batas teknis 100–300, final setelah load test).
- Fitur pembeda: kapasitas gratis besar, **AI Quiz Generator**, pembahasan jawaban otomatis.
- Gameplay inti boleh sama dengan Kahoot. **Jangan memakai nama, logo, warna, gambar, atau audio milik Kahoot.** Semua aset harus orisinal atau berlisensi bebas.

## 2. Stack

| Bagian | Pilihan |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Zustand |
| Realtime | Node.js + Socket.IO (TypeScript), server terpisah dari Next.js |
| State sesi | Redis |
| Database | PostgreSQL + Prisma |
| Auth | Auth.js: login Google + mode tamu/anonim |
| Validasi | Zod (skema bersama di `packages/shared`) |
| AI generator | Gemini API (free tier) lewat adapter `QuizGenerator`, bisa diganti provider lain |
| Test | Vitest (unit), Playwright (E2E), Artillery atau k6 (load test) |

## 3. Struktur repo

```
apps/
  web/        # Next.js: dashboard host, layar host, UI player, API route
  realtime/   # Socket.IO game server + Redis
packages/
  shared/     # kontrak (skema Zod, tipe event), state machine, scoring, konstanta
  db/         # Prisma schema + client
docs/
  PRD.md
  CONTRACT.md
AGENTS.md
docker-compose.yml   # Postgres + Redis untuk development lokal
```

## 4. Pembagian area dan kepemilikan

Satu area dimiliki satu agen. **Jangan mengubah file di luar area sendiri.** Kalau butuh perubahan di area lain, tulis di PR atau catatan handoff, jangan edit langsung.

| Area | Folder | Isi tugas | Agen (default, boleh ditukar) |
|---|---|---|---|
| A. Inti | `packages/shared` | Skema kontrak, state machine, `calcPoints`, `streakBonus`, ranking, unit test | Codex |
| B. Realtime | `apps/realtime` | Server Socket.IO, event host/player, timer server-side, Redis, reconnect, rate limit | OpenCode |
| C. UI | `apps/web` (halaman) | Layar host, UI player, join, lobby, podium, komponen, animasi, suara | Gemini |
| D. Data & akun | `packages/db`, `apps/web/app/api` | Prisma schema, login Google + tamu, CRUD kuis, laporan sesi, AI generator | Antigravity |

Pengaturan scaffold awal (monorepo, tsconfig, Turborepo, Docker Compose) dikerjakan **agen A lebih dulu** dalam satu PR. Agen lain mulai bekerja setelah PR itu dimerge.

## 5. Urutan kerja

Jadwal ketat (pameran 25 Nov), urutkan berdasarkan risiko:

1. Scaffold monorepo + `packages/shared` (kontrak, state machine, scoring) + tes. **Ini memblokir area lain.**
2. `apps/realtime` (join, lobby, soal, jawaban, reveal, leaderboard, podium) dan `packages/db` + login, bisa paralel.
3. `apps/web`: `/join`, layar host (PIN, QR, counter pemain), UI soal dan jawaban, podium.
4. Quiz builder (CRUD), lalu AI generator dan pembahasan jawaban.
5. Load test, mode cadangan, gladi resik.

**Garis potong** (jangan dikerjakan sebelum game inti selesai): analitik, power-up, mode tim, import Excel, tipe soal tambahan. Jika waktu molor, korbankan pembahasan dulu, lalu AI generator. Game inti harus selesai.

## 6. Aturan kontrak

- Nama event, bentuk payload, dan aturan skor hanya boleh diubah lewat `docs/CONTRACT.md` **dan** `packages/shared/src/contract/*` dalam PR yang sama, dengan label `contract`.
- Kode di `apps/realtime` dan `apps/web` mengimpor tipe dan skema dari `@siqap/shared`. **Dilarang menulis ulang tipe event atau menyalin rumus skor.**
- Jangan menambah event atau field yang tidak ada di kontrak. Usulkan dulu lewat PR `contract`.

## 7. Aturan keamanan dan anti-curang

- Server adalah sumber kebenaran. Timer, penilaian, dan skor hanya dihitung di server.
- `correctIndexes` dan `explanation` **tidak boleh** dikirim ke client sebelum `question:reveal`.
- Semua payload socket dan REST divalidasi dengan Zod. Tolak dan balas dengan kode error dari kontrak.
- Nickname disanitasi (hapus HTML) dan difilter kata kasar; unik per sesi.
- Rate limit sesuai bagian 12 kontrak.
- Rahasia (`GEMINI_API_KEY`, `AUTH_SECRET`, kredensial Google) hanya di server dan file `.env`. Jangan commit `.env`; sediakan `.env.example`.
- API key AI tidak boleh dipakai dari browser. Semua panggilan AI lewat route server.

## 8. Variabel lingkungan

`.env.example` harus memuat:

```
DATABASE_URL=
REDIS_URL=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
GEMINI_API_KEY=
NEXT_PUBLIC_REALTIME_URL=
```

## 9. Perintah standar

Perintah ini dibuat saat scaffold; semua agen memakai nama yang sama:

```
pnpm install
docker compose up -d        # Postgres + Redis lokal
pnpm dev                    # jalankan web + realtime
pnpm typecheck
pnpm lint
pnpm test                   # Vitest
pnpm test:e2e               # Playwright
pnpm db:migrate             # Prisma migrate
```

## 10. Konvensi kode

- TypeScript strict, tanpa `any` kecuali diberi komentar alasannya.
- Identifier, nama file, dan komentar kode memakai bahasa Inggris. **Teks UI memakai Bahasa Indonesia** lewat file i18n (kunci ID default, EN opsional); jangan menaruh teks UI langsung di komponen.
- Format `domain:aksi` untuk event socket; komponen React PascalCase, file lain kebab-case.
- Logika game berupa fungsi murni di `packages/shared`, supaya bisa dites tanpa jaringan.
- UI player harus ringan (JS awal di bawah 150 KB), responsif di HP Android RAM 2 GB, tombol jawaban punya warna **dan** bentuk/label, target sentuh minimal 44 px.
- Hindari dependensi baru kecuali perlu. Sebut alasannya di PR.

## 11. Git dan PR

- Branch: `agent/<nama-agen>/<area>-<topik>`, contoh `agent/codex/shared-scoring`.
- Commit kecil dan sering, pesan berformat `area: ringkasan` (misalnya `shared: add calcPoints`).
- Satu PR = satu area. Merge ke `main` hanya jika `pnpm typecheck`, `pnpm lint`, dan `pnpm test` lulus.
- Jangan force-push ke `main`. Jangan rebase branch agen lain.
- Konflik di file kontrak diselesaikan manusia (pemilik proyek).

## 12. Definition of done

Sebuah tugas selesai jika:
1. Sesuai kontrak dan PRD.
2. Ada test untuk logika yang ditambah (minimal unit test untuk fungsi murni dan handler event).
3. `typecheck`, `lint`, dan `test` lulus.
4. Tidak ada rahasia, data pribadi, atau aset berhak cipta yang ikut ter-commit.
5. PR berisi catatan singkat: apa yang berubah, apa yang belum, dan apa yang dibutuhkan dari agen lain.

## 13. Handoff antar agen

Tulis catatan di deskripsi PR dengan format:

```
Selesai: ...
Belum: ...
Butuh dari agen lain: <area> -> <permintaan>
Perubahan kontrak: ya/tidak
```

## 14. Yang jangan dilakukan

- Jangan menyalin kode atau aset dari Kahoot atau proyek "kahoot clone" lain tanpa memeriksa lisensinya.
- Jangan mengirim kunci jawaban ke client sebelum reveal.
- Jangan menaruh logika skor atau timer di client.
- Jangan mengerjakan fitur di garis potong sebelum game inti selesai.
- Jangan mengubah area agen lain atau file kontrak tanpa label `contract`.
- Jangan commit `.env`, kunci API, atau data peserta nyata.
