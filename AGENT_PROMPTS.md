# SIQAP: Prompt Pembuka per Agen

Salin satu prompt ke agen yang memegang area itu. Semua prompt mengasumsikan repo sudah berisi `AGENTS.md`, `docs/PRD.md`, `docs/CONTRACT.md`, dan `docs/DESIGN.md`.

**Urutan menjalankan:**
1. Jalankan **Prompt A** sendirian dulu sampai PR-nya dimerge (scaffold + `packages/shared`).
2. Setelah itu **Prompt B, C, D** boleh jalan bersamaan, masing-masing di branch sendiri.
3. Pemilik proyek (lu) yang me-review dan me-merge. Konflik di file kontrak diselesaikan manual.

Nama agen di bawah adalah penugasan default dan bisa ditukar.

---

## Prompt 0: pembuka umum (tempel di awal prompt agen mana pun)

```
Kamu mengerjakan proyek SIQAP (platform kuis realtime bergaya Kahoot) bersama agen lain.
Sebelum menulis kode, baca berurutan: AGENTS.md, docs/CONTRACT.md, docs/PRD.md, docs/DESIGN.md.
Aturan keras:
- Kerjakan HANYA area milikmu. Jangan menyentuh folder area lain.
- Jangan mengubah nama event, bentuk payload, atau rumus skor di luar PR berlabel "contract".
- Server adalah sumber kebenaran. Kunci jawaban tidak boleh dikirim ke client sebelum reveal.
- Teks UI memakai Bahasa Indonesia lewat i18n; kode dan komentar memakai bahasa Inggris.
- Branch: agent/<nama-agen>/<area>-<topik>. Satu PR = satu area.
- Selesai hanya jika typecheck, lint, dan test lulus.
Kalau ada hal yang ambigu atau butuh perubahan di area lain, tulis di deskripsi PR, jangan menebak.
Akhiri dengan catatan handoff: Selesai / Belum / Butuh dari agen lain / Perubahan kontrak.
```

---

## Prompt A: Scaffold + inti game (Codex)

Area: root repo dan `packages/shared`. **Blocker untuk semua agen lain.**

```
[tempel Prompt 0]

TUGASMU: area A (scaffold monorepo + packages/shared).

1. Scaffold monorepo
- pnpm workspaces + Turborepo. Paket: apps/web (Next.js App Router, TypeScript, Tailwind),
  apps/realtime (Node + TypeScript + Socket.IO, belum ada logika), packages/shared (@siqap/shared),
  packages/db (@siqap/db, hanya kerangka Prisma kosong).
- tsconfig base strict, ESLint + Prettier, Vitest di packages/shared.
- docker-compose.yml: PostgreSQL 16 dan Redis 7 untuk development lokal.
- .env.example sesuai AGENTS.md bagian 8.
- Script root sesuai AGENTS.md bagian 9: dev, typecheck, lint, test, test:e2e, db:migrate.

2. packages/shared
- Implementasikan docs/CONTRACT.md apa adanya di src/contract/: konstanta, skema Zod, ErrorCode,
  AckResult, ClientToServerEvents, ServerToClientEvents. Nama harus persis sama.
- src/game/scoring.ts: calcPoints dan streakBonus (aturan bagian 9 kontrak) dan fungsi ranking
  (skor menurun, lalu total waktu respons menaik, lalu joinedAt menaik).
- src/game/state-machine.ts: fungsi murni transition(state, action) sesuai tabel bagian 8 kontrak.
  Aksi di luar tabel mengembalikan error INVALID_PHASE. Tanpa I/O dan tanpa timer di dalamnya.
- Ekspor semuanya dari src/index.ts.

3. Test (Vitest)
- calcPoints: salah = 0, jawab di detik 0 = poin penuh, di detik terakhir sekitar 50%, mode double, mode none, responseMs di luar batas.
- streakBonus: streak 0, 1, 2, batas +500.
- ranking: seri skor dipecah dengan benar.
- state machine: semua transisi valid, semua transisi ilegal ditolak, jalur LEADERBOARD dilewati bila showLeaderboardEachQuestion = false.

DONE JIKA: pnpm install, pnpm typecheck, pnpm lint, pnpm test lulus dari root, dan docker compose up -d menyalakan Postgres + Redis.
JANGAN: menulis server Socket.IO, UI, atau skema Prisma lengkap (itu area lain).
```

---

## Prompt B: Server realtime (OpenCode)

Area: `apps/realtime`. Mulai setelah PR Prompt A dimerge.

```
[tempel Prompt 0]

TUGASMU: area B (apps/realtime).

Bangun server Socket.IO bertipe memakai ClientToServerEvents / ServerToClientEvents dari @siqap/shared.

Fitur:
- Handler untuk SEMUA event di bagian 5 kontrak: host:create, host:rejoin, host:start, host:next, host:skip,
  host:pause, host:resume, host:end, host:kick, player:join, player:rejoin, player:answer.
- Validasi setiap payload dengan skema Zod dari @siqap/shared; balas ack dengan ErrorCode yang tepat.
- Room sesuai bagian 7 kontrak (game:{pin}, host:{pin}, player:{playerId}).
- State sesi di Redis sesuai bagian 10 kontrak, dengan TTL. PIN acak 6 digit, dicek tidak bentrok.
- Timer soal DI SERVER: kirim question:tick tiap 1 detik, auto-lanjut ke reveal saat waktu habis atau semua sudah menjawab.
  Pause/resume mempertahankan sisa waktu.
- Penilaian memakai calcPoints / streakBonus / ranking dari @siqap/shared (jangan menulis ulang rumusnya).
  Gunakan transition() dari state machine untuk setiap perubahan fase.
- Kirim player:result saat reveal, bukan saat menjawab. Kirim player:final di akhir game.
- Reconnect player dan host sesuai bagian 11 kontrak (auto-pause 30 dtk, akhiri 10 menit).
- Rate limit sesuai bagian 12 kontrak. Nickname unik (tanpa beda huruf besar/kecil), sanitasi HTML, filter kata kasar sederhana.
- Akses data kuis lewat interface QuizRepository { getQuiz(id, ownerId): Promise<Quiz> }.
  Sampai area D selesai, sediakan implementasi in-memory dengan 1 kuis contoh (10 soal pengetahuan umum).
- Saat fase PODIUM, persist hasil lewat interface ResultRepository (implementasi in-memory dulu; area D menyambungkan ke Postgres).

Test:
- Integration test dengan socket.io-client: 1 host + 3 player memainkan satu game penuh sampai podium.
- Test eksplisit bahwa payload question:show TIDAK memuat correctIndexes maupun explanation.
- Test: jawaban kedua ditolak ALREADY_ANSWERED, jawaban setelah endsAt ditolak TIME_UP, aksi host oleh non-host ditolak NOT_HOST, rejoin berhasil di tengah game.
- Skrip load test (Artillery atau k6) yang mensimulasikan 250 player join dan menjawab satu soal. Cukup skrip dan README cara menjalankan; hasil angka dicatat setelah dijalankan.

DONE JIKA: integration test lulus, typecheck + lint lulus, pnpm dev menjalankan server di port yang tertulis di README area ini.
JANGAN: mengubah kontrak, menyentuh apps/web atau packages/db, atau menaruh logika skor sendiri.
```

---

## Prompt C: UI (Gemini)

Area: halaman dan komponen di `apps/web` (kecuali `apps/web/app/api`). Mulai setelah PR Prompt A dimerge.

```
[tempel Prompt 0]

TUGASMU: area C (UI apps/web). Wajib mengikuti docs/DESIGN.md: pakai token warna/CSS variables, bukan hex di komponen.

Halaman dan layar:
- /join: input PIN lalu nickname (tombol pil, kartu putih di atas latar biru).
- /host/[sessionId]: layar host dengan fase LOBBY (PIN besar, QR, counter pemain live, chip nickname, tombol Mulai),
  QUESTION (teks soal, timer melingkar, jumlah yang sudah menjawab), REVEAL (opsi benar, grafik distribusi, pembahasan),
  LEADERBOARD (top 5), PODIUM (3 besar). Kontrol host: Next, Skip, Pause/Resume, End.
- /play/[pin]: UI player: menunggu di lobby, empat tombol jawaban A-D (warna + huruf + ikon sesuai DESIGN.md),
  layar hasil per soal (benar/salah, poin, streak, rank), layar akhir dengan rekap kesalahan (player:final).
- Reconnect: simpan playerId dan rejoinToken di localStorage, panggil player:rejoin saat koneksi pulih.

Teknis:
- Client socket bertipe dari @siqap/shared; hook useGameSocket() dan store Zustand.
- Mode MOCK: bila NEXT_PUBLIC_MOCK=1, jalankan simulasi event server memakai fixture bertipe kontrak,
  supaya UI bisa dikembangkan sebelum apps/realtime selesai.
- Countdown dihitung dari endsAt dan jam server (hitung offset dari waktu event pertama), bukan dari timer lokal murni.
- Teks UI lewat i18n (ID default). Tidak ada teks hardcode di komponen.
- Animasi dengan Framer Motion; hormati prefers-reduced-motion. Audio: tombol mute, pakai file placeholder
  berlisensi bebas atau buatan sendiri. DILARANG memakai audio, logo, atau gambar milik Kahoot.
- Anggaran performa: JS awal halaman player di bawah 150 KB gzip; tombol jawaban minimal 44 px dan memenuhi lebar layar.
- Layar host dirancang untuk proyektor: teks soal minimal 32 px, kontras tinggi.

Test:
- Component test (Vitest + Testing Library) untuk tombol jawaban, timer, leaderboard.
- Satu E2E Playwright dalam mode MOCK: join, jawab, lihat hasil, lihat podium.

DONE JIKA: semua layar bisa dijalankan penuh dalam mode MOCK, typecheck + lint + test lulus.
JANGAN: menyentuh apps/realtime, packages/db, atau apps/web/app/api; jangan menulis ulang tipe event.
```

---

## Prompt D: Data, akun, dan AI generator (Antigravity)

Area: `packages/db` dan `apps/web/app/api`. Mulai setelah PR Prompt A dimerge.

```
[tempel Prompt 0]

TUGASMU: area D (packages/db + apps/web/app/api).

Kerjakan berurutan; satu PR per langkah:

1. packages/db: skema Prisma untuk User, Quiz, Question, GameSession, Player, Answer (lihat bagian 14 kontrak dan bagian 8 PRD).
   Question.options dan correctIndexes disimpan sebagai JSON. Migrasi awal + seed berisi 1 kuis contoh
   (10 soal pengetahuan umum, bahasa Indonesia). Ekspor PrismaClient dan tipe.
2. Auth.js: login Google + mode tamu/anonim (sesi tamu sementara dengan batas lebih ketat). Helper untuk membaca
   user dari request dan memverifikasi kepemilikan kuis.
3. REST sesuai bagian 13 kontrak: GET/POST /api/quizzes, GET/PUT/DELETE /api/quizzes/:id. Validasi dengan
   QuestionInput dari @siqap/shared. Hanya pemilik yang boleh mengubah/menghapus.
4. Implementasi QuizRepository dan ResultRepository (interface didefinisikan area B) memakai Prisma,
   dan ekspor supaya bisa dipakai apps/realtime.
5. POST /api/ai/generate sesuai bagian 13 kontrak:
   - Interface QuizGenerator dengan implementasi Gemini (model Flash/Flash-Lite, free tier) memakai GEMINI_API_KEY.
   - Minta output JSON, validasi dengan GenerateQuizOutput, coba ulang maksimal 2 kali bila gagal.
   - Rate limit 10 per hari per akun (tamu lebih ketat), balas HTTP 429 bila lewat.
   - Cache hasil untuk topik + parameter yang sama. API key hanya di server.
   - Tandai soal hasil AI di respons (field source: "ai") supaya UI bisa memberi label "dibuat AI, periksa dulu".
6. (Hanya jika waktu sisa) GET /api/sessions/:id/report: skor per pemain dan akurasi per soal, JSON saja.

Test:
- Unit/integration test untuk setiap route: akses ditolak bila bukan pemilik, validasi gagal bila payload salah.
- Test QuizGenerator dengan klien model yang di-mock: output valid, output rusak lalu coba ulang, batas rate limit.

DONE JIKA: pnpm db:migrate dan seed berjalan di Postgres lokal, semua route punya test, typecheck + lint + test lulus.
JANGAN: menyentuh apps/realtime atau halaman UI; jangan menaruh API key di kode atau client.
```

---

## Catatan koordinasi

- **Ketergantungan:** B dan C hanya butuh `@siqap/shared` dari A. B memakai repository in-memory sampai D selesai; C memakai mode MOCK sampai B selesai. Itu yang membuat B, C, dan D bisa paralel.
- **Titik integrasi pertama** (kira-kira setelah 19 Nov): jalankan UI asli (C) terhadap server asli (B) dengan data dari Postgres (D). Siapkan satu sesi khusus untuk menyambungkannya dan memperbaiki selisih kontrak.
- **Jika satu agen macet:** pindahkan tugasnya ke agen yang sudah selesai, jangan menunggu. Garis potong di `AGENTS.md` bagian 5 menentukan apa yang dibuang lebih dulu.
- **Review manual wajib** untuk: PR berlabel `contract`, apa pun yang menyentuh auth dan rate limit, dan pengecekan bahwa `question:show` tidak membocorkan kunci jawaban.
