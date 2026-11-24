# SIQAP Contract (v0.1)

Kontrak bersama antara `apps/web`, `apps/realtime`, dan `packages/*`. Sumber kebenaran untuk nama event, bentuk payload, state machine, dan rumus skor.

**Aturan perubahan:** file ini dan `packages/shared/src/contract/*` harus selalu sama. Mengubah salah satunya wajib mengubah yang lain dalam PR yang sama, diberi label `contract`, dan tidak boleh dimerge sebelum agen pemilik `apps/web` dan `apps/realtime` diberi tahu.

Kode di bawah memakai Zod. Salin ke `packages/shared/src/contract/` apa adanya, lalu pecah per file kalau perlu.

---

## 1. Prinsip

- Server adalah sumber kebenaran: state sesi, timer, penilaian, dan skor hanya dihitung di server.
- Semua payload dari client divalidasi dengan Zod di server. Payload tidak valid ditolak dengan `INVALID_PAYLOAD`.
- Kunci jawaban (`correctIndexes`) dan `explanation` tidak pernah dikirim ke player sebelum event `question:reveal`.
- Semua timestamp adalah milisecond epoch **dari jam server** (`Date.now()` di server). Client hanya menghitung mundur dari `endsAt - serverNow`.
- Satu player hanya boleh menjawab satu kali per soal; jawaban pertama yang dipakai.
- Nama event memakai format `domain:aksi` (huruf kecil).

## 2. Konstanta

```ts
export const PIN_LENGTH = 6;
export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 20;
export const MAX_PLAYERS_HARD_CAP = 300;      // angka final ditentukan setelah load test
export const QUESTION_TIME_MIN_SEC = 5;
export const QUESTION_TIME_MAX_SEC = 120;
export const QUESTION_TIME_DEFAULT_SEC = 15;
export const MAX_POINTS_DEFAULT = 1000;
export const STREAK_BONUS_STEP = 100;
export const STREAK_BONUS_CAP = 500;
export const LEADERBOARD_TOP_N = 5;
export const HOST_DISCONNECT_PAUSE_MS = 30_000;   // host putus > 30 dtk: game auto-pause
export const HOST_DISCONNECT_END_MS = 600_000;    // host putus > 10 menit: game diakhiri
export const REDIS_TTL_SEC = 6 * 60 * 60;         // state sesi aktif hidup 6 jam
```

## 3. Skema dasar

```ts
import { z } from "zod";

export const Pin = z.string().regex(/^\d{6}$/);
export const Nickname = z.string().trim().min(2).max(20);
export const OptionIndex = z.number().int().min(0).max(3);

export const QuestionType = z.enum(["multiple_choice", "true_false"]);
export const PointsMode = z.enum(["standard", "double", "none"]);

export const GamePhase = z.enum([
  "LOBBY",
  "QUESTION_INTRO",
  "QUESTION_ACTIVE",
  "QUESTION_REVEAL",
  "LEADERBOARD",
  "PODIUM",
  "ENDED",
]);
export type GamePhase = z.infer<typeof GamePhase>;

export const QuestionInput = z.object({
  id: z.string(),
  type: QuestionType,
  text: z.string().min(1).max(2000),
  imageUrl: z.string().url().optional(),
  options: z.array(z.object({ text: z.string().min(1).max(500) })).min(2).max(4),
  correctIndexes: z.array(OptionIndex).min(1),   // MVP: UI hanya mengizinkan satu jawaban benar
  timeLimitSec: z.number().int().min(5).max(120).default(15),
  pointsMode: PointsMode.default("standard"),
  explanation: z.string().max(1500).optional(),  // tampil saat reveal
});
export type QuestionInput = z.infer<typeof QuestionInput>;

export const GameSettings = z.object({
  maxPlayers: z.number().int().min(1).max(300).default(300),
  streakBonus: z.boolean().default(true),
  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
  showLeaderboardEachQuestion: z.boolean().default(true),
});
export type GameSettings = z.infer<typeof GameSettings>;

export const PlayerPublic = z.object({
  playerId: z.string(),
  nickname: Nickname,
});

export const LeaderboardEntry = z.object({
  playerId: z.string(),
  nickname: Nickname,
  score: z.number().int(),
  rank: z.number().int().min(1),
});
```

## 4. Kode error

```ts
export const ErrorCode = z.enum([
  "INVALID_PAYLOAD",
  "RATE_LIMITED",
  "PIN_NOT_FOUND",
  "GAME_FULL",
  "GAME_ALREADY_STARTED",
  "NICKNAME_TAKEN",
  "NICKNAME_INVALID",     // tidak lolos panjang atau filter kata kasar
  "NOT_HOST",
  "INVALID_PHASE",        // aksi tidak valid di fase sekarang
  "ALREADY_ANSWERED",
  "TIME_UP",
  "REJOIN_FAILED",
  "UNAUTHORIZED",
  "INTERNAL",
]);
export type ErrorCode = z.infer<typeof ErrorCode>;

export type AckResult<T extends object = {}> =
  | ({ ok: true } & T)
  | { ok: false; error: ErrorCode; message?: string };
```

## 5. Event: client → server

Setiap event memakai acknowledgement callback Socket.IO dengan tipe `AckResult`.

```ts
// Host
export const HostCreate = z.object({ quizId: z.string(), settings: GameSettings.optional() });
export const HostRejoin = z.object({ pin: Pin, hostToken: z.string() });
export const HostAction = z.object({ pin: Pin });                       // start, next, skip, pause, resume, end
export const HostKick   = z.object({ pin: Pin, playerId: z.string() });

// Player
export const PlayerJoin   = z.object({ pin: Pin, nickname: Nickname });
export const PlayerRejoin = z.object({ pin: Pin, rejoinToken: z.string() });
export const PlayerAnswer = z.object({
  pin: Pin,
  questionIndex: z.number().int().min(0),
  optionIndexes: z.array(OptionIndex).min(1).max(4),
});

export interface ClientToServerEvents {
  "host:create":  (p: z.infer<typeof HostCreate>,  ack: (r: AckResult<{ pin: string; hostToken: string }>) => void) => void;
  "host:rejoin":  (p: z.infer<typeof HostRejoin>,  ack: (r: AckResult) => void) => void;
  "host:start":   (p: z.infer<typeof HostAction>,  ack: (r: AckResult) => void) => void;
  "host:next":    (p: z.infer<typeof HostAction>,  ack: (r: AckResult) => void) => void;
  "host:skip":    (p: z.infer<typeof HostAction>,  ack: (r: AckResult) => void) => void;
  "host:pause":   (p: z.infer<typeof HostAction>,  ack: (r: AckResult) => void) => void;
  "host:resume":  (p: z.infer<typeof HostAction>,  ack: (r: AckResult) => void) => void;
  "host:end":     (p: z.infer<typeof HostAction>,  ack: (r: AckResult) => void) => void;
  "host:kick":    (p: z.infer<typeof HostKick>,    ack: (r: AckResult) => void) => void;

  "player:join":   (p: z.infer<typeof PlayerJoin>,   ack: (r: AckResult<{ playerId: string; rejoinToken: string }>) => void) => void;
  "player:rejoin": (p: z.infer<typeof PlayerRejoin>, ack: (r: AckResult<{ playerId: string; phase: GamePhase }>) => void) => void;
  "player:answer": (p: z.infer<typeof PlayerAnswer>, ack: (r: AckResult) => void) => void;
}
```

Arti `host:*`:
- `start`: dari `LOBBY` ke soal pertama (minimal 1 player).
- `next`: maju ke langkah berikutnya sesuai state machine (reveal → leaderboard → soal berikutnya).
- `skip`: lewati timer soal aktif, langsung ke `QUESTION_REVEAL`.
- `pause` / `resume`: bekukan dan lanjutkan timer; sisa waktu dipertahankan.
- `end`: akhiri game, langsung ke `PODIUM` lalu `ENDED`.

## 6. Event: server → client

```ts
export const LobbyUpdate = z.object({
  pin: Pin,
  players: z.array(PlayerPublic),
  count: z.number().int(),
});

export const GamePhaseEvent = z.object({
  phase: GamePhase,
  at: z.number(),                   // ms epoch server
  paused: z.boolean().default(false),
});

// Versi publik: TANPA correctIndexes dan explanation
export const QuestionShow = z.object({
  questionIndex: z.number().int(),
  total: z.number().int(),
  type: QuestionType,
  text: z.string(),
  imageUrl: z.string().url().optional(),
  options: z.array(z.string()),
  timeLimitSec: z.number().int(),
  startedAt: z.number(),            // ms epoch server
  endsAt: z.number(),               // ms epoch server
  pointsMode: PointsMode,
});

export const QuestionTick = z.object({
  questionIndex: z.number().int(),
  remainingMs: z.number().int(),
  answeredCount: z.number().int(),  // untuk layar host
});

export const QuestionReveal = z.object({
  questionIndex: z.number().int(),
  correctIndexes: z.array(OptionIndex),
  explanation: z.string().optional(),
  distribution: z.array(z.number().int()),   // jumlah pemilih per opsi
});

// Dikirim hanya ke player yang bersangkutan
export const PlayerResult = z.object({
  questionIndex: z.number().int(),
  isCorrect: z.boolean(),
  pointsAwarded: z.number().int(),
  streak: z.number().int(),
  totalScore: z.number().int(),
  rank: z.number().int().min(1),
});

export const LeaderboardUpdate = z.object({
  top: z.array(LeaderboardEntry).max(5),
  totalPlayers: z.number().int(),
});

export const GameEnd = z.object({
  podium: z.array(LeaderboardEntry).max(3),
  // data personal tiap player dikirim lewat "player:final"
});

export const PlayerFinal = z.object({
  finalRank: z.number().int(),
  finalScore: z.number().int(),
  correctCount: z.number().int(),
  totalQuestions: z.number().int(),
  mistakes: z.array(z.object({
    questionIndex: z.number().int(),
    questionText: z.string().optional(),
    yourAnswer: z.array(OptionIndex),
    yourAnswerTexts: z.array(z.string()).optional(),
    correctIndexes: z.array(OptionIndex),
    correctAnswerTexts: z.array(z.string()).optional(),
    explanation: z.string().optional(),
  })),
});

export const HostMonitorPlayer = z.object({
  playerId: z.string(),
  nickname: Nickname,
  connected: z.boolean(),
  score: z.number().int(),
  rank: z.number().int().min(1),
  correctCount: z.number().int().min(0),
  answeredTotal: z.number().int().min(0),
  avgResponseMs: z.number().int().min(0),
  currentAnswered: z.boolean(),
  currentResponseMs: z.number().int().min(0).nullable(),
  currentIsCorrect: z.boolean().nullable(),
});

export const HostMonitorUpdate = z.object({
  questionIndex: z.number().int(),
  totalQuestions: z.number().int(),
  answeredCount: z.number().int(),
  totalPlayers: z.number().int(),
  fastestPlayer: z
    .object({
      playerId: z.string(),
      nickname: Nickname,
      responseMs: z.number().int().min(0),
      isCorrect: z.boolean().nullable(),
    })
    .nullable(),
  players: z.array(HostMonitorPlayer),
});

export interface ServerToClientEvents {
  "lobby:update":       (p: z.infer<typeof LobbyUpdate>) => void;
  "game:phase":         (p: z.infer<typeof GamePhaseEvent>) => void;
  "question:show":      (p: z.infer<typeof QuestionShow>) => void;
  "question:tick":      (p: z.infer<typeof QuestionTick>) => void;
  "question:reveal":    (p: z.infer<typeof QuestionReveal>) => void;
  "player:result":      (p: z.infer<typeof PlayerResult>) => void;
  "leaderboard:update": (p: z.infer<typeof LeaderboardUpdate>) => void;
  "game:end":           (p: z.infer<typeof GameEnd>) => void;
  "player:final":       (p: z.infer<typeof PlayerFinal>) => void;
  "player:kicked":      (p: { reason: "host" }) => void;
  "host:monitor":       (p: z.infer<typeof HostMonitorUpdate>) => void;
}
```

Catatan:
- `question:tick` interval 1 detik dikirim ke seluruh ruang `game:{pin}` sebagai sumber waktu bersama: layar host dan pemain membaca detik yang sama, dan saat pause tick berhenti sehingga semua layar beku bersamaan. Tick jawaban (dengan `answeredCount`) tetap hanya ke `host:{pin}`.
- `player:result` dikirim saat `QUESTION_REVEAL`, bukan saat menjawab. Saat menjawab player hanya menerima ack `{ ok: true }`.

## 7. Room Socket.IO

| Room | Isi | Dipakai untuk |
|---|---|---|
| `game:{pin}` | host + semua player | broadcast fase, soal, `question:tick`, reveal, leaderboard |
| `host:{pin}` | hanya host | `question:tick` (dengan `answeredCount`), event khusus host |
| `player:{playerId}` | satu player | `player:result`, `player:final`, `player:kicked` |

## 8. State machine

```
LOBBY → QUESTION_INTRO → QUESTION_ACTIVE → QUESTION_REVEAL → LEADERBOARD
                ▲                                                   │
                └───────────── (masih ada soal berikutnya) ─────────┘
                                                                    │ (soal habis)
                                                                    ▼
                                                                 PODIUM → ENDED
```

| Dari | Pemicu | Ke | Catatan |
|---|---|---|---|
| `LOBBY` | `host:start` | `QUESTION_INTRO` | minimal 1 player |
| `QUESTION_INTRO` | timer 3 dtk | `QUESTION_ACTIVE` | kirim `question:show`, timer soal mulai |
| `QUESTION_ACTIVE` | timer habis, semua sudah menjawab, atau `host:skip` | `QUESTION_REVEAL` | hitung skor, kirim `question:reveal` + `player:result` |
| `QUESTION_REVEAL` | timer 7 dtk atau `host:next` | `LEADERBOARD` | kirim `leaderboard:update` |
| `LEADERBOARD` | timer 5 dtk atau `host:next` | `QUESTION_INTRO` atau `PODIUM` | `PODIUM` jika soal terakhir |
| `PODIUM` | `host:next` atau `host:end` | `ENDED` | kirim `game:end` + `player:final` |
| fase apa pun | `host:end` | `PODIUM` | |

Jika `showLeaderboardEachQuestion = false`, fase `LEADERBOARD` dilewati kecuali setelah soal terakhir.

Fase `QUESTION_REVEAL` dan `LEADERBOARD` maju otomatis lewat timer (7 dtk dan 5 dtk) supaya peserta tidak menunggu konfirmasi host antar soal; `host:next` tetap berlaku untuk maju lebih cepat. `PODIUM` tetap menunggu host.

Aksi di luar tabel ini mengembalikan `INVALID_PHASE`.

## 9. Aturan skor

```ts
export function calcPoints(args: {
  isCorrect: boolean;
  responseMs: number;        // jawaban diterima server − startedAt
  timeLimitMs: number;
  maxPoints: number;         // MAX_POINTS_DEFAULT
  pointsMode: "standard" | "double" | "none";
}): number {
  const { isCorrect, responseMs, timeLimitMs, maxPoints, pointsMode } = args;
  if (!isCorrect || pointsMode === "none") return 0;
  const ratio = Math.min(Math.max(responseMs / timeLimitMs, 0), 1);
  const base = Math.round((1 - ratio / 2) * maxPoints);
  return pointsMode === "double" ? base * 2 : base;
}

/** streak = jumlah jawaban benar beruntun termasuk jawaban sekarang. */
export function streakBonus(streak: number): number {
  return Math.min(Math.max(streak - 1, 0) * STREAK_BONUS_STEP, STREAK_BONUS_CAP);
}
```

Aturan:
- Jawaban salah atau tidak menjawab: 0 poin dan `streak` kembali ke 0.
- Jawaban benar langsung di detik 0 mendapat poin penuh; di detik terakhir mendapat sekitar 50%.
- Jawaban dianggap benar jika himpunan `optionIndexes` sama persis dengan `correctIndexes`.
- Jawaban yang tiba setelah `endsAt` ditolak dengan `TIME_UP`.
- **Keputusan implementasi:** PRD menyebut "+100 per jawaban benar beruntun, maksimal +500". Di sini jawaban benar pertama tidak mendapat bonus, bonus mulai dari streak ke-2. Kalau mau bonus mulai dari streak 1, ubah `streak - 1` menjadi `streak`, dan ubah juga catatan ini.
- Ranking: skor terbesar dulu; skor sama dipecah oleh total waktu respons yang lebih kecil, lalu waktu join yang lebih awal.

## 10. Data sesi di Redis

| Key | Tipe | Isi |
|---|---|---|
| `game:{pin}` | hash | `quizId`, `phase`, `questionIndex`, `startedAt`, `endsAt`, `paused`, `remainingMsWhenPaused`, `hostToken`, `settings` (JSON) |
| `game:{pin}:players` | hash | `playerId` → JSON `{ nickname, score, streak, totalResponseMs, joinedAt, rejoinToken, connected }` |
| `game:{pin}:answers:{questionIndex}` | hash | `playerId` → JSON `{ optionIndexes, receivedAt, responseMs }` |
| `game:{pin}:nicknames` | set | nickname huruf kecil, untuk cek nickname unik |
| `pin:active` | set | PIN yang sedang aktif |

Semua key `game:{pin}*` diberi TTL `REDIS_TTL_SEC` dan diperpanjang tiap ada aktivitas. Hasil akhir dipindahkan ke PostgreSQL saat masuk fase `PODIUM`.

## 11. Reconnect

- Player menyimpan `playerId` dan `rejoinToken` di `localStorage`. Setelah koneksi putus, client memanggil `player:rejoin`; server mengirim ulang fase dan soal aktif beserta sisa waktu.
- Player tetap terdaftar di sesi sampai `ENDED`, walau socket terputus (`connected: false`).
- Host memakai `host:rejoin` dengan `hostToken`. Putus lebih dari `HOST_DISCONNECT_PAUSE_MS` membuat game auto-pause; lebih dari `HOST_DISCONNECT_END_MS` mengakhiri game.

## 12. Rate limit dan keamanan

| Target | Batas | Respons |
|---|---|---|
| `player:join` per IP | 10 per menit | `RATE_LIMITED` |
| Semua event per socket | 20 per detik | `RATE_LIMITED`, lalu disconnect jika berulang |
| `player:answer` per player per soal | 1 | `ALREADY_ANSWERED` |
| `POST /api/ai/generate` per akun | 10 per hari (tamu lebih ketat) | HTTP 429 |

Tambahan:
- Nickname disanitasi (hapus HTML) dan difilter kata kasar; harus unik per sesi tanpa membedakan huruf besar/kecil.
- PIN dibuat acak 6 digit dan dicek tidak bentrok dengan `pin:active`.
- Host terautentikasi lewat cookie sesi Auth.js (login Google) atau token tamu; event `host:*` ditolak dengan `NOT_HOST` jika bukan host sesi itu.

## 13. Kontrak REST (apps/web)

| Method | Path | Body → Respons | Auth |
|---|---|---|---|
| GET | `/api/quizzes` | → `Quiz[]` milik user | host |
| POST | `/api/quizzes` | `{ title, description?, questions: QuestionInput[] }` → `Quiz` | host |
| GET / PUT / DELETE | `/api/quizzes/:id` | → `Quiz` | pemilik |
| POST | `/api/ai/generate` | `GenerateQuizInput` → `{ questions: QuestionInput[] }` | host (tamu dibatasi) |
| GET | `/api/sessions/:id/report` | → laporan sesi (JSON) | pemilik |

```ts
export const GenerateQuizInput = z.object({
  topic: z.string().max(200).optional(),
  text: z.string().max(8000).optional(),           // teks hasil ekstrak PDF dikirim sebagai text
  count: z.number().int().min(1).max(20).default(10),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  language: z.enum(["id", "en"]).default("id"),
}).refine((v) => v.topic || v.text, { message: "topic atau text wajib diisi" });

export const GenerateQuizOutput = z.object({
  questions: z.array(QuestionInput.omit({ id: true })).min(1).max(20),
});
```

Adapter penyedia AI (agar mudah ganti dari Gemini ke provider lain):

```ts
export interface QuizGenerator {
  generate(input: z.infer<typeof GenerateQuizInput>): Promise<z.infer<typeof GenerateQuizOutput>>;
}
```

Implementasi memanggil model dengan instruksi output JSON, memvalidasi hasilnya dengan `GenerateQuizOutput`, dan mencoba ulang maksimal 2 kali jika validasi gagal. Soal hasil AI selalu ditandai "dibuat AI, periksa dulu" di editor.

## 14. Model data (Prisma, ringkas)

`User`, `Quiz`, `Question`, `GameSession`, `Player`, `Answer`. Field mengikuti bagian 8 di PRD; `Question.options` dan `Question.correctIndexes` disimpan sebagai JSON. Skema Prisma lengkap dimiliki agen `packages/db`.

## 15. Changelog

- v0.1: versi awal (event, skema, state machine, skor, Redis, REST, kontrak AI generator).
