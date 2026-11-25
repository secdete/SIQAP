import { Redis } from "ioredis";
import { REDIS_TTL_SEC } from "@siqap/shared";
import { SessionStore, StoredAnswer, StoredPlayer, StoredSession } from "./types.js";

export class RedisSessionStore implements SessionStore {
  private redis: Redis;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      // Never give up: a stopped connection means every game action fails
      // until the process restarts, so keep retrying with a capped backoff
      // and let the store self-heal when Redis comes back.
      retryStrategy(times: number) {
        return Math.min(times * 100, 2000);
      },
    });

    this.redis.on("error", (err: Error) => {
      console.error("[Redis] Error:", err.message);
    });
  }

  async generateUniquePin(): Promise<string> {
    for (let i = 0; i < 1000; i++) {
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      const isMember = await this.redis.sismember("pin:active", pin);
      if (!isMember) {
        await this.redis.sadd("pin:active", pin);
        return pin;
      }
    }
    throw new Error("Unable to generate unique PIN");
  }

  async isPinActive(pin: string): Promise<boolean> {
    return Boolean(await this.redis.sismember("pin:active", pin));
  }

  async createSession(session: StoredSession): Promise<void> {
    const pin = session.pin;
    const sessionKey = `game:${pin}`;

    await this.redis
      .multi()
      .hset(sessionKey, {
        pin: session.pin,
        quizId: session.quizId,
        hostToken: session.hostToken,
        hostSocketId: session.hostSocketId || "",
        phase: session.phase,
        questionIndex: session.questionIndex.toString(),
        startedAt: session.startedAt.toString(),
        endsAt: session.endsAt.toString(),
        paused: session.paused ? "1" : "0",
        remainingMsWhenPaused: session.remainingMsWhenPaused.toString(),
        settings: JSON.stringify(session.settings),
        questions: JSON.stringify(session.questions),
      })
      .expire(sessionKey, REDIS_TTL_SEC)
      .sadd("pin:active", pin)
      .exec();
  }

  async getSession(pin: string): Promise<StoredSession | null> {
    const sessionKey = `game:${pin}`;
    const data = await this.redis.hgetall(sessionKey);
    if (!data || !data.pin) return null;

    return {
      pin: data.pin,
      quizId: data.quizId,
      hostToken: data.hostToken,
      hostSocketId: data.hostSocketId || undefined,
      hostDisconnectedAt: data.hostDisconnectedAt ? Number(data.hostDisconnectedAt) : undefined,
      phase: data.phase as any,
      questionIndex: Number(data.questionIndex),
      startedAt: Number(data.startedAt),
      endsAt: Number(data.endsAt),
      paused: data.paused === "1",
      remainingMsWhenPaused: Number(data.remainingMsWhenPaused),
      settings: JSON.parse(data.settings),
      questions: JSON.parse(data.questions),
    };
  }

  async updateSession(pin: string, patch: Partial<StoredSession>): Promise<void> {
    const sessionKey = `game:${pin}`;
    const updateObj: Record<string, string> = {};

    if (patch.phase !== undefined) updateObj.phase = patch.phase;
    if (patch.questionIndex !== undefined) updateObj.questionIndex = patch.questionIndex.toString();
    if (patch.startedAt !== undefined) updateObj.startedAt = patch.startedAt.toString();
    if (patch.endsAt !== undefined) updateObj.endsAt = patch.endsAt.toString();
    if (patch.paused !== undefined) updateObj.paused = patch.paused ? "1" : "0";
    if (patch.remainingMsWhenPaused !== undefined) updateObj.remainingMsWhenPaused = patch.remainingMsWhenPaused.toString();
    if (patch.hostSocketId !== undefined) updateObj.hostSocketId = patch.hostSocketId;
    if (patch.hostDisconnectedAt !== undefined) updateObj.hostDisconnectedAt = patch.hostDisconnectedAt.toString();
    if (patch.settings !== undefined) updateObj.settings = JSON.stringify(patch.settings);
    if (patch.questions !== undefined) updateObj.questions = JSON.stringify(patch.questions);

    if (Object.keys(updateObj).length > 0) {
      await this.redis.multi().hset(sessionKey, updateObj).expire(sessionKey, REDIS_TTL_SEC).exec();
    }
  }

  async deleteSession(pin: string): Promise<void> {
    await this.redis
      .multi()
      .del(`game:${pin}`)
      .del(`game:${pin}:players`)
      .del(`game:${pin}:nicknames`)
      .srem("pin:active", pin)
      .exec();
  }

  async addPlayer(pin: string, player: StoredPlayer): Promise<void> {
    const playersKey = `game:${pin}:players`;
    await this.redis
      .multi()
      .hset(playersKey, player.playerId, JSON.stringify(player))
      .expire(playersKey, REDIS_TTL_SEC)
      .exec();
  }

  async getPlayer(pin: string, playerId: string): Promise<StoredPlayer | null> {
    const raw = await this.redis.hget(`game:${pin}:players`, playerId);
    if (!raw) return null;
    return JSON.parse(raw);
  }

  async getPlayerByRejoinToken(pin: string, token: string): Promise<StoredPlayer | null> {
    const players = await this.getPlayers(pin);
    return players.find((p) => p.rejoinToken === token) || null;
  }

  async getPlayers(pin: string): Promise<StoredPlayer[]> {
    const rawMap = await this.redis.hgetall(`game:${pin}:players`);
    if (!rawMap) return [];
    return Object.values(rawMap).map((v) => JSON.parse(v as string));
  }

  async updatePlayer(pin: string, playerId: string, patch: Partial<StoredPlayer>): Promise<void> {
    const existing = await this.getPlayer(pin, playerId);
    if (!existing) return;
    const updated = { ...existing, ...patch };
    await this.addPlayer(pin, updated);
  }

  async removePlayer(pin: string, playerId: string): Promise<void> {
    const player = await this.getPlayer(pin, playerId);
    if (player) {
      await this.removeNickname(pin, player.nickname);
      await this.redis.hdel(`game:${pin}:players`, playerId);
    }
  }

  async addNickname(pin: string, nickname: string): Promise<boolean> {
    const nickKey = `game:${pin}:nicknames`;
    const res = await this.redis.sadd(nickKey, nickname.toLowerCase());
    await this.redis.expire(nickKey, REDIS_TTL_SEC);
    return res === 1;
  }

  async removeNickname(pin: string, nickname: string): Promise<void> {
    await this.redis.srem(`game:${pin}:nicknames`, nickname.toLowerCase());
  }

  async isNicknameTaken(pin: string, nickname: string): Promise<boolean> {
    return Boolean(await this.redis.sismember(`game:${pin}:nicknames`, nickname.toLowerCase()));
  }

  async recordAnswer(pin: string, questionIndex: number, answer: StoredAnswer): Promise<boolean> {
    const key = `game:${pin}:answers:${questionIndex}`;
    // Allow players to update their answer while the question is still active.
    await this.redis.multi().hset(key, answer.playerId, JSON.stringify(answer)).expire(key, REDIS_TTL_SEC).exec();
    return true;
  }

  async getAnswers(pin: string, questionIndex: number): Promise<StoredAnswer[]> {
    const rawMap = await this.redis.hgetall(`game:${pin}:answers:${questionIndex}`);
    if (!rawMap) return [];
    return Object.values(rawMap).map((v) => JSON.parse(v as string));
  }

  async getAllAnswers(pin: string): Promise<Record<number, StoredAnswer[]>> {
    const keys = await this.redis.keys(`game:${pin}:answers:*`);
    const result: Record<number, StoredAnswer[]> = {};

    for (const key of keys) {
      const parts = key.split(":");
      const qIndex = Number(parts[parts.length - 1]);
      const rawMap = await this.redis.hgetall(key);
      result[qIndex] = Object.values(rawMap).map((v) => JSON.parse(v as string));
    }

    return result;
  }
}
