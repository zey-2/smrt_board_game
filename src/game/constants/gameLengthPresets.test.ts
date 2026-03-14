import { describe, expect, test } from "vitest";
import {
  DEFAULT_GAME_LENGTH_PRESET_ID,
  GAME_LENGTH_PRESETS,
  buildGameConfigFromGameLengthPreset,
  type GameLengthPresetId
} from "./gameLengthPresets";

describe("gameLengthPresets", () => {
  test("defaults to the 20-minute timed preset and keeps classic mode available", () => {
    expect(DEFAULT_GAME_LENGTH_PRESET_ID).toBe("MINUTES_20");
    expect(GAME_LENGTH_PRESETS.map((preset) => preset.id)).toEqual([
      "CLASSIC",
      "MINUTES_10",
      "MINUTES_15",
      "MINUTES_20",
      "MINUTES_30"
    ]);
  });

  test("maps the 20-minute preset to fixed rounds and classic mode to last player standing", () => {
    expect(buildGameConfigFromGameLengthPreset("MINUTES_20")).toMatchObject({
      endCondition: "FIXED_ROUNDS",
      fixedRoundLimit: 12,
      targetWealth: 8000,
      initialCash: 1500
    });

    expect(buildGameConfigFromGameLengthPreset("CLASSIC")).toMatchObject({
      endCondition: "LAST_PLAYER_STANDING",
      fixedRoundLimit: 12
    });
  });

  test("maps the 10, 15, and 30 minute presets to their fixed-round limits", () => {
    expect(buildGameConfigFromGameLengthPreset("MINUTES_10")).toMatchObject({
      endCondition: "FIXED_ROUNDS",
      fixedRoundLimit: 6
    });

    expect(buildGameConfigFromGameLengthPreset("MINUTES_15")).toMatchObject({
      endCondition: "FIXED_ROUNDS",
      fixedRoundLimit: 9
    });

    expect(buildGameConfigFromGameLengthPreset("MINUTES_30")).toMatchObject({
      endCondition: "FIXED_ROUNDS",
      fixedRoundLimit: 18
    });
  });

  test("falls back to the explicit default timed preset for unknown ids", () => {
    expect(
      buildGameConfigFromGameLengthPreset("UNKNOWN_PRESET" as GameLengthPresetId)
    ).toMatchObject({
      endCondition: "FIXED_ROUNDS",
      fixedRoundLimit: 12
    });
  });
});
