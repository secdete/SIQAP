import {
  MAX_POINTS_DEFAULT,
  STREAK_BONUS_STEP,
  STREAK_BONUS_CAP,
} from "./constants.js";
import { PointsMode } from "./schemas.js";

export function calcPoints(args: {
  isCorrect: boolean;
  responseMs: number;        // jawaban diterima server − startedAt
  timeLimitMs: number;
  maxPoints?: number;        // default: MAX_POINTS_DEFAULT
  pointsMode: PointsMode;
}): number {
  const {
    isCorrect,
    responseMs,
    timeLimitMs,
    maxPoints = MAX_POINTS_DEFAULT,
    pointsMode,
  } = args;

  if (!isCorrect || pointsMode === "none") return 0;
  const ratio = Math.min(Math.max(responseMs / timeLimitMs, 0), 1);
  const base = Math.round((1 - ratio / 2) * maxPoints);
  return pointsMode === "double" ? base * 2 : base;
}

/** streak = jumlah jawaban benar beruntun termasuk jawaban sekarang. */
export function streakBonus(streak: number): number {
  return Math.min(Math.max(streak - 1, 0) * STREAK_BONUS_STEP, STREAK_BONUS_CAP);
}
