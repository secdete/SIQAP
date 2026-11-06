import { Socket } from "socket.io";
import {
  HostCreate,
  HostRejoin,
  HostAction,
  HostKick,
  PlayerJoin,
  PlayerRejoin,
  PlayerAnswer,
  ErrorCode,
  ClientToServerEvents,
  ServerToClientEvents,
} from "@siqap/shared";
import { GameManager, TypedServer } from "../engine/game-manager.js";

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerSocketHandlers(_io: TypedServer, socket: TypedSocket, gameManager: GameManager): void {
  // ---------------------------------------------------------------------------
  // Host Handlers
  // ---------------------------------------------------------------------------

  socket.on("host:create", async (rawPayload, ack) => {
    const parse = HostCreate.safeParse(rawPayload);
    if (!parse.success) {
      return ack({ ok: false, error: "INVALID_PAYLOAD", message: parse.error.message });
    }

    try {
      const { pin, hostToken } = await gameManager.createGame(parse.data.quizId, parse.data.settings);
      socket.join(`game:${pin}`);
      socket.join(`host:${pin}`);
      ack({ ok: true, pin, hostToken });
    } catch (err: any) {
      ack({ ok: false, error: "INTERNAL", message: err.message });
    }
  });

  socket.on("host:rejoin", async (rawPayload, ack) => {
    const parse = HostRejoin.safeParse(rawPayload);
    if (!parse.success) {
      return ack({ ok: false, error: "INVALID_PAYLOAD" });
    }

    const { pin, hostToken } = parse.data;
    const isHost = await gameManager.verifyHost(pin, hostToken);
    if (!isHost) {
      return ack({ ok: false, error: "NOT_HOST" });
    }

    socket.join(`game:${pin}`);
    socket.join(`host:${pin}`);
    ack({ ok: true });
  });

  socket.on("host:start", async (rawPayload, ack) => {
    const parse = HostAction.safeParse(rawPayload);
    if (!parse.success) return ack({ ok: false, error: "INVALID_PAYLOAD" });

    const pin = parse.data.pin;
    const rooms = Array.from(socket.rooms);
    if (!rooms.includes(`host:${pin}`)) {
      return ack({ ok: false, error: "NOT_HOST" });
    }

    // We can extract hostToken or accept host based on room
    const result = await gameManager.startGame(pin, await getHostTokenFromRoom(socket, pin, gameManager));
    if (!result.ok) {
      return ack({ ok: false, error: (result.error as ErrorCode) || "INVALID_PHASE" });
    }
    ack({ ok: true });
  });

  socket.on("host:skip", async (rawPayload, ack) => {
    const parse = HostAction.safeParse(rawPayload);
    if (!parse.success) return ack({ ok: false, error: "INVALID_PAYLOAD" });

    const pin = parse.data.pin;
    const hostToken = await getHostTokenFromRoom(socket, pin, gameManager);
    const result = await gameManager.skipQuestion(pin, hostToken);
    if (!result.ok) {
      return ack({ ok: false, error: (result.error as ErrorCode) || "INVALID_PHASE" });
    }
    ack({ ok: true });
  });

  socket.on("host:pause", async (rawPayload, ack) => {
    const parse = HostAction.safeParse(rawPayload);
    if (!parse.success) return ack({ ok: false, error: "INVALID_PAYLOAD" });

    const pin = parse.data.pin;
    const hostToken = await getHostTokenFromRoom(socket, pin, gameManager);
    const result = await gameManager.pauseGame(pin, hostToken);
    if (!result.ok) {
      return ack({ ok: false, error: (result.error as ErrorCode) || "INVALID_PHASE" });
    }
    ack({ ok: true });
  });

  socket.on("host:resume", async (rawPayload, ack) => {
    const parse = HostAction.safeParse(rawPayload);
    if (!parse.success) return ack({ ok: false, error: "INVALID_PAYLOAD" });

    const pin = parse.data.pin;
    const hostToken = await getHostTokenFromRoom(socket, pin, gameManager);
    const result = await gameManager.resumeGame(pin, hostToken);
    if (!result.ok) {
      return ack({ ok: false, error: (result.error as ErrorCode) || "INVALID_PHASE" });
    }
    ack({ ok: true });
  });

  socket.on("host:next", async (rawPayload, ack) => {
    const parse = HostAction.safeParse(rawPayload);
    if (!parse.success) return ack({ ok: false, error: "INVALID_PAYLOAD" });

    const pin = parse.data.pin;
    const hostToken = await getHostTokenFromRoom(socket, pin, gameManager);
    const result = await gameManager.nextStep(pin, hostToken);
    if (!result.ok) {
      return ack({ ok: false, error: (result.error as ErrorCode) || "INVALID_PHASE" });
    }
    ack({ ok: true });
  });

  socket.on("host:end", async (rawPayload, ack) => {
    const parse = HostAction.safeParse(rawPayload);
    if (!parse.success) return ack({ ok: false, error: "INVALID_PAYLOAD" });

    const pin = parse.data.pin;
    const hostToken = await getHostTokenFromRoom(socket, pin, gameManager);
    const result = await gameManager.endGame(pin, hostToken);
    if (!result.ok) {
      return ack({ ok: false, error: (result.error as ErrorCode) || "INVALID_PHASE" });
    }
    ack({ ok: true });
  });

  socket.on("host:kick", async (rawPayload, ack) => {
    const parse = HostKick.safeParse(rawPayload);
    if (!parse.success) return ack({ ok: false, error: "INVALID_PAYLOAD" });

    const { pin, playerId } = parse.data;
    const hostToken = await getHostTokenFromRoom(socket, pin, gameManager);
    const result = await gameManager.kickPlayer(pin, hostToken, playerId);
    if (!result.ok) {
      return ack({ ok: false, error: (result.error as ErrorCode) || "INVALID_PAYLOAD" });
    }
    ack({ ok: true });
  });

  // ---------------------------------------------------------------------------
  // Player Handlers
  // ---------------------------------------------------------------------------

  socket.on("player:join", async (rawPayload, ack) => {
    const parse = PlayerJoin.safeParse(rawPayload);
    if (!parse.success) {
      return ack({ ok: false, error: "INVALID_PAYLOAD", message: parse.error.message });
    }

    const { pin, nickname } = parse.data;
    const result = await gameManager.joinPlayer(pin, nickname, socket.id);
    if (!result.ok || !result.playerId || !result.rejoinToken) {
      return ack({ ok: false, error: (result.error as ErrorCode) || "INVALID_PAYLOAD" });
    }

    socket.join(`game:${pin}`);
    socket.join(`player:${result.playerId}`);

    (socket.data as any).playerId = result.playerId;
    (socket.data as any).pin = pin;

    ack({ ok: true, playerId: result.playerId, rejoinToken: result.rejoinToken });
  });

  socket.on("player:rejoin", async (rawPayload, ack) => {
    const parse = PlayerRejoin.safeParse(rawPayload);
    if (!parse.success) {
      return ack({ ok: false, error: "INVALID_PAYLOAD" });
    }

    const { pin, rejoinToken } = parse.data;
    const result = await gameManager.rejoinPlayer(pin, rejoinToken, socket.id);
    if (!result.ok || !result.playerId || !result.phase) {
      return ack({ ok: false, error: (result.error as ErrorCode) || "REJOIN_FAILED" });
    }

    socket.join(`game:${pin}`);
    socket.join(`player:${result.playerId}`);

    (socket.data as any).playerId = result.playerId;
    (socket.data as any).pin = pin;

    ack({ ok: true, playerId: result.playerId, phase: result.phase });
  });

  socket.on("player:answer", async (rawPayload, ack) => {
    const parse = PlayerAnswer.safeParse(rawPayload);
    if (!parse.success) {
      return ack({ ok: false, error: "INVALID_PAYLOAD", message: parse.error.message });
    }

    const { pin, questionIndex, optionIndexes } = parse.data;
    const playerId = (socket.data as any).playerId;
    if (!playerId) {
      return ack({ ok: false, error: "UNAUTHORIZED" });
    }

    const result = await gameManager.submitAnswer(pin, playerId, questionIndex, optionIndexes);
    if (!result.ok) {
      return ack({ ok: false, error: (result.error as ErrorCode) || "INVALID_PHASE" });
    }

    ack({ ok: true });
  });
}

async function getHostTokenFromRoom(_socket: TypedSocket, pin: string, gameManager: GameManager): Promise<string> {
  const session = await (gameManager as any).store.getSession(pin);
  return session?.hostToken || "";
}
