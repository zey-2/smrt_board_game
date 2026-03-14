import { describe, expect, test } from "vitest";
import { resolveLandingTurn } from "./engine";

describe("resolveLandingTurn", () => {
  test("buys an unowned station when cash remains above the safety threshold", () => {
    const result = resolveLandingTurn({
      player: {
        id: "p1",
        cash: 1200,
        position: 0,
        status: "active",
        ownedStationIds: []
      },
      tile: {
        type: "station",
        id: "jurong-east",
        name: "Jurong East",
        price: 280,
        baseRent: 28,
        ownerId: null
      },
      policy: {
        safetyThreshold: 200
      }
    });

    expect(result.player.cash).toBe(920);
    expect(result.player.ownedStationIds).toContain("jurong-east");
    expect(result.tile).toMatchObject({
      type: "station",
      ownerId: "p1"
    });
    expect(result.metrics.stationPurchases).toBe(1);
  });

  test("pays rent to another owner and bankrupts the payer when cash is insufficient", () => {
    const result = resolveLandingTurn({
      player: {
        id: "p1",
        cash: 20,
        position: 0,
        status: "active",
        ownedStationIds: []
      },
      owner: {
        id: "p2",
        cash: 1000,
        position: 0,
        status: "active",
        ownedStationIds: ["raffles-place"]
      },
      tile: {
        type: "station",
        id: "raffles-place",
        name: "Raffles Place",
        price: 360,
        baseRent: 36,
        ownerId: "p2"
      },
      policy: {
        safetyThreshold: 200
      }
    });

    expect(result.player.status).toBe("bankrupt");
    expect(result.player.cash).toBe(0);
    expect(result.owner?.cash).toBe(1020);
    expect(result.metrics.rentPayments).toBe(1);
    expect(result.metrics.bankruptcies).toBe(1);
  });

  test("awards 500 dollars when landing on the cash tile", () => {
    const result = resolveLandingTurn({
      player: {
        id: "p1",
        cash: 400,
        position: 0,
        status: "active",
        ownedStationIds: []
      },
      tile: {
        type: "cash",
        id: "cash-top-up",
        name: "Cash Top-Up",
        reward: 500
      },
      policy: {
        safetyThreshold: 200
      }
    });

    expect(result.player.cash).toBe(900);
    expect(result.metrics.cashTileAwards).toBe(1);
  });
});
