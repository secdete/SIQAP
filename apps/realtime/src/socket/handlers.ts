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
import { GameManager, HostSnapshotEvent, TypedServer } from "../engine/game-manager.js";
import { SocketRateLimiter } from "./rate-limit.js";

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

/** The answer a rate-limited event sends instead of running its handler. */
type LimitedAck = (r: { ok: false; error: ErrorCode }) => void;

// Shared by every connection: the CONTRACT §12 counters are per socket id and
// per IP, so they must live outside the per-connection handler registration.
const rateLimiter = new SocketRateLimiter();

export function registerSocketHandlers(_io: TypedServer, socket: TypedSocket, gameManager: GameManager): void {
  const clientIp = socket.handshake.address || "unknown";

  /**
   * Every event passes through the CONTRACT §12 rate limit before its handler:
   * 20 events per second per socket, 10 player:join per minute per IP.
   * A limited socket is answered RATE_LIMITED; one that keeps flooding
   * ("disconnect jika berulang") is disconnected.
   */
  const wrap = <Ev extends keyof ClientToServerEvents>(
    ev: Ev,
    handler: ClientToServerEvents[Ev]
  ): void => {
    const invoke = handler as unknown as (payload: unknown, ...rest: unknown[]) => unknown;
    // socket.io's `on` typing only resolves for literal event names; a generic
    // key needs a non-generic door to the same runtime registration.
    const rawOn = socket.on.bind(socket) as unknown as (
      event: string,
      listener: (payload: unknown, ...rest: unknown[]) => unknown
    ) => void;
    rawOn(String(ev), (payload, ...rest) => {
      const ack = rest[rest.length - 1] as LimitedAck | undefined;
      const verdict = rateLimiter.allow(socket.id, clientIp, String(ev));
      if (verdict) {
        ack?.({ ok: false, error: "RATE_LIMITED" });
        if (verdict === "DISCONNECT") socket.disconnect(true);
        return;
      }
      return invoke(payload, ...rest);
    });
  };

  // Sessions hold socket ids; forget the counters once the socket is gone.
  socket.on("disconnect", () => rateLimiter.clear(socket.id));

  // ---------------------------------------------------------------------------
  // Host Handlers
  // ---------------------------------------------------------------------------

  wrap("host:create", async (rawPayload, ack) => {
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

  wrap("host:rejoin", async (rawPayload, ack) => {
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

    // The host page keeps no state across a reload, so replay the events that
    // describe the current phase. Without this the screen snaps back to LOBBY
    // while the session carries on (and rejoined players get GAME_ALREADY_STARTED).
    try {
      for (const item of await gameManager.buildHostSnapshot(pin)) {
        emitSnapshotEvent(socket, item);
      }
    } catch (err) {
      console.warn(`host:rejoin: failed to replay state for ${pin}:`, err);
    }
  });

  wrap("host:start", async (rawPayload, ack) => {
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

  wrap("host:skip", async (rawPayload, ack) => {
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

  wrap("host:pause", async (rawPayload, ack) => {
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

  wrap("host:resume", async (rawPayload, ack) => {
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

  wrap("host:next", async (rawPayload, ack) => {
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

  wrap("host:end", async (rawPayload, ack) => {
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

  wrap("host:kick", async (rawPayload, ack) => {
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

  wrap("player:join", async (rawPayload, ack) => {
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

  wrap("player:rejoin", async (rawPayload, ack) => {
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

  wrap("player:answer", async (rawPayload, ack) => {
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

/**
 * Narrow a snapshot item down to one typed emit. The switch is what lets
 * TypeScript pair each event name with its own payload, so a mismatch between
 * the two cannot compile.
 */
function emitSnapshotEvent(socket: TypedSocket, item: HostSnapshotEvent): void {
  switch (item.event) {
    case "question:show":
      socket.emit("question:show", item.payload);
      break;
    case "game:phase":
      socket.emit("game:phase", item.payload);
      break;
    case "question:tick":
      socket.emit("question:tick", item.payload);
      break;
    case "question:reveal":
      socket.emit("question:reveal", item.payload);
      break;
    case "leaderboard:update":
      socket.emit("leaderboard:update", item.payload);
      break;
    case "game:end":
      socket.emit("game:end", item.payload);
      break;
    case "lobby:update":
      socket.emit("lobby:update", item.payload);
      break;
  }
}

async function getHostTokenFromRoom(_socket: TypedSocket, pin: string, gameManager: GameManager): Promise<string> {
  const session = await (gameManager as any).store.getSession(pin);
  return session?.hostToken || "";
}
