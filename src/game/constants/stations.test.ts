import { describe, expect, test } from "vitest";
import { KEY_STATIONS_PRESET } from "./stations";

describe("KEY_STATIONS_PRESET", () => {
  test("has at least 22 key stations and unique ids", () => {
    expect(KEY_STATIONS_PRESET.length).toBeGreaterThanOrEqual(22);
    const ids = new Set(KEY_STATIONS_PRESET.map((station) => station.id));
    expect(ids.size).toBe(KEY_STATIONS_PRESET.length);
  });
});
