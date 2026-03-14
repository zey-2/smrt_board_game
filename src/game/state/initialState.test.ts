import { afterEach, describe, expect, test, vi } from "vitest";
import { createGameState } from "./initialState";

describe("initialState", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("creates default players with dog breed names", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const state = createGameState();

    expect(state.players.map((player) => player.name)).toEqual(["Beagle", "Corgi"]);
  });
});
