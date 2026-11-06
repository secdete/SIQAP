import { z } from "zod";

export const Pin = z.string().regex(/^\d{6}$/);
export const Nickname = z.string().trim().min(2).max(20);
export const OptionIndex = z.number().int().min(0).max(3);

export const QuestionType = z.enum(["multiple_choice", "true_false"]);
export type QuestionType = z.infer<typeof QuestionType>;

export const PointsMode = z.enum(["standard", "double", "none"]);
export type PointsMode = z.infer<typeof PointsMode>;

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
  text: z.string().min(1).max(200),
  imageUrl: z.string().url().optional(),
  options: z.array(z.object({ text: z.string().min(1).max(100) })).min(2).max(4),
  correctIndexes: z.array(OptionIndex).min(1),   // MVP: UI hanya mengizinkan satu jawaban benar
  timeLimitSec: z.number().int().min(5).max(120).default(20),
  pointsMode: PointsMode.default("standard"),
  explanation: z.string().max(500).optional(),   // tampil saat reveal
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
export type PlayerPublic = z.infer<typeof PlayerPublic>;

export const LeaderboardEntry = z.object({
  playerId: z.string(),
  nickname: Nickname,
  score: z.number().int(),
  rank: z.number().int().min(1),
});
export type LeaderboardEntry = z.infer<typeof LeaderboardEntry>;

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
