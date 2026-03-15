import { describe, expect, test } from "vitest";
import {
  DEFAULT_INITIAL_CASH,
  DEFAULT_TARGET_WEALTH,
  DEFAULT_TRANSPORT_FARE_RATE
} from "./economyDefaults";

describe("economy defaults", () => {
  test("exports calibrated economy defaults shared by live and simulated games", () => {
    expect(DEFAULT_INITIAL_CASH).toBe(41);
    expect(DEFAULT_TARGET_WEALTH).toBe(216);
    expect(DEFAULT_TRANSPORT_FARE_RATE).toBe(1);
  });
});
