import { describe, expect, test } from "vitest";
import { evaluateEndCondition } from "./endConditions";
import type { EndConditionMode } from "../types";

interface EvalPlayer {
  id: string;
  status: "active" | "bankrupt";
  netWorth: number;
}

const makeState = (players: EvalPlayer[], round = 1) => ({
  players,
  round
});

describe("evaluateEndCondition", () => {
  test("detects winner by target wealth", () => {
    const resolution = evaluateEndCondition("TARGET_WEALTH", makeState([
      { id: "p1", status: "active", netWorth: 7800 },
      { id: "p2", status: "active", netWorth: 8100 }
    ]));
    expect(resolution).toEqual({ isComplete: true, winnerId: "p2" });
  });

  test("detects winner when fixed rounds are completed", () => {
    const resolution = evaluateEndCondition("FIXED_ROUNDS", makeState([
      { id: "p1", status: "active", netWorth: 900 },
      { id: "p2", status: "active", netWorth: 1200 }
    ], 12), {
      fixedRoundLimit: 12
    });
    expect(resolution).toEqual({ isComplete: true, winnerId: "p2" });
  });

  test("detects winner when only one player is active", () => {
    const resolution = evaluateEndCondition("LAST_PLAYER_STANDING", makeState([
      { id: "p1", status: "bankrupt", netWorth: 0 },
      { id: "p2", status: "active", netWorth: 450 }
    ]));
    expect(resolution).toEqual({ isComplete: true, winnerId: "p2" });
  });

  test("returns null if no condition is met", () => {
    const resolution = evaluateEndCondition("FIXED_ROUNDS", makeState([
      { id: "p1", status: "active", netWorth: 900 },
      { id: "p2", status: "active", netWorth: 1200 }
    ], 4), {
      fixedRoundLimit: 12
    });
    expect(resolution).toEqual({ isComplete: false, winnerId: null });
  });

  test("supports externally configured target wealth", () => {
    const mode: EndConditionMode = "TARGET_WEALTH";
    const resolution = evaluateEndCondition(mode, makeState([
      { id: "p1", status: "active", netWorth: 6200 },
      { id: "p2", status: "active", netWorth: 7100 }
    ]), {
      targetWealth: 7000
    });
    expect(resolution).toEqual({ isComplete: true, winnerId: "p2" });
  });

  test("returns a completed draw when fixed rounds end in a tie", () => {
    const resolution = evaluateEndCondition("FIXED_ROUNDS", makeState([
      { id: "p1", status: "active", netWorth: 1500 },
      { id: "p2", status: "active", netWorth: 1500 }
    ], 12), {
      fixedRoundLimit: 12
    });

    expect(resolution).toEqual({ isComplete: true, winnerId: null });
  });
});
