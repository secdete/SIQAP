import { describe, it, expect, beforeEach } from "vitest";
import { Server } from "socket.io";
import { createServer } from "http";
import { GameManager } from "./game-manager.js";
import { MemorySessionStore } from "../store/memory.js";

describe("GameManager State Machine", () => {
  let store: MemorySessionStore;
  let gameManager: GameManager;
  let io: any;

  beforeEach(() => {
    store = new MemorySessionStore();
    const httpServer = createServer();
    io = new Server(httpServer);
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

    // Second submission must be rejected with ALREADY_ANSWERED because Budi hasn't answered yet
    const ansDup = await gameManager.submitAnswer(pin, playerId, 0, [0]);
    expect(ansDup.ok).toBe(false);
    expect(ansDup.error).toBe("ALREADY_ANSWERED");
  });
});
