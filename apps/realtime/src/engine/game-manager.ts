import { Server } from "socket.io";
import {
  calcPoints,
  streakBonus,
  GamePhase,
  GameSettings,
  QuestionInput,
  LeaderboardEntry,
  ServerToClientEvents,
  ClientToServerEvents,
  QUESTION_TIME_DEFAULT_SEC,
  MAX_POINTS_DEFAULT,
  LobbyUpdate,
  GamePhaseEvent,
  QuestionShow,
  QuestionTick,
  QuestionReveal,
  LeaderboardUpdate,
  GameEnd,
} from "@siqap/shared";
import { prisma } from "@siqap/db";
import { SessionStore, StoredPlayer, StoredSession, StoredAnswer } from "../store/index.js";
import { sanitizeNickname, isNicknameAllowed } from "../socket/profanity.js";

export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

/**
 * Stored quizzes may contain either the contract shape `[{ text }]` or a plain
 * `string[]` left behind by older saves. The game engine always reads `.text`,
 * so normalise everything to the contract shape before it enters a session.
 */
function toOptionObjects(options: unknown): { text: string }[] {
  if (!Array.isArray(options)) return [];
  return options.map((option) => {
    if (typeof option === "string") return { text: option };
    if (option && typeof option === "object" && "text" in option) {
      return { text: String((option as { text: unknown }).text) };
    }
    return { text: String(option) };
  });
}

/**
 * Standings order: highest score first, then fastest cumulative response time,
 * then whoever joined first. Used by reveal ranks, leaderboard and podium.
 */
function sortPlayersForStandings(players: StoredPlayer[]): StoredPlayer[] {
  return [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.totalResponseMs !== b.totalResponseMs) return a.totalResponseMs - b.totalResponseMs;
    return a.joinedAt - b.joinedAt;
  });
}

function toLeaderboardEntry(player: StoredPlayer, rank: number): LeaderboardEntry {
  return {
    playerId: player.playerId,
    nickname: player.nickname,
    score: player.score,
    rank,
  };
}

/**
 * A rejoining host has no local state (its store resets to LOBBY on reload), so
 * the server replays the exact contract events that describe the current phase.
 * Ordered by how the host client applies them: `question:show` first because its
 * handler forces QUESTION_ACTIVE, then `game:phase` which restores the real phase.
 */
export type HostSnapshotEvent =
  | { event: "question:show"; payload: QuestionShow }
  | { event: "game:phase"; payload: GamePhaseEvent }
  | { event: "question:tick"; payload: QuestionTick }
  | { event: "question:reveal"; payload: QuestionReveal }
  | { event: "leaderboard:update"; payload: LeaderboardUpdate }
  | { event: "game:end"; payload: GameEnd }
  | { event: "lobby:update"; payload: LobbyUpdate };

export class GameManager {
  private activeTimers = new Map<string, NodeJS.Timeout>();
  private tickIntervals = new Map<string, NodeJS.Timeout>();

  constructor(
    private store: SessionStore,
    private io: TypedServer
  ) {}

  // ---------------------------------------------------------------------------
  // Host Operations
  // ---------------------------------------------------------------------------

  async createGame(quizId: string, settings?: Partial<GameSettings>): Promise<{ pin: string; hostToken: string }> {
    // 1. Fetch quiz from DB or construct demo quiz
    let questions: QuestionInput[] = [];

    if (process.env.DATABASE_URL) {
      try {
        const dbQuiz = await prisma.quiz.findUnique({
          where: { id: quizId },
          include: { questions: { orderBy: { order: "asc" } } },
        });

        if (dbQuiz && dbQuiz.questions.length > 0) {
          questions = dbQuiz.questions.map((q) => ({
            id: q.id,
            type: q.type as QuestionInput["type"],
            text: q.text,
            imageUrl: q.imageUrl || undefined,
            // Stored quizzes may hold either [{ text }] or plain string[] (older saves).
            options: toOptionObjects(q.options),
            correctIndexes: q.correctIndexes as number[],
            timeLimitSec: q.timeLimitSec,
            pointsMode: q.pointsMode as QuestionInput["pointsMode"],
            explanation: q.explanation || undefined,
          }));
        }
      } catch (err) {
        console.warn("[GameManager] DB query failed, using fallback questions:", err);
      }
    }

    if (questions.length === 0) {
      // Demo questions fallback if DB empty/mocking
      questions = [
        {
          id: "demo-q1",
          type: "multiple_choice",
          text: "Apa kepanjangan dari SIQAP?",
          options: [
            { text: "Sistem Informasi Akademik Pelajar" },
            { text: "Sistem Interaktif Kuis Asik Pelajar" },
            { text: "Sistem Cepat Akurasi Pintar" },
            { text: "Sarana Informasi Kuis Anak Pintar" },
          ],
          correctIndexes: [0],
          timeLimitSec: 20,
          pointsMode: "standard",
          explanation: "SIQAP adalah Sistem Informasi Akademik Pelajar.",
        },
        {
          id: "demo-q2",
          type: "true_false",
          text: "Kahoot versi gratis dibatasi hanya 10-40 pemain per sesi?",
          options: [{ text: "Benar" }, { text: "Salah" }],
          correctIndexes: [0],
          timeLimitSec: 15,
          pointsMode: "standard",
          explanation: "Benar, Kahoot gratis membatasi 10 pemain (personal) atau 40 pemain (K-12).",
        },
      ];
    }

    const defaultSettings: GameSettings = {
      maxPlayers: 300,
      streakBonus: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      showLeaderboardEachQuestion: true,
      ...settings,
    };

    if (defaultSettings.shuffleQuestions) {
      questions = [...questions].sort(() => Math.random() - 0.5);
    }

    const pin = await this.store.generateUniquePin();
    const hostToken = `ht_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;

    const session: StoredSession = {
      pin,
      quizId,
      hostToken,
      phase: "LOBBY",
      questionIndex: 0,
      startedAt: 0,
      endsAt: 0,
      paused: false,
      remainingMsWhenPaused: 0,
      settings: defaultSettings,
      questions,
    };

    await this.store.createSession(session);

    // Save GameSession to DB asynchronously if DB configured
    if (process.env.DATABASE_URL) {
      try {
        await prisma.gameSession.create({
          data: {
            quizId,
            pin,
            status: "LOBBY",
            settings: defaultSettings as any,
          },
        });
      } catch (err) {
        console.warn("[GameManager] Warning: could not persist initial session to DB:", err);
      }
    }

    return { pin, hostToken };
  }

  async verifyHost(pin: string, hostToken: string): Promise<boolean> {
    const session = await this.store.getSession(pin);
    return Boolean(session && session.hostToken === hostToken);
  }

  /**
   * Contract events describing the session's current phase, replayed to a host
   * that just rejoined (page reload, socket drop, second tab). The host page keeps
   * no persistent state, so without this a reload shows LOBBY while the game runs.
   *
   * Payload building is separate from emitting so it can be unit-tested directly.
   */
  async buildHostSnapshot(pin: string): Promise<HostSnapshotEvent[]> {
    const session = await this.store.getSession(pin);
    if (!session) return [];

    const players = await this.store.getPlayers(pin);
    const showsQuestion =
      session.phase === "QUESTION_INTRO" ||
      session.phase === "QUESTION_ACTIVE" ||
      session.phase === "QUESTION_REVEAL";
    const currentQuestion = showsQuestion ? session.questions[session.questionIndex] : undefined;

    const events: HostSnapshotEvent[] = [];

    // 1. The question first: its client handler forces QUESTION_ACTIVE, so it has
    //    to land before game:phase restores the phase the session is really in.
    if (currentQuestion) {
      events.push({
        event: "question:show",
        payload: {
          questionIndex: session.questionIndex,
          total: session.questions.length,
          type: currentQuestion.type,
          text: currentQuestion.text,
          imageUrl: currentQuestion.imageUrl,
          options: currentQuestion.options.map((o) => o.text),
          timeLimitSec: currentQuestion.timeLimitSec || QUESTION_TIME_DEFAULT_SEC,
          startedAt: session.startedAt,
          endsAt: session.endsAt,
          pointsMode: currentQuestion.pointsMode,
        },
      });
    }

    // 2. The phase the server is actually in.
    events.push({
      event: "game:phase",
      payload: { phase: session.phase, at: Date.now(), paused: session.paused },
    });

    // 3. Whatever that phase renders.
    if (session.phase === "QUESTION_ACTIVE") {
      const answers = await this.store.getAnswers(pin, session.questionIndex);
      const remainingMs = session.paused
        ? session.remainingMsWhenPaused
        : Math.max(session.endsAt - Date.now(), 0);

      events.push({
        event: "question:tick",
        payload: {
          questionIndex: session.questionIndex,
          remainingMs,
          answeredCount: answers.length,
        },
      });
    }

    if (session.phase === "QUESTION_REVEAL" && currentQuestion) {
      const answers = await this.store.getAnswers(pin, session.questionIndex);
      const distribution = Array.from({ length: currentQuestion.options.length }, () => 0);
      for (const answer of answers) {
        for (const idx of answer.optionIndexes) {
          if (idx >= 0 && idx < distribution.length) distribution[idx]++;
        }
      }

      events.push({
        event: "question:reveal",
        payload: {
          questionIndex: session.questionIndex,
          correctIndexes: currentQuestion.correctIndexes,
          explanation: currentQuestion.explanation,
          distribution,
        },
      });
    }

    const needsStandings =
      session.phase === "LEADERBOARD" || session.phase === "PODIUM" || session.phase === "ENDED";
    if (needsStandings) {
      const sorted = sortPlayersForStandings(players);
      events.push({
        event: "leaderboard:update",
        payload: {
          top: sorted.slice(0, 5).map((p, idx) => toLeaderboardEntry(p, idx + 1)),
          totalPlayers: players.length,
        },
      });

      // The podium view also renders the standings table, so both are replayed.
      if (session.phase === "PODIUM" || session.phase === "ENDED") {
        events.push({
          event: "game:end",
          payload: { podium: sorted.slice(0, 3).map((p, idx) => toLeaderboardEntry(p, idx + 1)) },
        });
      }
    }

    // 4. Lobby last: the host view always wants the live roster.
    events.push({
      event: "lobby:update",
      payload: {
        pin: session.pin,
        players: players.map((p) => ({ playerId: p.playerId, nickname: p.nickname })),
        count: players.length,
      },
    });

    return events;
  }

  async startGame(pin: string, hostToken: string): Promise<{ ok: boolean; error?: string }> {
    const session = await this.store.getSession(pin);
    if (!session || session.hostToken !== hostToken) return { ok: false, error: "NOT_HOST" };
    if (session.phase !== "LOBBY") return { ok: false, error: "INVALID_PHASE" };

    const players = await this.store.getPlayers(pin);
    if (players.length === 0) return { ok: false, error: "INVALID_PAYLOAD" };

    // Update DB status to ACTIVE
    if (process.env.DATABASE_URL) {
      try {
        await prisma.gameSession.updateMany({
          where: { pin, status: "LOBBY" },
          data: { status: "ACTIVE", startedAt: new Date() },
        });
      } catch {}
    }

    await this.transitionToIntro(pin);
    return { ok: true };
  }

  async skipQuestion(pin: string, hostToken: string): Promise<{ ok: boolean; error?: string }> {
    const session = await this.store.getSession(pin);
    if (!session || session.hostToken !== hostToken) return { ok: false, error: "NOT_HOST" };
    if (session.phase !== "QUESTION_ACTIVE") return { ok: false, error: "INVALID_PHASE" };

    this.clearTimers(pin);
    await this.transitionToReveal(pin);
    return { ok: true };
  }

  async pauseGame(pin: string, hostToken: string): Promise<{ ok: boolean; error?: string }> {
    const session = await this.store.getSession(pin);
    if (!session || session.hostToken !== hostToken) return { ok: false, error: "NOT_HOST" };
    if (session.phase !== "QUESTION_ACTIVE" || session.paused) return { ok: false, error: "INVALID_PHASE" };

    const now = Date.now();
    const remainingMs = Math.max(session.endsAt - now, 0);

    this.clearTimers(pin);
    await this.store.updateSession(pin, { paused: true, remainingMsWhenPaused: remainingMs });

    this.io.to(`game:${pin}`).emit("game:phase", {
      phase: "QUESTION_ACTIVE",
      at: now,
      paused: true,
    });

    return { ok: true };
  }

  async resumeGame(pin: string, hostToken: string): Promise<{ ok: boolean; error?: string }> {
    const session = await this.store.getSession(pin);
    if (!session || session.hostToken !== hostToken) return { ok: false, error: "NOT_HOST" };
    if (session.phase !== "QUESTION_ACTIVE" || !session.paused) return { ok: false, error: "INVALID_PHASE" };

    const now = Date.now();
    const remainingMs = session.remainingMsWhenPaused;
    const newEndsAt = now + remainingMs;

    await this.store.updateSession(pin, { paused: false, endsAt: newEndsAt, remainingMsWhenPaused: 0 });

    this.io.to(`game:${pin}`).emit("game:phase", {
      phase: "QUESTION_ACTIVE",
      at: now,
      paused: false,
    });

    // Resume countdown timer
    this.scheduleQuestionTimer(pin, remainingMs);

    return { ok: true };
  }

  async nextStep(pin: string, hostToken: string): Promise<{ ok: boolean; error?: string }> {
    const session = await this.store.getSession(pin);
    if (!session || session.hostToken !== hostToken) return { ok: false, error: "NOT_HOST" };

    if (session.phase === "QUESTION_REVEAL") {
      const isLastQuestion = session.questionIndex >= session.questions.length - 1;
      if (session.settings.showLeaderboardEachQuestion || isLastQuestion) {
        await this.transitionToLeaderboard(pin);
      } else {
        await this.advanceToNextQuestionOrPodium(pin);
      }
      return { ok: true };
    }

    if (session.phase === "LEADERBOARD") {
      await this.advanceToNextQuestionOrPodium(pin);
      return { ok: true };
    }

    if (session.phase === "PODIUM") {
      await this.transitionToEnded(pin);
      return { ok: true };
    }

    return { ok: false, error: "INVALID_PHASE" };
  }

  async endGame(pin: string, hostToken: string): Promise<{ ok: boolean; error?: string }> {
    const session = await this.store.getSession(pin);
    if (!session || session.hostToken !== hostToken) return { ok: false, error: "NOT_HOST" };

    this.clearTimers(pin);
    await this.transitionToPodium(pin);
    return { ok: true };
  }

  async kickPlayer(pin: string, hostToken: string, playerId: string): Promise<{ ok: boolean; error?: string }> {
    const session = await this.store.getSession(pin);
    if (!session || session.hostToken !== hostToken) return { ok: false, error: "NOT_HOST" };

    const player = await this.store.getPlayer(pin, playerId);
    if (!player) return { ok: false, error: "INVALID_PAYLOAD" };

    await this.store.removePlayer(pin, playerId);
    this.io.to(`player:${playerId}`).emit("player:kicked", { reason: "host" });

    // Broadcast updated lobby
    const remainingPlayers = await this.store.getPlayers(pin);
    this.io.to(`game:${pin}`).emit("lobby:update", {
      pin,
      players: remainingPlayers.map((p) => ({ playerId: p.playerId, nickname: p.nickname })),
      count: remainingPlayers.length,
    });

    return { ok: true };
  }

  // ---------------------------------------------------------------------------
  // Player Operations
  // ---------------------------------------------------------------------------

  async joinPlayer(pin: string, rawNickname: string, socketId: string): Promise<{
    ok: boolean;
    error?: string;
    playerId?: string;
    rejoinToken?: string;
  }> {
    const session = await this.store.getSession(pin);
    if (!session) return { ok: false, error: "PIN_NOT_FOUND" };
    if (session.phase !== "LOBBY") return { ok: false, error: "GAME_ALREADY_STARTED" };

    const nickname = sanitizeNickname(rawNickname);
    if (nickname.length < 2 || nickname.length > 20 || !isNicknameAllowed(nickname)) {
      return { ok: false, error: "NICKNAME_INVALID" };
    }

    const players = await this.store.getPlayers(pin);
    if (players.length >= session.settings.maxPlayers) {
      return { ok: false, error: "GAME_FULL" };
    }

    const added = await this.store.addNickname(pin, nickname);
    if (!added) {
      return { ok: false, error: "NICKNAME_TAKEN" };
    }

    const playerId = `p_${Math.random().toString(36).substring(2, 10)}`;
    const rejoinToken = `rt_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;

    const newPlayer: StoredPlayer = {
      playerId,
      nickname,
      score: 0,
      streak: 0,
      totalResponseMs: 0,
      joinedAt: Date.now(),
      rejoinToken,
      connected: true,
      socketId,
    };

    await this.store.addPlayer(pin, newPlayer);

    const updatedPlayers = await this.store.getPlayers(pin);
    this.io.to(`game:${pin}`).emit("lobby:update", {
      pin,
      players: updatedPlayers.map((p) => ({ playerId: p.playerId, nickname: p.nickname })),
      count: updatedPlayers.length,
    });

    return { ok: true, playerId, rejoinToken };
  }

  async rejoinPlayer(pin: string, rejoinToken: string, socketId: string): Promise<{
    ok: boolean;
    error?: string;
    playerId?: string;
    phase?: GamePhase;
  }> {
    const session = await this.store.getSession(pin);
    if (!session) return { ok: false, error: "PIN_NOT_FOUND" };

    const player = await this.store.getPlayerByRejoinToken(pin, rejoinToken);
    if (!player) return { ok: false, error: "REJOIN_FAILED" };

    await this.store.updatePlayer(pin, player.playerId, { connected: true, socketId });

    return {
      ok: true,
      playerId: player.playerId,
      phase: session.phase,
    };
  }

  async submitAnswer(
    pin: string,
    playerId: string,
    questionIndex: number,
    optionIndexes: number[]
  ): Promise<{ ok: boolean; error?: string }> {
    const session = await this.store.getSession(pin);
    if (!session) return { ok: false, error: "PIN_NOT_FOUND" };
    if (session.phase !== "QUESTION_ACTIVE") return { ok: false, error: "INVALID_PHASE" };
    if (session.questionIndex !== questionIndex) return { ok: false, error: "INVALID_PHASE" };

    const now = Date.now();
    if (now > session.endsAt) {
      return { ok: false, error: "TIME_UP" };
    }

    const responseMs = Math.max(now - session.startedAt, 0);

    const storedAnswer: StoredAnswer = {
      playerId,
      optionIndexes,
      receivedAt: now,
      responseMs,
    };

    const recorded = await this.store.recordAnswer(pin, questionIndex, storedAnswer);
    if (!recorded) {
      return { ok: false, error: "ALREADY_ANSWERED" };
    }

    // Check if all connected players have answered
    const answers = await this.store.getAnswers(pin, questionIndex);
    const players = await this.store.getPlayers(pin);
    const connectedPlayers = players.filter((p) => p.connected);

    // Notify host with updated answeredCount
    const remainingMs = Math.max(session.endsAt - now, 0);
    this.io.to(`host:${pin}`).emit("question:tick", {
      questionIndex,
      remainingMs,
      answeredCount: answers.length,
    });

    if (answers.length >= connectedPlayers.length && connectedPlayers.length > 0) {
      this.clearTimers(pin);
      await this.transitionToReveal(pin);
    }

    return { ok: true };
  }

  // ---------------------------------------------------------------------------
  // State Machine Transitions
  // ---------------------------------------------------------------------------

  private async transitionToIntro(pin: string): Promise<void> {
    const session = await this.store.getSession(pin);
    if (!session) return;

    await this.store.updateSession(pin, { phase: "QUESTION_INTRO" });
    const now = Date.now();

    this.io.to(`game:${pin}`).emit("game:phase", {
      phase: "QUESTION_INTRO",
      at: now,
      paused: false,
    });

    // 3 seconds intro countdown before activating question
    const introTimer = setTimeout(async () => {
      await this.transitionToActiveQuestion(pin);
    }, 3000);

    this.activeTimers.set(pin, introTimer);
  }

  private async transitionToActiveQuestion(pin: string): Promise<void> {
    const session = await this.store.getSession(pin);
    if (!session) return;

    const currentQuestion = session.questions[session.questionIndex];
    if (!currentQuestion) {
      await this.transitionToPodium(pin);
      return;
    }

    const now = Date.now();
    const timeLimitSec = currentQuestion.timeLimitSec || QUESTION_TIME_DEFAULT_SEC;
    const durationMs = timeLimitSec * 1000;
    const endsAt = now + durationMs;

    await this.store.updateSession(pin, {
      phase: "QUESTION_ACTIVE",
      startedAt: now,
      endsAt,
      paused: false,
      remainingMsWhenPaused: 0,
    });

    this.io.to(`game:${pin}`).emit("game:phase", {
      phase: "QUESTION_ACTIVE",
      at: now,
      paused: false,
    });

    // Emit question:show WITHOUT correctIndexes and explanation
    this.io.to(`game:${pin}`).emit("question:show", {
      questionIndex: session.questionIndex,
      total: session.questions.length,
      type: currentQuestion.type,
      text: currentQuestion.text,
      imageUrl: currentQuestion.imageUrl,
      options: currentQuestion.options.map((o) => o.text),
      timeLimitSec,
      startedAt: now,
      endsAt,
      pointsMode: currentQuestion.pointsMode,
    });

    this.scheduleQuestionTimer(pin, durationMs);
  }

  private scheduleQuestionTimer(pin: string, durationMs: number): void {
    this.clearTimers(pin);

    // 1-second interval tick for host screen sync
    const interval = setInterval(async () => {
      const s = await this.store.getSession(pin);
      if (!s || s.phase !== "QUESTION_ACTIVE" || s.paused) {
        clearInterval(interval);
        return;
      }

      const now = Date.now();
      const remainingMs = Math.max(s.endsAt - now, 0);
      const answers = await this.store.getAnswers(pin, s.questionIndex);

      this.io.to(`host:${pin}`).emit("question:tick", {
        questionIndex: s.questionIndex,
        remainingMs,
        answeredCount: answers.length,
      });

      if (remainingMs <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    this.tickIntervals.set(pin, interval);

    // Timeout when time is up
    const timeout = setTimeout(async () => {
      clearInterval(interval);
      await this.transitionToReveal(pin);
    }, durationMs);

    this.activeTimers.set(pin, timeout);
  }

  private async transitionToReveal(pin: string): Promise<void> {
    const session = await this.store.getSession(pin);
    if (!session) return;

    this.clearTimers(pin);
    const now = Date.now();
    await this.store.updateSession(pin, { phase: "QUESTION_REVEAL" });

    this.io.to(`game:${pin}`).emit("game:phase", {
      phase: "QUESTION_REVEAL",
      at: now,
      paused: false,
    });

    const currentQuestion = session.questions[session.questionIndex];
    const answers = await this.store.getAnswers(pin, session.questionIndex);
    const answerMap = new Map<string, StoredAnswer>(answers.map((a) => [a.playerId, a]));

    // Calculate answer distribution per option
    const distribution = new Array(currentQuestion.options.length).fill(0);
    for (const ans of answers) {
      for (const idx of ans.optionIndexes) {
        if (idx >= 0 && idx < distribution.length) {
          distribution[idx]++;
        }
      }
    }

    // Emit question:reveal to game room
    this.io.to(`game:${pin}`).emit("question:reveal", {
      questionIndex: session.questionIndex,
      correctIndexes: currentQuestion.correctIndexes,
      explanation: currentQuestion.explanation,
      distribution,
    });

    // Score calculation per player
    const players = await this.store.getPlayers(pin);
    const correctSet = new Set(currentQuestion.correctIndexes);

    for (const player of players) {
      const ans = answerMap.get(player.playerId);
      let isCorrect = false;
      let pointsAwarded = 0;
      let newStreak = 0;
      let responseMs = 0;

      if (ans) {
        responseMs = ans.responseMs;
        const playerSet = new Set(ans.optionIndexes);
        isCorrect =
          playerSet.size === correctSet.size &&
          [...playerSet].every((val) => correctSet.has(val));

        if (isCorrect) {
          const basePoints = calcPoints({
            isCorrect: true,
            responseMs,
            timeLimitMs: currentQuestion.timeLimitSec * 1000,
            maxPoints: MAX_POINTS_DEFAULT,
            pointsMode: currentQuestion.pointsMode,
          });

          newStreak = player.streak + 1;
          const bonus = session.settings.streakBonus ? streakBonus(newStreak) : 0;
          pointsAwarded = basePoints + bonus;
        } else {
          newStreak = 0;
        }
      } else {
        newStreak = 0;
      }

      const newScore = player.score + pointsAwarded;
      const newTotalResponseMs = player.totalResponseMs + responseMs;

      await this.store.updatePlayer(pin, player.playerId, {
        score: newScore,
        streak: newStreak,
        totalResponseMs: newTotalResponseMs,
      });
    }

    // Calculate updated ranks
    const updatedPlayers = await this.store.getPlayers(pin);
    const sorted = sortPlayersForStandings(updatedPlayers);

    // Send private player:result to each player
    for (let i = 0; i < sorted.length; i++) {
      const p = sorted[i];
      const ans = answerMap.get(p.playerId);
      const isCorrect = Boolean(
        ans &&
        ans.optionIndexes.length === currentQuestion.correctIndexes.length &&
        ans.optionIndexes.every((val) => correctSet.has(val))
      );

      this.io.to(`player:${p.playerId}`).emit("player:result", {
        questionIndex: session.questionIndex,
        isCorrect,
        pointsAwarded: isCorrect ? p.score - (players.find((pl) => pl.playerId === p.playerId)?.score || 0) : 0,
        streak: p.streak,
        totalScore: p.score,
        rank: i + 1,
      });
    }
  }

  private async transitionToLeaderboard(pin: string): Promise<void> {
    const session = await this.store.getSession(pin);
    if (!session) return;

    const now = Date.now();
    await this.store.updateSession(pin, { phase: "LEADERBOARD" });

    this.io.to(`game:${pin}`).emit("game:phase", {
      phase: "LEADERBOARD",
      at: now,
      paused: false,
    });

    const players = await this.store.getPlayers(pin);
    const sorted = sortPlayersForStandings(players);

    const top: LeaderboardEntry[] = sorted.slice(0, 5).map((p, idx) => toLeaderboardEntry(p, idx + 1));

    this.io.to(`game:${pin}`).emit("leaderboard:update", {
      top,
      totalPlayers: players.length,
    });
  }

  private async advanceToNextQuestionOrPodium(pin: string): Promise<void> {
    const session = await this.store.getSession(pin);
    if (!session) return;

    if (session.questionIndex < session.questions.length - 1) {
      await this.store.updateSession(pin, { questionIndex: session.questionIndex + 1 });
      await this.transitionToIntro(pin);
    } else {
      await this.transitionToPodium(pin);
    }
  }

  private async transitionToPodium(pin: string): Promise<void> {
    const session = await this.store.getSession(pin);
    if (!session) return;

    this.clearTimers(pin);
    const now = Date.now();
    await this.store.updateSession(pin, { phase: "PODIUM" });

    this.io.to(`game:${pin}`).emit("game:phase", {
      phase: "PODIUM",
      at: now,
      paused: false,
    });

    const players = await this.store.getPlayers(pin);
    const sorted = sortPlayersForStandings(players);

    const podium: LeaderboardEntry[] = sorted.slice(0, 3).map((p, idx) => toLeaderboardEntry(p, idx + 1));

    this.io.to(`game:${pin}`).emit("game:end", { podium });

    // Persist session to PostgreSQL in background
    this.persistToDatabase(pin, sorted, session);
  }

  private async transitionToEnded(pin: string): Promise<void> {
    const session = await this.store.getSession(pin);
    if (!session) return;

    const now = Date.now();
    await this.store.updateSession(pin, { phase: "ENDED" });

    this.io.to(`game:${pin}`).emit("game:phase", {
      phase: "ENDED",
      at: now,
      paused: false,
    });

    const players = await this.store.getPlayers(pin);
    const allAnswers = await this.store.getAllAnswers(pin);

    // Send player:final to each player with mistakes breakdown
    for (const player of players) {
      let correctCount = 0;
      const mistakes: Array<{
        questionIndex: number;
        yourAnswer: number[];
        correctIndexes: number[];
        explanation?: string;
      }> = [];

      for (let qIdx = 0; qIdx < session.questions.length; qIdx++) {
        const question = session.questions[qIdx];
        const playerAns = allAnswers[qIdx]?.find((a) => a.playerId === player.playerId);
        const playerChoices = playerAns?.optionIndexes || [];

        const correctSet = new Set(question.correctIndexes);
        const playerSet = new Set(playerChoices);
        const isCorrect =
          playerSet.size === correctSet.size &&
          [...playerSet].every((val) => correctSet.has(val));

        if (isCorrect) {
          correctCount++;
        } else {
          mistakes.push({
            questionIndex: qIdx,
            yourAnswer: playerChoices,
            correctIndexes: question.correctIndexes,
            explanation: question.explanation,
          });
        }
      }

      this.io.to(`player:${player.playerId}`).emit("player:final", {
        finalRank: player.streak, // Placeholder or sorted rank
        finalScore: player.score,
        correctCount,
        totalQuestions: session.questions.length,
        mistakes,
      });
    }
  }

  private async persistToDatabase(
    pin: string,
    sortedPlayers: StoredPlayer[],
    session: StoredSession
  ): Promise<void> {
    if (!process.env.DATABASE_URL) {
      console.log(`[GameManager] DATABASE_URL not set, skipping DB persistence for ${pin}`);
      return;
    }

    try {
      const now = new Date();
      await prisma.gameSession.updateMany({
        where: { pin },
        data: {
          status: "ENDED",
          endedAt: now,
        },
      });

      const dbSession = await prisma.gameSession.findFirst({
        where: { pin },
      });

      if (!dbSession) return;

      const allAnswers = await this.store.getAllAnswers(pin);

      for (let i = 0; i < sortedPlayers.length; i++) {
        const p = sortedPlayers[i];
        const dbPlayer = await prisma.player.create({
          data: {
            sessionId: dbSession.id,
            nickname: p.nickname,
            finalScore: p.score,
            finalRank: i + 1,
          },
        });

        // Insert answers
        for (let qIdx = 0; qIdx < session.questions.length; qIdx++) {
          const ans = allAnswers[qIdx]?.find((a) => a.playerId === p.playerId);
          if (ans) {
            const question = session.questions[qIdx];
            const correctSet = new Set(question.correctIndexes);
            const isCorrect =
              ans.optionIndexes.length === question.correctIndexes.length &&
              ans.optionIndexes.every((val) => correctSet.has(val));

            await prisma.answer.create({
              data: {
                sessionId: dbSession.id,
                playerId: dbPlayer.id,
                questionIndex: qIdx,
                optionIndexes: ans.optionIndexes,
                isCorrect,
                responseTimeMs: ans.responseMs,
                pointsAwarded: isCorrect ? calcPoints({
                  isCorrect: true,
                  responseMs: ans.responseMs,
                  timeLimitMs: question.timeLimitSec * 1000,
                  pointsMode: question.pointsMode,
                }) : 0,
              },
            });
          }
        }
      }
      console.log(`[GameManager] Session ${pin} persisted successfully to PostgreSQL.`);
    } catch (err) {
      console.warn(`[GameManager] Error persisting session ${pin} to PostgreSQL:`, err);
    }
  }

  private clearTimers(pin: string): void {
    const active = this.activeTimers.get(pin);
    if (active) {
      clearTimeout(active);
      this.activeTimers.delete(pin);
    }

    const interval = this.tickIntervals.get(pin);
    if (interval) {
      clearInterval(interval);
      this.tickIntervals.delete(pin);
    }
  }
}
