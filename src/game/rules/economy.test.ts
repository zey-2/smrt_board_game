import { describe, expect, test } from "vitest";
import { buyStation, calculateNetWorth, payRent } from "./economy";

describe("buyStation", () => {
  test("prevents buying when cash is insufficient", () => {
    const result = buyStation(
      { id: "p1", cash: 100, ownedStationIds: [] },
      { id: "s1", ownerId: null, price: 200 }
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("Insufficient cash");
  });

  test("assigns owner and deducts cash when purchase succeeds", () => {
    const result = buyStation(
      { id: "p1", cash: 350, ownedStationIds: [] },
      { id: "s1", ownerId: null, price: 200 }
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.player.cash).toBe(150);
    expect(result.player.ownedStationIds).toContain("s1");
    expect(result.tile.ownerId).toBe("p1");
  });
});

describe("payRent", () => {
  test("marks payer bankrupt when cash is insufficient for rent", () => {
    const result = payRent(
      { id: "payer", cash: 20, status: "active" },
      { id: "owner", cash: 400, status: "active" },
      30
    );
    expect(result.payer.status).toBe("bankrupt");
    expect(result.payer.cash).toBe(0);
    expect(result.owner.cash).toBe(420);
  });
});

describe("calculateNetWorth", () => {
  test("adds player cash and station values", () => {
    expect(calculateNetWorth(500, [120, 180, 300])).toBe(1100);
  });
});
