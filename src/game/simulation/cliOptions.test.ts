import { describe, expect, test } from "vitest";
import { parseSimulationCliOptions } from "./cliOptions";

describe("parseSimulationCliOptions", () => {
  test("parses transport fare calibration mode and range flags", () => {
    expect(
      parseSimulationCliOptions([
        "--calibrate-transport-fare",
        "--games",
        "2000",
        "--seed",
        "20260314",
        "--fare-min",
        "5",
        "--fare-max",
        "80",
        "--fare-step",
        "5"
      ])
    ).toEqual({
      mode: "CALIBRATE_TRANSPORT_FARE",
      games: 2000,
      seed: 20260314,
      fareMin: 5,
      fareMax: 80,
      fareStep: 5,
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

  test("throws when fare step is not positive", () => {
    expect(() =>
      parseSimulationCliOptions(["--calibrate-transport-fare", "--fare-step", "0"])
    ).toThrow("Invalid --fare-step value");
  });
});
