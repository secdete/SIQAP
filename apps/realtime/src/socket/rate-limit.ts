/**
 * Rate limits from CONTRACT.md §12:
 *
 *   | Batas                              | Nilai            |
 *   |------------------------------------|------------------|
 *   | player:join per IP                 | 10 per menit     |
 *   | Semua event per socket             | 20 per detik     |
 *
 * Both violations answer RATE_LIMITED. A socket that keeps flooding the limit
 * ("disconnect jika berulang") gets disconnected instead.
 *
 * The clock is injected so the windows can be tested without waiting.
 */

const MAX_EVENTS_PER_SECOND = 20;
const MAX_JOINS_PER_MINUTE = 10;
/** Flooding within this grace window escalates a strike to a disconnect. */
const STRIKE_GRACE_MS = 5_000;
const STRIKE_LIMIT = 5;

export type RateVerdict = "RATE_LIMITED" | "DISCONNECT";

type EventState = {
  windowStart: number;
  count: number;
  strikes: number;
  lastStrikeAt: number;
};

type Window = { start: number; count: number };

export class SocketRateLimiter {
  private readonly events = new Map<string, EventState>();
  private readonly joins = new Map<string, Window>();
  private readonly now: () => number;

  constructor(now: () => number = Date.now) {
    this.now = now;
  }

  /** Returns null when the event may run, or the verdict to enforce. */
  allow(socketId: string, ip: string, event: string): RateVerdict | null {
    const at = this.now();

    const state = this.events.get(socketId) ?? {
      windowStart: at,
      count: 0,
      strikes: 0,
      lastStrikeAt: 0,
    };
    if (at - state.windowStart >= 1_000) {
      state.windowStart = at;
      state.count = 0;
    }
    state.count++;

    let verdict: RateVerdict | null = null;

    if (state.count > MAX_EVENTS_PER_SECOND) {
      // Strikes only escalate while the flood is continuous; a quiet period
      // between bursts starts the count over.
      const continuous = at - state.lastStrikeAt < STRIKE_GRACE_MS;
      state.strikes = continuous ? state.strikes + 1 : 1;
      state.lastStrikeAt = at;
      verdict = state.strikes >= STRIKE_LIMIT ? "DISCONNECT" : "RATE_LIMITED";
    }

    if (event === "player:join") {
      const joins = this.joins.get(ip) ?? { start: at, count: 0 };
      if (at - joins.start >= 60_000) {
        joins.start = at;
        joins.count = 0;
      }
      joins.count++;
      if (joins.count > MAX_JOINS_PER_MINUTE) {
        verdict = "RATE_LIMITED";
      }
      this.joins.set(ip, joins);
    }

    this.events.set(socketId, state);
    return verdict;
  }

  /** Forget a socket once it disconnects. */
  clear(socketId: string): void {
    this.events.delete(socketId);
  }
}
