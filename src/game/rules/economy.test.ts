import { describe, expect, test } from "vitest";
import {
  buyStation,
  calculateNetWorth,
  calculateTransportFare,
  payRent,
  payTransportFare
} from "./economy";

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

  test("preserves caller-specific fields on successful purchases", () => {
    const player = {
      id: "p1",
      cash: 350,
      position: 4,
      status: "active" as const,
      ownedStationIds: []
    };
    const tile = {
      id: "s1",
      ownerId: null,
      price: 200,
      name: "Station 1",
      baseRent: 20
    };

    const result = buyStation(player, tile);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.player.position).toBe(4);
    expect(result.player.status).toBe("active");
    expect(result.tile.name).toBe("Station 1");
    expect(result.tile.baseRent).toBe(20);
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

describe("calculateTransportFare", () => {
  test("multiplies travelled steps by the shared fare rate", () => {
    expect(calculateTransportFare(4, 25)).toBe(100);
  });
});

describe("payTransportFare", () => {
  test("transfers the full fare to the destination owner when the payer has enough cash", () => {
    const result = payTransportFare(
      { id: "payer", cash: 240, status: "active" },
      { id: "owner", cash: 500, status: "active" },
      120
    );

    expect(result.payer.cash).toBe(120);
    expect(result.owner.cash).toBe(620);
    expect(result.payer.status).toBe("active");
  });

  test("preserves player metadata while resolving the fare transfer", () => {
    const result = payTransportFare(
      {
        id: "payer",
        cash: 240,
        status: "active" as const,
        position: 7,
        ownedStationIds: ["a"]
      },
      {
        id: "owner",
        cash: 500,
        status: "active" as const,
        position: 2,
        ownedStationIds: ["b"]
      },
      120
    );

    expect(result.payer.position).toBe(7);
    expect(result.payer.ownedStationIds).toEqual(["a"]);
    expect(result.owner.position).toBe(2);
    expect(result.owner.ownedStationIds).toEqual(["b"]);
  });
});

describe("calculateNetWorth", () => {
  test("adds player cash and station values", () => {
    expect(calculateNetWorth(500, [120, 180, 300])).toBe(1100);
  });
});
