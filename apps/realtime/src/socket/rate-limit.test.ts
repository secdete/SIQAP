import { describe, it, expect } from "vitest";
import { SocketRateLimiter } from "./rate-limit.js";

describe("SocketRateLimiter (CONTRACT.md section 12)", () => {
  it("allows 20 events per second per socket, then answers RATE_LIMITED", () => {
    let now = 1_000_000;
    const limiter = new SocketRateLimiter(() => now);

    for (let i = 0; i < 20; i++) {
      expect(limiter.allow("s1", "1.1.1.1", "player:answer")).toBeNull();
    }
    expect(limiter.allow("s1", "1.1.1.1", "player:answer")).toBe("RATE_LIMITED");

    // Counters are per socket: another connection is unaffected.
    expect(limiter.allow("s2", "1.1.1.1", "player:answer")).toBeNull();
  });

  it("opens a fresh window after one second", () => {
    let now = 0;
    const limiter = new SocketRateLimiter(() => now);

    for (let i = 0; i < 21; i++) limiter.allow("s1", "1.1.1.1", "x");
    expect(limiter.allow("s1", "1.1.1.1", "x")).toBe("RATE_LIMITED");

    now = 1_001;
    expect(limiter.allow("s1", "1.1.1.1", "x")).toBeNull();
  });

  it("allows 10 player:join per IP per minute", () => {
    let now = 0;
    const limiter = new SocketRateLimiter(() => now);

    for (let i = 0; i < 10; i++) {
      expect(limiter.allow(`sock-${i}`, "2.2.2.2", "player:join")).toBeNull();
    }
    expect(limiter.allow("sock-11", "2.2.2.2", "player:join")).toBe("RATE_LIMITED");

    // Different IP, same moment: its own counter.
    expect(limiter.allow("sock-99", "3.3.3.3", "player:join")).toBeNull();

    now = 60_001;
    expect(limiter.allow("sock-12", "2.2.2.2", "player:join")).toBeNull();
  });

  it("escalates a continuous flood to DISCONNECT on the fifth strike", () => {
    let now = 0;
    const limiter = new SocketRateLimiter(() => now);
    const verdicts: Array<string | null> = [];

    // Five bursts, each past the limit, each starting a new per-second window
    // but still inside the 5s grace that makes the flood count as continuous.
    for (let burst = 0; burst < 5; burst++) {
      for (let i = 0; i < 21; i++) verdicts.push(limiter.allow("s1", "1.1.1.1", "x"));
      now += 1_001;
    }

    expect(verdicts.filter((v) => v === "RATE_LIMITED")).toHaveLength(4);
    expect(verdicts[verdicts.length - 1]).toBe("DISCONNECT");
  });

  it("does not escalate when the flood stops for a while", () => {
    let now = 0;
    const limiter = new SocketRateLimiter(() => now);

    for (let i = 0; i < 21; i++) limiter.allow("s1", "1.1.1.1", "x"); // strike 1
    expect(limiter.allow("s1", "1.1.1.1", "x")).toBe("RATE_LIMITED");

    now = 60_000; // well past STRIKE_GRACE_MS: the strike counter restarts
    for (let i = 0; i < 21; i++) limiter.allow("s1", "1.1.1.1", "x");
    expect(limiter.allow("s1", "1.1.1.1", "x")).toBe("RATE_LIMITED");
  });

  it("forgets a socket once it disconnects", () => {
    let now = 0;
    const limiter = new SocketRateLimiter(() => now);

    for (let i = 0; i < 21; i++) limiter.allow("s1", "1.1.1.1", "x");
    expect(limiter.allow("s1", "1.1.1.1", "x")).toBe("RATE_LIMITED");

    limiter.clear("s1");
    expect(limiter.allow("s1", "1.1.1.1", "x")).toBeNull();
  });
});
