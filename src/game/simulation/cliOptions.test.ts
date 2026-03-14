import { describe, expect, test } from "vitest";
import { parseSimulationCliOptions } from "./cliOptions";

describe("parseSimulationCliOptions", () => {
  test("parses initial cash calibration mode and range flags", () => {
    expect(
      parseSimulationCliOptions([
        "--calibrate-initial-cash",
        "--games",
        "2000",
        "--seed",
        "20260314",
        "--cash-min",
        "600",
        "--cash-max",
        "1200",
        "--cash-step",
        "100"
      ])
    ).toEqual({
      mode: "CALIBRATE_INITIAL_CASH",
      games: 2000,
      seed: 20260314,
      cashMin: 600,
      cashMax: 1200,
      cashStep: 100,
      targetRounds: 20
    });
  });

  test("defaults to summary mode when calibration is not requested", () => {
    expect(parseSimulationCliOptions([])).toMatchObject({
      mode: "SUMMARY",
      games: 1000,
      seed: 20260314
    });
  });

  test("throws when cash step is not positive", () => {
    expect(() =>
      parseSimulationCliOptions(["--calibrate-initial-cash", "--cash-step", "0"])
    ).toThrow("Invalid --cash-step value");
  });
});
