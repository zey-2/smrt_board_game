import { describe, expect, test } from "vitest";
import { movePosition } from "./movement";

describe("movePosition", () => {
  test("wraps around board when moving past last tile", () => {
    expect(movePosition(20, 5, 22)).toBe(3);
  });

  test("keeps movement within board bounds", () => {
    expect(movePosition(0, 6, 22)).toBe(6);
    expect(movePosition(21, 1, 22)).toBe(0);
  });
});
