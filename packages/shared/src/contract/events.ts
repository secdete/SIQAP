import { z } from "zod";
import {
  Pin,
  Nickname,
  OptionIndex,
  QuestionType,
  PointsMode,
  GamePhase,
  GameSettings,
  PlayerPublic,
  LeaderboardEntry,
  AckResult,
} from "./schemas.js";

// ==========================================
// Client -> Server Payloads & Events
// ==========================================

// Host
export const HostCreate = z.object({ quizId: z.string(), settings: GameSettings.optional() });
export type HostCreate = z.infer<typeof HostCreate>;

export const HostRejoin = z.object({ pin: Pin, hostToken: z.string() });
export type HostRejoin = z.infer<typeof HostRejoin>;

export const HostAction = z.object({ pin: Pin });                       // start, next, skip, pause, resume, end
export type HostAction = z.infer<typeof HostAction>;

export const HostKick   = z.object({ pin: Pin, playerId: z.string() });
export type HostKick = z.infer<typeof HostKick>;

// Player
export const PlayerJoin   = z.object({ pin: Pin, nickname: Nickname });
export type PlayerJoin = z.infer<typeof PlayerJoin>;

export const PlayerRejoin = z.object({ pin: Pin, rejoinToken: z.string() });
export type PlayerRejoin = z.infer<typeof PlayerRejoin>;

export const PlayerAnswer = z.object({
  pin: Pin,
  questionIndex: z.number().int().min(0),
  optionIndexes: z.array(OptionIndex).min(1).max(4),
});
export type PlayerAnswer = z.infer<typeof PlayerAnswer>;

export interface ClientToServerEvents {
  "host:create":  (p: HostCreate,  ack: (r: AckResult<{ pin: string; hostToken: string }>) => void) => void;
  "host:rejoin":  (p: HostRejoin,  ack: (r: AckResult) => void) => void;
  "host:start":   (p: HostAction,  ack: (r: AckResult) => void) => void;
  "host:next":    (p: HostAction,  ack: (r: AckResult) => void) => void;
  "host:skip":    (p: HostAction,  ack: (r: AckResult) => void) => void;
  "host:pause":   (p: HostAction,  ack: (r: AckResult) => void) => void;
  "host:resume":  (p: HostAction,  ack: (r: AckResult) => void) => void;
  "host:end":     (p: HostAction,  ack: (r: AckResult) => void) => void;
  "host:kick":    (p: HostKick,    ack: (r: AckResult) => void) => void;

  "player:join":   (p: PlayerJoin,   ack: (r: AckResult<{ playerId: string; rejoinToken: string }>) => void) => void;
  "player:rejoin": (p: PlayerRejoin, ack: (r: AckResult<{ playerId: string; phase: GamePhase }>) => void) => void;
  "player:answer": (p: PlayerAnswer, ack: (r: AckResult) => void) => void;
}

// ==========================================
// Server -> Client Payloads & Events
// ==========================================

export const LobbyUpdate = z.object({
  pin: Pin,
  players: z.array(PlayerPublic),
  count: z.number().int(),
});
export type LobbyUpdate = z.infer<typeof LobbyUpdate>;

export const GamePhaseEvent = z.object({
  phase: GamePhase,
  at: z.number(),                   // ms epoch server
  paused: z.boolean().default(false),
});
export type GamePhaseEvent = z.infer<typeof GamePhaseEvent>;

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
export type QuestionShow = z.infer<typeof QuestionShow>;

export const QuestionTick = z.object({
  questionIndex: z.number().int(),
  remainingMs: z.number().int(),
  answeredCount: z.number().int(),  // untuk layar host
});
export type QuestionTick = z.infer<typeof QuestionTick>;

export const QuestionReveal = z.object({
  questionIndex: z.number().int(),
  correctIndexes: z.array(OptionIndex),
  explanation: z.string().optional(),
  distribution: z.array(z.number().int()),   // jumlah pemilih per opsi
});
export type QuestionReveal = z.infer<typeof QuestionReveal>;

// Dikirim hanya ke player yang bersangkutan
export const PlayerResult = z.object({
  questionIndex: z.number().int(),
  isCorrect: z.boolean(),
  pointsAwarded: z.number().int(),
  streak: z.number().int(),
  totalScore: z.number().int(),
  rank: z.number().int().min(1),
});
export type PlayerResult = z.infer<typeof PlayerResult>;

export const LeaderboardUpdate = z.object({
  top: z.array(LeaderboardEntry).max(5),
  totalPlayers: z.number().int(),
});
export type LeaderboardUpdate = z.infer<typeof LeaderboardUpdate>;

export const GameEnd = z.object({
  podium: z.array(LeaderboardEntry).max(3),
});
export type GameEnd = z.infer<typeof GameEnd>;

export const PlayerFinal = z.object({
  finalRank: z.number().int(),
  finalScore: z.number().int(),
  correctCount: z.number().int(),
  totalQuestions: z.number().int(),
  mistakes: z.array(z.object({
    questionIndex: z.number().int(),
    yourAnswer: z.array(OptionIndex),
    correctIndexes: z.array(OptionIndex),
    explanation: z.string().optional(),
  })),
});
export type PlayerFinal = z.infer<typeof PlayerFinal>;

export interface ServerToClientEvents {
  "lobby:update":       (p: LobbyUpdate) => void;
  "game:phase":         (p: GamePhaseEvent) => void;
  "question:show":      (p: QuestionShow) => void;
  "question:tick":      (p: QuestionTick) => void;
  "question:reveal":    (p: QuestionReveal) => void;
  "player:result":      (p: PlayerResult) => void;
  "leaderboard:update": (p: LeaderboardUpdate) => void;
  "game:end":           (p: GameEnd) => void;
  "player:final":       (p: PlayerFinal) => void;
  "player:kicked":      (p: { reason: "host" }) => void;
}
