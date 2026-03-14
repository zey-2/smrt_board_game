import { describe, expect, test } from "vitest";
import { initialState } from "../state/initialState";
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
});
