# PRD — SIQAP, Platform Kuis Realtime (Kahoot-like)

**Versi:** 0.2 (Draft) · **Tanggal:** 6 November 2026 · **Status:** Siap direview

> Nama produk: **SIQAP** (Sistem Informasi Akademik Pelajar), sekaligus tugas kuliah. Pakai logo, warna, dan musik sendiri, jangan tiru aset Kahoot biar aman dari sisi merek dagang & hak cipta.

## 1. Ringkasan

Web app kuis interaktif realtime. Host (guru/trainer/MC) bikin kuis, tampilkan PIN di layar besar, peserta join lewat HP/laptop tanpa akun, jawab soal bareng-bareng, skor dan leaderboard update live.

**Konteks rilis:** tahap 1 untuk pameran 25 November 2026 sekaligus tugas kuliah (demo stabil, gratis, ada efek wow); tahap 2 dibuka untuk publik kalau responsnya baik, dengan fitur pembeda dari bagian 4.

**Problem:**

- Kuis kelas/event biasanya satu arah dan membosankan.
- Tools yang ada banyak dibatasi fitur di paket gratis.
- Pasar lokal butuh UI Bahasa Indonesia, ringan di HP low-end, dan hemat kuota.

**Goals:**

- Peserta bisa join < 10 detik dari scan QR / input PIN.
- Satu game stabil untuk **100–300 pemain** bersamaan (MVP), skalabel lebih lanjut.
- Host bisa bikin kuis 10 soal dalam < 5 menit.

**Non-goals (MVP):**

- Aplikasi native iOS/Android (cukup web responsif/PWA).
- Marketplace kuis publik dengan monetisasi.
- Video call / live streaming terintegrasi.

## 2. Target User & Persona

- **Host / Guru (primer):** bikin kuis, host sesi, lihat laporan hasil.
- **Player / Siswa (primer):** join pakai PIN + nickname, jawab dari HP.
- **Trainer/MC event (sekunder):** butuh tampilan besar yang rapi dan kontrol tempo.
- **Admin (internal):** moderasi konten dan user.

## 3. Scope

### MVP (Must have)

- Auth: login Google + mode tamu/anonim (host dan player), AI Quiz Generator (lihat bagian 4).
- Quiz builder: soal pilihan ganda (4 opsi), benar/salah, gambar opsional.
- Host game: lobby, PIN 6 digit, QR code, kontrol start/next/skip.
- Player join tanpa akun (PIN + nickname).
- Timer per soal, scoring berbasis kecepatan, leaderboard.
- Podium akhir + laporan hasil (export CSV/XLSX).
- Responsif HP (player) dan layar besar (host).

### v1.1 (Should have)

- Mode tim, streak bonus, power-up sederhana.
- Import soal dari Excel/CSV.
- Library kuis pribadi + duplikat kuis.
- Mode **self-paced / homework** (tanpa host live).
- Bank soal + tag/kategori.

### v2 (Nice to have)

- Tipe soal tambahan: isian singkat, urutan, poll, word cloud.
- Monetisasi: paket Pro, batas pemain lebih besar, branding kustom.
- Kuis publik + share link, organisasi/kelas.
- Theme & musik kustom, PWA offline-lite.

## 4. Fitur Unggulan vs Kahoot

Gameplay inti dibuat sama persis dengan Kahoot (PIN, kuis pilihan ganda, skor kecepatan, leaderboard, podium); pembedanya ada di kapasitas gratis, AI, dan analitik. Mekanik umum boleh sama, tapi nama, logo, warna, aset visual, dan audio harus orisinal.

**Titik lemah Kahoot yang bisa diserang** (dicek Oktober 2026):

- Akun gratis pribadi dibatasi 10 pemain per game, guru K-12 sampai 40 ([Trivia Anywhere](https://www.triviaanywhere.com/blog/kahoot-free-player-limit)).
- Paket berbayar termurah (Bronze, sekitar $36/tahun) baru memberi 50 pemain ([EdTech Map](https://kinescope.com/edtech-map/kahoot)).
- Tugas mandiri (homework) tanpa deadline butuh paket lebih tinggi ([Mindomax](https://www.mindomax.com/kahoot-alternatives)).

| Fitur pembeda | Isi | Tahap | Efek wow di pameran |
| --- | --- | --- | --- |
| 100–300 pemain gratis | Satu sesi gratis sampai 300 pemain, jauh di atas batas gratis Kahoot | MVP | Tinggi |
| AI Quiz Generator | Ketik topik, tempel teks, atau upload PDF → soal, opsi, kunci, dan pembahasan dalam hitungan detik; host edit dulu sebelum dipakai | MVP | Tinggi |
| Pembahasan otomatis | Penjelasan jawaban benar tampil setelah tiap soal; player bisa review kesalahannya di akhir | MVP | Sedang |
| Hemat kuota & HP low-end | JS awal < 150 KB, payload socket kecil, mode data saver | MVP | Rendah (penting untuk publik) |
| Analitik cerdas | Soal tersulit, jawaban salah yang paling sering dipilih (miskonsepsi), daftar siswa perlu remedial, ringkasan AI topik yang perlu diulang | Setelah pameran (v1.1) | Tinggi |
| Power-up & mode tim | Double points, 50/50, freeze; mode tim dan mode kolaboratif kelas vs waktu | v1.1 | Tinggi |
| Tipe soal lebih banyak | Isian singkat, urutan, jodohkan, poll, word cloud | v1.1 | Sedang |
| Homework / self-paced gratis | Kuis dikerjakan mandiri tanpa host, deadline bebas | v1.1 | Rendah |
| Konten lokal | UI Bahasa Indonesia, template soal (kurikulum, UTBK, umum) | v1.1 | Sedang |
| Aksesibilitas | Dark mode, kontras tinggi, baca soal dengan text-to-speech (Web Speech API), font ramah disleksia | v1.1 | Sedang |

**Rekomendasi untuk pameran (waktu ±3–4 minggu):** fokus 3 hal: kapasitas 300 pemain (tampilkan counter pemain live di layar host), demo AI generator (ketik topik, kuis jadi < 30 detik), dan pembahasan jawaban. Analitik, power-up, dan tipe soal tambahan ditunda ke setelah pameran kecuali waktu sisa.

**Spesifikasi AI Quiz Generator:**

- Input: topik, teks, atau PDF; pilih jumlah soal, tingkat kesulitan, dan bahasa.
- Output berupa JSON terstruktur yang divalidasi Zod, masuk editor sebagai draf; host wajib review sebelum game.
- Biaya terkendali: model kecil dan cepat, batas generate per akun per hari (mis. 10), mode tamu dibatasi lebih ketat, API key hanya di server.
- Soal bisa salah (halusinasi), jadi beri label "dibuat AI, periksa dulu" di editor.

## 5. User Flow

**Host:**

1. Login → Dashboard → Buat kuis (judul, soal, timer, poin).
2. Klik **Host** → sistem generate PIN + QR → lobby menampilkan nickname yang join live.
3. Start → soal tampil di layar host → countdown → jawaban masuk → reveal jawaban benar + distribusi jawaban.
4. Leaderboard sementara → Next sampai selesai → podium → laporan.

**Player:**

1. Buka `/join` atau scan QR → input PIN → input nickname.
2. Tunggu di lobby → soal muncul (HP hanya tampil tombol warna/bentuk atau teks opsi).
3. Pilih jawaban → feedback benar/salah + poin + ranking.
4. Lihat posisi akhir.

## 6. Functional Requirements

| ID | Requirement | Prioritas |
| --- | --- | --- |
| FR-01 | Login Google (host) atau mode tamu/anonim; player boleh anonim atau login Google untuk menyimpan riwayat | Must |
| FR-02 | CRUD kuis: judul, deskripsi, cover, daftar soal | Must |
| FR-03 | Soal: teks, gambar opsional, 2–4 opsi, 1+ jawaban benar, timer 5–120 dtk, poin (standar/ganda/tanpa poin) | Must |
| FR-04 | Reorder soal (drag & drop), duplikat soal | Should |
| FR-05 | Host memulai sesi → PIN unik 6 digit (aktif selama sesi) + QR | Must |
| FR-06 | Player join dengan PIN + nickname unik per sesi; filter kata kasar | Must |
| FR-07 | Lobby realtime: daftar pemain, host dapat kick pemain | Must |
| FR-08 | Host kontrol: start, pause, skip, next, end game | Must |
| FR-09 | Server-authoritative timer dan penilaian (client tidak bisa curang) | Must |
| FR-10 | Scoring berbasis kecepatan + streak bonus (opsional) | Must |
| FR-11 | Leaderboard top 5 antar soal dan podium akhir | Must |
| FR-12 | Reconnect: player yang putus bisa balik dengan sesi sama (token) | Must |
| FR-13 | Laporan sesi: skor per pemain, akurasi per soal, export CSV/XLSX | Should |
| FR-14 | Import soal via template Excel/CSV | Should |
| FR-15 | Mode tim | Could |
| FR-16 | i18n: Indonesia (default) dan Inggris | Should |
| FR-17 | AI Quiz Generator: input topik/teks/PDF menghasilkan draf soal (opsi, kunci, pembahasan) yang diedit host sebelum dipakai; rate limit per akun | Must |
| FR-18 | Pembahasan jawaban per soal dan recap kesalahan pribadi di akhir game | Must |
| FR-19 | Analitik: soal tersulit, opsi salah paling sering dipilih, ringkasan topik remedial | Should |

### Aturan Scoring (usulan)

- Jawaban salah / tidak menjawab: **0 poin**.
- Jawaban benar: `poin = round( (1 − (waktuRespon / waktuSoal) / 2) × poinMaks )`, jadi jawab instan ≈ poin penuh, jawab di detik terakhir ≈ 50%.
- Poin ganda: `poinMaks × 2`.
- Streak bonus: +100 per jawaban benar beruntun, maksimal +500 (bisa dinonaktifkan host).
- Waktu respon dihitung **di server** (timestamp soal dikirim vs jawaban diterima, dikompensasi latency rata-rata).

## 7. Arsitektur Realtime

**State machine sesi game:** `LOBBY → QUESTION_INTRO → QUESTION_ACTIVE → QUESTION_REVEAL → LEADERBOARD → (loop) → PODIUM → ENDED`

**Prinsip:**

- Server adalah *single source of truth* (state, timer, skor).
- State sesi aktif disimpan di **Redis** (cepat, TTL otomatis); hasil akhir dipersist ke PostgreSQL.
- Komunikasi via **WebSocket (Socket.IO)**, room per PIN (`game:{pin}`).
- Horizontal scaling: Socket.IO Redis adapter + sticky session di load balancer.
- Payload kecil: kirim hanya event delta, bukan seluruh state.

**Event Socket (contoh):**

- Host → server: `host:create`, `host:start`, `host:next`, `host:skip`, `host:kick`, `host:end`
- Player → server: `player:join`, `player:answer`, `player:rejoin`
- Server → semua: `lobby:update`, `question:show`, `question:tick`, `question:reveal`, `leaderboard:update`, `game:end`
- Server → player: `answer:ack` (diterima), `player:result` (benar/salah, poin, rank)

> **Catatan hosting penting:** Vercel/serverless tidak cocok untuk WebSocket persisten. Pisahkan **realtime server** (Node long-running) dari frontend Next.js, deploy di VPS / Railway / Fly.io / Render.

## 8. Tech Stack (Rekomendasi)

Disesuaikan dengan skill yang udah lu pakai (React, Next.js) supaya cepat jalan.

| Layer | Pilihan | Alasan |
| --- | --- | --- |
| Frontend | **Next.js (App Router) + TypeScript** | Sudah familiar, SSR untuk landing/SEO, routing rapi |
| UI | **Tailwind CSS + shadcn/ui** | Cepat bikin UI konsisten |
| Animasi | **Framer Motion** | Transisi soal, countdown, podium |
| State client | **Zustand** | Ringan untuk state game |
| Realtime server | **Node.js + Socket.IO** (TypeScript) | Room, reconnect, fallback bawaan |
| Cache/State sesi | **Redis** (Upstash / self-host) | State game cepat + pub/sub |
| Database | **PostgreSQL + Prisma ORM** | Relasional, migrasi mudah |
| Auth | **Auth.js (NextAuth)** | Email + Google OAuth |
| Validasi | **Zod** | Skema bersama client–server untuk event socket |
| Storage gambar | **Cloudflare R2 / S3 / UploadThing** | Upload gambar soal |
| Monorepo | **pnpm workspaces + Turborepo** | Share tipe antara `web` dan `realtime` |
| Testing | **Vitest, Playwright, Artillery/k6** | Unit, E2E, load test ratusan koneksi |
| CI/CD | **GitHub Actions + Docker** | Build & deploy otomatis |
| Observability | **Sentry + Pino logger** | Error tracking dan log terstruktur |
| AI generator | Gemini API free tier (model Flash/Flash-Lite) via kunci Google AI Studio, output JSON divalidasi Zod, dengan adapter provider supaya bisa diganti (mis. Claude API) | Gratis tanpa kartu kredit untuk prototipe; limit per menit/hari terbatas, jadi cache dan batasi generate; API key di server |

**Alternatif kalau mau lebih simpel:**

- **Supabase** (Postgres + Auth + Realtime) → kurangi kerjaan backend, tapi kontrol logika game lebih terbatas.
- **Laravel + Reverb/Pusher** → kalau lu lebih nyaman di PHP/Laravel (Reverb = WebSocket server resmi Laravel).
- **PartyKit / Cloudflare Durable Objects** → satu room = satu object, skalabel dan murah, tapi kurva belajar baru.

**Struktur monorepo:**

```
apps/
  web/        # Next.js (host dashboard, player UI)
  realtime/   # Node + Socket.IO game server
packages/
  shared/     # tipe TS, skema Zod, konstanta event, fungsi scoring
  db/         # Prisma schema + client
```

### Hosting untuk Pameran (JagoanHosting / Niagahoster)

Yang dibutuhkan adalah VPS atau Cloud VPS, bukan hosting cPanel biasa: server realtime harus menjalankan proses Node.js yang hidup terus dan menerima koneksi WebSocket.

- **Jangan pakai shared/"Unlimited" hosting (cPanel):** umumnya tanpa akses root untuk proses permanen dan Redis. Kalau paketnya menawarkan Node.js app, tanya dulu apakah WebSocket didukung.
- **Rekomendasi: JagoanHosting Cloud VPS (KVM), paket Galaxy:** 4 vCPU, 4 GB RAM, 100 GB SSD, Rp200.000/bulan belum termasuk PPN 11%, IP publik sendiri, template Docker tersedia, harga perpanjangan sama, garansi uang kembali 30 hari ([JagoanHosting](https://www.jagoanhosting.com/vps-murah/)). Layanan unmanaged: support terbatas pada restart, rebuild, dan tracing error.
- **Hindari paket Alpine/Summit/Zenith:** resource dan IP publik shared, tidak disebut KVM, dan dikelola lewat panel Webuzo; kurang cocok untuk Docker dan WebSocket ([JagoanHosting](https://www.jagoanhosting.com/vps-hosting/)).
- **Pembanding: Hostinger KVM 2** (2 vCPU, 8 GB RAM, 100 GB NVMe): Rp202.320/bulan di periode panjang; harga 1 bulan lebih mahal dan harga perpanjangan lebih tinggi. Masuk akal kalau memang dipakai 12–24 bulan.
- **Syarat paket:** akses root, Ubuntu 22.04/24.04, minimal 2 vCPU + 2 GB RAM (4 GB lebih aman; ini perkiraan, validasi dengan load test), server di Indonesia, bisa pasang Caddy/Nginx + SSL, WebSocket tidak diputus timeout pendek.
- **Setup satu server:** Docker Compose berisi `web` (Next.js), `realtime` (Socket.IO), Redis, PostgreSQL, dan reverse proxy; SSL gratis via Let's Encrypt/Caddy, DNS via Cloudflare.
- **Alternatif hemat:** frontend di Vercel (gratis), hanya server realtime di VPS.
- **Strategi sewa:** develop lokal dulu, sewa VPS 1 bulan baru di sekitar 20 November supaya masa sewa terpakai untuk pameran; perpanjang 3 bulan kalau lanjut ke publik.
- **Cadangan pameran:** online-first. Semua peserta (Wi-Fi venue atau data seluler) join ke VPS lewat domain/QR yang sama. Server di laptop dengan router lokal hanya cadangan terakhir kalau internet venue mati; di mode itu semua peserta pindah ke Wi-Fi lokal. Login Google dan AI generator butuh internet, jadi siapkan kuis lebih dulu; mode tamu tetap jalan tanpa internet.

## 9. Data Model (Ringkas)

- **User**: id, name, email, avatar, createdAt
- **Quiz**: id, ownerId, title, description, coverUrl, visibility, createdAt
- **Question**: id, quizId, order, type, text, imageUrl, timeLimit, points, options (JSON)
- **GameSession**: id, quizId, hostId, pin, status, startedAt, endedAt, settings (JSON)
- **Player**: id, sessionId, nickname, finalScore, finalRank
- **Answer**: id, sessionId, playerId, questionId, optionIndex, isCorrect, responseTimeMs, pointsAwarded

**Index penting:** `GameSession.pin` (unik saat aktif), `Answer(sessionId, questionId)`, `Quiz.ownerId`.

## 10. Non-Functional Requirements

- **Performa:** latensi event < 200 ms (p95) di jaringan 4G; UI player < 150 KB JS awal; jalan di HP Android RAM 2 GB.
- **Skalabilitas:** MVP 300 pemain/sesi; target 1.000+ lewat scale-out + Redis adapter.
- **Ketersediaan:** 99,5% (MVP); graceful reconnect saat server restart.
- **Aksesibilitas:** kontras warna, tombol jawaban punya warna **dan** bentuk/label, ukuran target sentuh ≥ 44 px, dukungan keyboard di host.
- **Kompatibilitas:** Chrome, Safari, Firefox, Edge versi terbaru; iOS Safari wajib.
- **Lokalisasi:** Bahasa Indonesia default.

## 11. Keamanan & Anti-Abuse

- Rate limit join per IP (anti brute-force PIN) dan per-socket untuk event jawaban.
- Kunci jawaban benar **tidak pernah** dikirim ke client sebelum fase reveal.
- Validasi semua payload socket dengan Zod; tolak event di luar state yang valid.
- Nickname: sanitasi XSS + filter kata kasar; host bisa kick.
- Auth host pakai cookie httpOnly + CSRF protection; upload gambar dibatasi tipe dan ukuran.
- Privasi: player tidak butuh akun, simpan data minimum; sediakan kebijakan privasi dan penghapusan data. Perhatikan aspek data anak/siswa.
- Lakukan uji keamanan dasar (OWASP ZAP/Burp Suite) sebelum rilis.

## 12. Metrik Keberhasilan

- Waktu rata-rata dari buka link → masuk lobby.
- % sesi selesai tanpa disconnect massal.
- Rata-rata pemain per sesi dan jumlah sesi per host per minggu.
- Retensi host 4 minggu.
- Error rate socket dan p95 latensi.

## 13. Roadmap & Milestone

| Tanggal | Milestone | Output |
| --- | --- | --- |
| 6–9 Nov | Fondasi | Monorepo, DB schema, login Google + mode tamu |
| 10–14 Nov | Quiz builder + engine awal | CRUD kuis/soal; lobby, PIN/QR, state machine |
| 15–19 Nov | Gameplay inti | Timer server-side, scoring, leaderboard, podium, reconnect |
| 20–22 Nov | AI + pembahasan + deploy | AI Quiz Generator, pembahasan jawaban, polish UI dan suara; sewa VPS 1 bulan dan deploy |
| 23–24 Nov | Uji & gladi resik | Load test 100–300 koneksi, mode offline di laptop, backup online, kuis demo siap |
| 25 Nov | Hari pameran | Demo live |
| Garis potong | Waktu hanya ±19 hari | Buang analitik, power-up, import Excel, tipe soal tambahan, mode tim. Kalau molor, korbankan pembahasan dulu, lalu AI generator; game inti harus selesai |

## 14. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Koneksi WebSocket putus di jaringan buruk | Pemain keluar dari game | Auto-reconnect + rejoin token + state di Redis |
| Lonjakan pemain di satu sesi | Server lag | Load test awal, Redis adapter, scale-out |
| Kecurangan (bot, tebak PIN) | Hasil tidak adil | Rate limit, nickname unik, jawaban divalidasi server |
| Isu IP/merek dagang vs Kahoot | Legal | Branding, aset, dan audio orisinal |
| Scope creep | Molor | Kunci MVP, fitur lain masuk backlog v1.1/v2 |
| Biaya hosting realtime | Boncos | Mulai di VPS kecil, monitor, optimasi payload |
| Biaya API AI membengkak (fitur gratis) | Anggaran habis | Batas generate per akun/hari, model kecil, cache topik umum |
| Wi-Fi atau server bermasalah saat pameran | Demo gagal | Versi lokal di laptop + hotspot, kuis demo disiapkan sebelumnya |
| Router/AP pameran tidak kuat untuk 100–300 HP | Peserta gagal join | Pakai access point kelas event (bisa lebih dari satu), uji dengan banyak HP; hotspot HP biasa terbatas jumlah perangkatnya. Cadangan: peserta pakai data seluler ke VPS |

## 15. Repo, Library, dan Skill yang Disarankan

### Repo / library open source untuk dipelajari atau dipakai

- **socketio/socket.io** + **socketio/socket.io-redis-adapter**: inti realtime dan scaling multi-instance.
- **colyseus/colyseus**: framework game server multiplayer (alternatif kalau mau state sync otomatis).
- **partykit/partykit**: realtime room di edge (alternatif).
- **prisma/prisma**: ORM dan migrasi.
- **shadcn-ui/ui**, **tailwindlabs/tailwindcss**, **framer/motion**: UI dan animasi.
- **pmndrs/zustand**: state management.
- **colinhacks/zod**: validasi skema.
- **nextauthjs/next-auth**: autentikasi.
- **vercel/turborepo**: monorepo.
- **artilleryio/artillery** atau **grafana/k6**: load test WebSocket.
- **microsoft/playwright**: E2E test multi-klien (simulasi host + banyak player).
- **soldair/node-qrcode** atau **react-qr-code**: generate QR PIN.
- **SheetJS/sheetjs**: import/export Excel.

**Tambahan untuk AI dan deploy:**

- **googleapis/js-genai**: SDK untuk AI Quiz Generator.
- **unjs/unpdf** atau **mozilla/pdf.js**: ekstrak teks dari PDF sebelum dikirim ke AI.
- **caddyserver/caddy**: reverse proxy dengan SSL otomatis di VPS.
- **docker/compose**: jalankan semua service di satu VPS.

> Cari juga repo "kahoot clone" / "realtime quiz socket.io" di GitHub sebagai referensi arsitektur. **Jangan salin kode mentah-mentah**, cek lisensinya dulu (MIT/Apache aman dipakai, GPL punya kewajiban tertentu).

### Skill / tooling yang bisa dipakai dalam proses pengerjaan

- **Claude Code**: scaffold monorepo, tulis game engine, generate test, refactor. Buat file `CLAUDE.md` berisi konvensi proyek (struktur monorepo, nama event socket, aturan scoring) supaya hasilnya konsisten.
- **Skill `frontend-design`**: bikin UI host/player yang tidak terkesan template generik (tipografi, palet warna, layout layar besar vs HP).
- **Skill `xlsx`**: bikin template import soal dan format laporan export.
- **Skill `pdf` / `docx`**: laporan hasil kuis atau dokumentasi untuk dikumpulkan/diprint.
- **Figma**: prototipe alur host & player sebelum coding.
- **MCP server** (GitHub, Postgres, Playwright): biar agent bisa baca repo, query DB lokal, dan jalankan E2E langsung.

## 16. Keputusan Produk & Pertanyaan Tersisa

| Topik | Keputusan |
| --- | --- |
| Tujuan | Tahap 1 untuk pameran dan tugas kuliah; dibuka publik kalau berjalan baik, dengan fitur pembeda dari bagian 4 |
| Nama produk | SIQAP (Sistem Informasi Akademik Pelajar) |
| Waktu pameran | 25 November 2026; lihat garis potong di roadmap |
| Format pameran | Di venue, online-first lewat VPS (peserta pakai Wi-Fi venue atau data seluler, HP sendiri); server laptop lokal sebagai cadangan terakhir |
| Monetisasi | Gratis dulu, paket berbayar ditunda ke v2 |
| Batas sesi gratis | 100–300 pemain per sesi; target pameran sekitar 250 pemain (set angka final setelah load test) |
| Login | Google login + mode anonim/tamu; player boleh anonim |
| Hosting | JagoanHosting Cloud VPS (KVM) paket Galaxy, Rp200.000/bulan (belum final), sewa bulanan; lihat bagian 8 |
| AI Quiz Generator | Masuk MVP; pakai free tier (Gemini API) lewat adapter provider supaya bisa diganti |
| Jaringan venue | Access point dari panitia (dinilai kuat); bawa access point sendiri kalau ternyata tidak ada |
| Kuis demo | Topik pengetahuan umum, disiapkan sebelum hari H |

**Pertanyaan tersisa:**

1. Konfirmasi final paket VPS (Galaxy atau alternatif).
2. Tanya JagoanHosting via WhatsApp: Docker dan port WebSocket aman dipakai di Cloud VPS KVM.
