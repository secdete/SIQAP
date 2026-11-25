import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Server } from "socket.io";
import { createServer } from "http";
import {
  GamePhaseEvent,
  LeaderboardUpdate,
  LobbyUpdate,
  QuestionReveal,
  QuestionShow,
  QuestionTick,
} from "@siqap/shared";
import {
  GameManager,
  HostSnapshotEvent,
  TypedServer,
  INTRO_DURATION_MS,
} from "./game-manager.js";
import { MemorySessionStore } from "../store/memory.js";

describe("GameManager State Machine", () => {
  let store: MemorySessionStore;
  let gameManager: GameManager;
  let io: TypedServer;

  beforeEach(() => {
    store = new MemorySessionStore();
    const httpServer = createServer();
    io = new Server(httpServer) as unknown as TypedServer;
    gameManager = new GameManager(store, io);
  });

  it("creates a game session with unique 6-digit PIN and hostToken", async () => {
    const { pin, hostToken } = await gameManager.createGame("quiz-123");
    expect(pin).toMatch(/^\d{6}$/);
    expect(hostToken).toBeDefined();

    const session = await store.getSession(pin);
    expect(session).toBeDefined();
    expect(session?.phase).toBe("LOBBY");
    expect(session?.questions.length).toBeGreaterThan(0);
  });

  it("allows player to join and prevents duplicate or invalid nicknames", async () => {
    const { pin } = await gameManager.createGame("quiz-123");

    const join1 = await gameManager.joinPlayer(pin, "Budi", "socket-1");
    expect(join1.ok).toBe(true);
    expect(join1.playerId).toBeDefined();
    expect(join1.rejoinToken).toBeDefined();

    // Duplicate nickname check
    const joinDup = await gameManager.joinPlayer(pin, "budi", "socket-2");
    expect(joinDup.ok).toBe(false);
    expect(joinDup.error).toBe("NICKNAME_TAKEN");

    // Inappropriate nickname check
    const joinBad = await gameManager.joinPlayer(pin, "anjing", "socket-3");
    expect(joinBad.ok).toBe(false);
    expect(joinBad.error).toBe("NICKNAME_INVALID");
  });

  it("allows player to submit answer and computes score correctly", async () => {
    const { pin, hostToken } = await gameManager.createGame("quiz-123");
    const join1 = await gameManager.joinPlayer(pin, "Siti", "socket-1");
    await gameManager.joinPlayer(pin, "Budi", "socket-2");
    const playerId = join1.playerId!;

    // Start game
    const start = await gameManager.startGame(pin, hostToken);
    expect(start.ok).toBe(true);

    const session = await store.getSession(pin);
    expect(session?.phase).toBe("QUESTION_INTRO");

    // Fast-forward phase to QUESTION_ACTIVE for test
    await store.updateSession(pin, {
      phase: "QUESTION_ACTIVE",
      startedAt: Date.now() - 1000,
      endsAt: Date.now() + 19000,
    });

    const ans = await gameManager.submitAnswer(pin, playerId, 0, [0]);
    expect(ans.ok).toBe(true);

    // Player can change their answer while QUESTION_ACTIVE is still open
    const ansUpdate = await gameManager.submitAnswer(pin, playerId, 0, [1]);
    expect(ansUpdate.ok).toBe(true);

    const recorded = await store.getAnswers(pin, 0);
    expect(recorded.find((a) => a.playerId === playerId)?.optionIndexes).toEqual([1]);
  });
});

describe("GameManager host rejoin snapshot", () => {
  let store: MemorySessionStore;
  let gameManager: GameManager;

  beforeEach(() => {
    store = new MemorySessionStore();
    const io = new Server(createServer()) as unknown as TypedServer;
    gameManager = new GameManager(store, io);
  });

  const pick = (events: HostSnapshotEvent[], name: string): unknown =>
    events.find((e) => e.event === name)?.payload;

  const namesOf = (events: HostSnapshotEvent[]): string[] => events.map((e) => e.event);

  it("returns no events for an unknown PIN", async () => {
    expect(await gameManager.buildHostSnapshot("000000")).toEqual([]);
  });

  it("replays the lobby roster without leaking question data", async () => {
    const { pin } = await gameManager.createGame("quiz-123");
    await gameManager.joinPlayer(pin, "Siti", "socket-1");
    await gameManager.joinPlayer(pin, "Budi", "socket-2");

    const events = await gameManager.buildHostSnapshot(pin);
    const names = namesOf(events);

    // Kunci jawaban tidak boleh terkirim sebelum question:reveal (kontrak bagian 7).
    expect(names).not.toContain("question:show");
    expect(names).not.toContain("question:reveal");

    expect(pick(events, "game:phase")).toMatchObject({ phase: "LOBBY" } satisfies Partial<GamePhaseEvent>);

    const lobby = pick(events, "lobby:update") as LobbyUpdate;
    expect(lobby.pin).toBe(pin);
    expect(lobby.count).toBe(2);
    expect(lobby.players.map((p) => p.nickname).sort()).toEqual(["Budi", "Siti"]);
  });

  it("orders question:show before game:phase and restores the running timer", async () => {
    const { pin } = await gameManager.createGame("quiz-123");
    await gameManager.joinPlayer(pin, "Siti", "socket-1");

    const endsAt = Date.now() + 12_000;
    await store.updateSession(pin, {
      phase: "QUESTION_ACTIVE",
      startedAt: endsAt - 20_000,
      endsAt,
    });

    const events = await gameManager.buildHostSnapshot(pin);
    const names = namesOf(events);

    // The client's question:show handler forces QUESTION_ACTIVE, so it must land
    // first or game:phase would be overwritten by it.
    expect(names.indexOf("question:show")).toBeLessThan(names.indexOf("game:phase"));
    expect(pick(events, "game:phase")).toMatchObject({ phase: "QUESTION_ACTIVE" } satisfies Partial<GamePhaseEvent>);

    const show = pick(events, "question:show") as QuestionShow;
    const session = await store.getSession(pin);
    expect(show.total).toBe(session?.questions.length);
    expect(show.options.length).toBeGreaterThan(0);
    const rawShow = show as unknown as Record<string, unknown>;
    expect(rawShow).not.toHaveProperty("correctIndexes");
    expect(rawShow).not.toHaveProperty("explanation");

    const tick = pick(events, "question:tick") as QuestionTick;
    expect(tick.answeredCount).toBe(0);
    expect(tick.remainingMs).toBeGreaterThan(0);
    expect(tick.remainingMs).toBeLessThanOrEqual(20_000);
  });

  it("replays the reveal with the per-option distribution", async () => {
    const { pin } = await gameManager.createGame("quiz-123");
    const siti = await gameManager.joinPlayer(pin, "Siti", "socket-1");
    await gameManager.joinPlayer(pin, "Budi", "socket-2");

    await store.updateSession(pin, { phase: "QUESTION_REVEAL" });
    await store.recordAnswer(pin, 0, {
      playerId: siti.playerId!,
      optionIndexes: [0],
      receivedAt: Date.now(),
      responseMs: 1200,
    });
    await store.recordAnswer(pin, 0, {
      playerId: "budi",
      optionIndexes: [1],
      receivedAt: Date.now(),
      responseMs: 2400,
    });

    const events = await gameManager.buildHostSnapshot(pin);

    // The reveal screen still needs the question text it reveals.
    expect(namesOf(events)).toContain("question:show");

    const reveal = pick(events, "question:reveal") as QuestionReveal;
    expect(reveal.questionIndex).toBe(0);
    expect(reveal.correctIndexes).toEqual([0]);
    expect(reveal.distribution).toEqual([1, 1, 0, 0]);
    expect(reveal.explanation).toBeTruthy();

    expect(namesOf(events).indexOf("question:show")).toBeLessThan(
      namesOf(events).indexOf("game:phase")
    );
    expect(pick(events, "game:phase")).toMatchObject({ phase: "QUESTION_REVEAL" } satisfies Partial<GamePhaseEvent>);
  });

  it("replays standings for the leaderboard, and standings plus podium for the finale", async () => {
    const { pin } = await gameManager.createGame("quiz-123");
    const siti = await gameManager.joinPlayer(pin, "Siti", "socket-1");
    const budi = await gameManager.joinPlayer(pin, "Budi", "socket-2");
    await store.updatePlayer(pin, siti.playerId!, { score: 500, totalResponseMs: 900 });
    await store.updatePlayer(pin, budi.playerId!, { score: 300, totalResponseMs: 2000 });

    await store.updateSession(pin, { phase: "LEADERBOARD" });
    const board = await gameManager.buildHostSnapshot(pin);

    const lb = pick(board, "leaderboard:update") as LeaderboardUpdate;
    expect(lb.totalPlayers).toBe(2);
    expect(lb.top[0]).toMatchObject({ nickname: "Siti", score: 500, rank: 1 });
    expect(lb.top[1]).toMatchObject({ nickname: "Budi", score: 300, rank: 2 });
    expect(namesOf(board)).not.toContain("game:end");

    await store.updateSession(pin, { phase: "PODIUM" });
    const finale = await gameManager.buildHostSnapshot(pin);
    const end = pick(finale, "game:end") as { podium: LeaderboardUpdate["top"] };
    expect(end.podium).toHaveLength(2);
    expect(end.podium[0]).toMatchObject({ nickname: "Siti", rank: 1 });
    // The podium view renders the standings table too, so both are replayed.
    expect(namesOf(finale)).toContain("leaderboard:update");
  });
});

describe("GameManager player rejoin snapshot", () => {
  let store: MemorySessionStore;
  let gameManager: GameManager;

  beforeEach(() => {
    store = new MemorySessionStore();
    const io = new Server(createServer()) as unknown as TypedServer;
    gameManager = new GameManager(store, io);
  });

  it("returns no events for an unknown PIN", async () => {
    const snapshot = await gameManager.buildPlayerSnapshot("000000", "nobody");
    expect(snapshot.events).toEqual([]);
    expect(snapshot.final).toBeUndefined();
  });

  it("replays the running question and timer without the final report", async () => {
    const { pin } = await gameManager.createGame("quiz-123");
    const siti = await gameManager.joinPlayer(pin, "Siti", "socket-1");

    const endsAt = Date.now() + 12_000;
    await store.updateSession(pin, {
      phase: "QUESTION_ACTIVE",
      startedAt: endsAt - 20_000,
      endsAt,
    });

    const { events, final } = await gameManager.buildPlayerSnapshot(pin, siti.playerId!);
    const names = events.map((e) => e.event);

    // Same ordering rule as the host: question:show forces QUESTION_ACTIVE on
    // the client, so game:phase has to arrive after it.
    expect(names.indexOf("question:show")).toBeLessThan(names.indexOf("game:phase"));
    expect(events.find((e) => e.event === "game:phase")?.payload).toMatchObject({
      phase: "QUESTION_ACTIVE",
    });
    expect(names).toContain("question:tick");
    expect(final).toBeUndefined();
  });

  it("hands the personal final report with the real standing", async () => {
    const { pin } = await gameManager.createGame("quiz-123");
    const siti = await gameManager.joinPlayer(pin, "Siti", "socket-1");
    const budi = await gameManager.joinPlayer(pin, "Budi", "socket-2");

    // Budi trails on points but leads on streak: the report must say rank 2 —
    // the old emit used player.streak here and would have claimed rank 5.
    await store.updatePlayer(pin, siti.playerId!, { score: 500, totalResponseMs: 900 });
    await store.updatePlayer(pin, budi.playerId!, { score: 300, totalResponseMs: 2000, streak: 5 });
    await store.updateSession(pin, { phase: "ENDED" });

    const { events, final } = await gameManager.buildPlayerSnapshot(pin, budi.playerId!);
    const names = events.map((e) => e.event);

    expect(final).toMatchObject({ finalRank: 2, finalScore: 300 });
    expect(final?.totalQuestions).toBe((await store.getSession(pin))!.questions.length);

    // The closing screens are replayed too, and the roster stays live.
    expect(names).toContain("question:show");
    expect(names).toContain("game:end");
    expect(names[names.length - 1]).toBe("lobby:update");
  });
});

describe("GameManager direct-advance flow", () => {
  let store: MemorySessionStore;
  let gameManager: GameManager;
  let io: TypedServer;

  beforeEach(() => {
    vi.useFakeTimers();
    store = new MemorySessionStore();
    const httpServer = createServer();
    io = new Server(httpServer) as unknown as TypedServer;
    gameManager = new GameManager(store, io);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("advances straight to next question without showing reveal when answered before 15 seconds", async () => {
    const { pin, hostToken } = await gameManager.createGame("quiz-123");
    const join = await gameManager.joinPlayer(pin, "Siti", "socket-1");
    await gameManager.startGame(pin, hostToken);

    await vi.advanceTimersByTimeAsync(INTRO_DURATION_MS);
    expect((await store.getSession(pin))?.phase).toBe("QUESTION_ACTIVE");

    // Answer after 3 seconds (well before 15 seconds)
    await vi.advanceTimersByTimeAsync(3_000);
    const ans = await gameManager.submitAnswer(pin, join.playerId!, 0, [0]);
    expect(ans.ok).toBe(true);

    // Moves immediately to question #2 intro without QUESTION_REVEAL
    const nextSession = await store.getSession(pin);
    expect(nextSession?.questionIndex).toBe(1);
    expect(nextSession?.phase).toBe("QUESTION_INTRO");

    const player = await store.getPlayer(pin, join.playerId!);
    expect(player?.score).toBeGreaterThan(0);

    // After short intro, question #2 is active
    await vi.advanceTimersByTimeAsync(INTRO_DURATION_MS);
    expect((await store.getSession(pin))?.phase).toBe("QUESTION_ACTIVE");
  });

  it("awards 0 points when a player does not answer within 15 seconds and moves to next question", async () => {
    const { pin, hostToken } = await gameManager.createGame("quiz-123");
    const join = await gameManager.joinPlayer(pin, "Siti", "socket-1");
    await gameManager.startGame(pin, hostToken);

    await vi.advanceTimersByTimeAsync(INTRO_DURATION_MS);
    const activeSession = await store.getSession(pin);
    expect(activeSession?.phase).toBe("QUESTION_ACTIVE");
    expect(activeSession?.questions[0].timeLimitSec).toBe(15);

    // Let the full 15-second timer expire without answering
    await vi.advanceTimersByTimeAsync(15_000);
    const nextSession = await store.getSession(pin);
    expect(nextSession?.questionIndex).toBe(1);
    expect(nextSession?.phase).toBe("QUESTION_INTRO");

    const player = await store.getPlayer(pin, join.playerId!);
    expect(player?.score).toBe(0);
    expect(player?.streak).toBe(0);
  });

  it("moves straight to PODIUM after the last question finishes", async () => {
    const { pin, hostToken } = await gameManager.createGame("quiz-123");
    const join = await gameManager.joinPlayer(pin, "Siti", "socket-1");
    await gameManager.startGame(pin, hostToken);

    // Question 1
    await vi.advanceTimersByTimeAsync(INTRO_DURATION_MS);
    await gameManager.submitAnswer(pin, join.playerId!, 0, [0]);

    // Question 2 (last demo question)
    await vi.advanceTimersByTimeAsync(INTRO_DURATION_MS);
    expect((await store.getSession(pin))?.questionIndex).toBe(1);
    await gameManager.submitAnswer(pin, join.playerId!, 1, [0]);

    expect((await store.getSession(pin))?.phase).toBe("PODIUM");
    const player = await store.getPlayer(pin, join.playerId!);
    expect(player?.score).toBeGreaterThan(0);
  });

  it("tracks fastest responder and correct answer counts in host monitor without leaking to players", async () => {
    const { pin, hostToken } = await gameManager.createGame("quiz-123");
    const siti = await gameManager.joinPlayer(pin, "Siti", "socket-1");
    const budi = await gameManager.joinPlayer(pin, "Budi", "socket-2");
    await gameManager.startGame(pin, hostToken);

    await vi.advanceTimersByTimeAsync(INTRO_DURATION_MS);

    // Siti answers correctly in 1.2s; Budi answers wrongly in 2.5s
    await vi.advanceTimersByTimeAsync(1_200);
    await gameManager.submitAnswer(pin, siti.playerId!, 0, [0]);

    const midMonitor = await gameManager.buildHostMonitor(pin);
    expect(midMonitor?.answeredCount).toBe(1);
    expect(midMonitor?.fastestPlayer?.nickname).toBe("Siti");
    expect(midMonitor?.fastestPlayer?.isCorrect).toBeNull(); // not revealed yet

    await vi.advanceTimersByTimeAsync(1_300);
    await gameManager.submitAnswer(pin, budi.playerId!, 0, [1]);

    // Now on question #2: Siti has 1 correct answer, Budi has 0
    const nextMonitor = await gameManager.buildHostMonitor(pin);
    const sitiStats = nextMonitor?.players.find((p) => p.playerId === siti.playerId);
    const budiStats = nextMonitor?.players.find((p) => p.playerId === budi.playerId);
    expect(sitiStats?.correctCount).toBe(1);
    expect(budiStats?.correctCount).toBe(0);

    // Ensure players never receive host:monitor in snapshots
    const playerSnap = await gameManager.buildPlayerSnapshot(pin, siti.playerId!);
    expect(playerSnap.events.map((e) => e.event)).not.toContain("host:monitor");
  });
});
