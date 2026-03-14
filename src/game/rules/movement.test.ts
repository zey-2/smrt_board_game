import { describe, expect, test } from "vitest";
import { getMovementPath, movePosition } from "./movement";

describe("movePosition", () => {
  test("wraps around board when moving past last tile", () => {
    expect(movePosition(20, 5, 22)).toBe(3);
  });

  test("keeps movement within board bounds", () => {
    expect(movePosition(0, 6, 22)).toBe(6);
    expect(movePosition(21, 1, 22)).toBe(0);
  });
});

describe("getMovementPath", () => {
  test("returns each visited tile index in forward order", () => {
    expect(getMovementPath(2, 3, 10)).toEqual([3, 4, 5]);
  });

  test("includes wrap-around tiles before the destination", () => {
    expect(getMovementPath(8, 4, 10)).toEqual([9, 0, 1, 2]);
  });
});
