import { config } from "../config.js";
import { MemorySessionStore } from "./memory.js";
import { RedisSessionStore } from "./redis.js";
import { SessionStore } from "./types.js";

let storeInstance: SessionStore | null = null;

export function getSessionStore(): SessionStore {
  if (storeInstance) {
    return storeInstance;
  }

  if (config.redisUrl) {
    try {
      console.log("[Store] Initializing Redis session store with URL:", config.redisUrl);
      storeInstance = new RedisSessionStore(config.redisUrl);
      return storeInstance;
    } catch (err) {
      console.warn("[Store] Failed to connect to Redis, falling back to Memory store:", err);
    }
  }

  console.log("[Store] Initializing in-memory session store (development mode)");
  storeInstance = new MemorySessionStore();
  return storeInstance;
}

export * from "./types.js";
