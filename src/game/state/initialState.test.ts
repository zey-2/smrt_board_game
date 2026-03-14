import { afterEach, describe, expect, test, vi } from "vitest";
import { PLAYER_COLOR_OPTIONS, PLAYER_ICON_OPTIONS } from "../../features/players/playerAppearance";
import { createGameState } from "./initialState";

describe("initialState", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("creates default players with dog breed names", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const state = createGameState();

    expect(state.players.map((player) => player.name)).toEqual(["Beagle", "Corgi"]);
    expect(PLAYER_COLOR_OPTIONS.map((option) => option.id)).toEqual(["navy", "purple", "pink", "cyan"]);
    expect(state.players.map((player) => [player.iconId, player.colorId])).toEqual([
      [PLAYER_ICON_OPTIONS[0].id, PLAYER_COLOR_OPTIONS[0].id],
      [PLAYER_ICON_OPTIONS[1].id, PLAYER_COLOR_OPTIONS[1].id]
    ]);
  });
});
