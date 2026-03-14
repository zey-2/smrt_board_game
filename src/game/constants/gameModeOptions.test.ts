import { describe, expect, test } from "vitest";
import {
  DEFAULT_INITIAL_CASH,
  DEFAULT_TARGET_WEALTH,
  DEFAULT_TRANSPORT_FARE_RATE
} from "./economyDefaults";
import {
  DEFAULT_FIXED_ROUND_OPTION_ID,
  DEFAULT_GAME_MODE_ID,
  DEFAULT_TIMED_MODE_OPTION_ID,
  FIXED_ROUND_OPTIONS,
  GAME_MODE_OPTIONS,
  TIMED_MODE_OPTIONS,
  buildGameConfigFromModeSelection
} from "./gameModeOptions";

describe("gameModeOptions", () => {
  test("exposes explicit classic, timed, and fixed-round setup modes", () => {
    expect(DEFAULT_GAME_MODE_ID).toBe("TIMED");
    expect(DEFAULT_TIMED_MODE_OPTION_ID).toBe("MINUTES_20");
    expect(DEFAULT_FIXED_ROUND_OPTION_ID).toBe("ROUNDS_12");
    expect(GAME_MODE_OPTIONS.map((option) => option.id)).toEqual([
      "CLASSIC",
      "TIMED",
      "FIXED_ROUNDS"
    ]);
    expect(TIMED_MODE_OPTIONS.map((option) => option.id)).toEqual([
      "MINUTES_10",
      "MINUTES_15",
      "MINUTES_20",
      "MINUTES_30"
    ]);
    expect(FIXED_ROUND_OPTIONS.map((option) => option.id)).toEqual([
      "ROUNDS_6",
      "ROUNDS_9",
      "ROUNDS_12",
      "ROUNDS_18"
    ]);
  });

  test("builds classic, timed, and fixed-round configs explicitly", () => {
    expect(
      buildGameConfigFromModeSelection({
        modeId: "CLASSIC"
      })
    ).toMatchObject({
      mode: "CLASSIC",
      endCondition: "LAST_PLAYER_STANDING",
      timeLimitSeconds: null,
      fixedRoundLimit: 12,
      initialCash: DEFAULT_INITIAL_CASH,
      targetWealth: DEFAULT_TARGET_WEALTH,
      transportFareRate: DEFAULT_TRANSPORT_FARE_RATE
    });

    expect(
      buildGameConfigFromModeSelection({
        modeId: "TIMED",
        timedOptionId: "MINUTES_20"
      })
    ).toMatchObject({
      mode: "TIMED",
      endCondition: "LAST_PLAYER_STANDING",
      timeLimitSeconds: 1200,
      fixedRoundLimit: 12,
      initialCash: DEFAULT_INITIAL_CASH,
      targetWealth: DEFAULT_TARGET_WEALTH,
      transportFareRate: DEFAULT_TRANSPORT_FARE_RATE
    });

    expect(
      buildGameConfigFromModeSelection({
        modeId: "FIXED_ROUNDS",
        fixedRoundOptionId: "ROUNDS_9"
      })
    ).toMatchObject({
      mode: "FIXED_ROUNDS",
      endCondition: "FIXED_ROUNDS",
      timeLimitSeconds: null,
      fixedRoundLimit: 9,
      initialCash: DEFAULT_INITIAL_CASH,
      targetWealth: DEFAULT_TARGET_WEALTH,
      transportFareRate: DEFAULT_TRANSPORT_FARE_RATE
    });
  });
});
