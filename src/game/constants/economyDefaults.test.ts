import { describe, expect, test } from "vitest";
import {
  DEFAULT_INITIAL_CASH,
  DEFAULT_TARGET_WEALTH,
  DEFAULT_TRANSPORT_FARE_RATE
} from "./economyDefaults";

describe("economy defaults", () => {
  test("exports the calibrated transport fare rate shared by live and simulated games", () => {
    expect(DEFAULT_INITIAL_CASH).toBe(1500);
    expect(DEFAULT_TARGET_WEALTH).toBe(8000);
    expect(DEFAULT_TRANSPORT_FARE_RATE).toBe(37);
  });
});
