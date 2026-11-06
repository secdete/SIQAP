import { describe, it, expect } from "vitest";
import { calcPoints, streakBonus } from "./scoring.js";

describe("Scoring calculations", () => {
  it("returns 0 points if incorrect or mode is none", () => {
    expect(
      calcPoints({
        isCorrect: false,
        responseMs: 500,
        timeLimitMs: 20000,
        pointsMode: "standard",
      })
    ).toBe(0);

    expect(
      calcPoints({
        isCorrect: true,
        responseMs: 500,
        timeLimitMs: 20000,
        pointsMode: "none",
      })
    ).toBe(0);
  });

  it("calculates standard points based on speed (max at 0ms, ~50% at limit)", () => {
    const instant = calcPoints({
      isCorrect: true,
      responseMs: 0,
      timeLimitMs: 20000,
      pointsMode: "standard",
    });
    expect(instant).toBe(1000);

    const halfTime = calcPoints({
      isCorrect: true,
      responseMs: 10000,
      timeLimitMs: 20000,
      pointsMode: "standard",
    });
    expect(halfTime).toBe(750);

    const lastSecond = calcPoints({
      isCorrect: true,
      responseMs: 20000,
      timeLimitMs: 20000,
      pointsMode: "standard",
    });
    expect(lastSecond).toBe(500);
  });

  it("doubles points when pointsMode is double", () => {
    const doublePoints = calcPoints({
      isCorrect: true,
      responseMs: 0,
      timeLimitMs: 20000,
      pointsMode: "double",
    });
    expect(doublePoints).toBe(2000);
  });

  it("calculates streak bonus properly (+100 per streak after 1st, capped at 500)", () => {
    expect(streakBonus(0)).toBe(0);
    expect(streakBonus(1)).toBe(0);
    expect(streakBonus(2)).toBe(100);
    expect(streakBonus(3)).toBe(200);
    expect(streakBonus(4)).toBe(300);
    expect(streakBonus(5)).toBe(400);
    expect(streakBonus(6)).toBe(500);
    expect(streakBonus(10)).toBe(500);
  });
});
