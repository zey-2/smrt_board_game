import { describe, expect, test } from "vitest";
import { initialState } from "../state/initialState";
import type { GameState } from "../types";
import { clearSavedGameState, loadGameState, saveGameState } from "./localSave";

describe("localSave", () => {
  test("clears saved game state", () => {
    saveGameState(initialState);

    clearSavedGameState();

    expect(loadGameState()).toBeNull();
  });

  test("saves and restores game state", () => {
    saveGameState(initialState);
    const loaded = loadGameState();
    expect(loaded?.round).toBe(initialState.round);
    expect(loaded?.players[0].name).toBe(initialState.players[0].name);
  });

  test("returns null for malformed stored state", () => {
    localStorage.setItem("smrt-monopoly-state", "not-json");
    expect(loadGameState()).toBeNull();
  });

  test("restores remaining time for timed games", () => {
    saveGameState({
      ...initialState,
      config: {
        ...initialState.config,
        mode: "TIMED",
        timeLimitSeconds: 600
      },
      remainingTimeMs: 598000
    } as GameState);

    const loaded = loadGameState() as (GameState & { remainingTimeMs: number | null }) | null;

    expect(loaded?.config.mode).toBe("TIMED");
    expect(loaded?.remainingTimeMs).toBe(598000);
  });

  test("returns null when remaining time is not numeric", () => {
    localStorage.setItem(
      "smrt-monopoly-state",
      JSON.stringify({
        ...initialState,
        config: {
          ...initialState.config,
          mode: "TIMED",
          timeLimitSeconds: 600
        },
        remainingTimeMs: "598000"
      })
    );

    expect(loadGameState()).toBeNull();
  });
});
