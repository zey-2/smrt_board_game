import { describe, expect, test } from "vitest";
import { rankTransportFareRateCandidates } from "./calibration";
import type { SimulationBatchSummary } from "./runner";

function createBatchSummary(averageRounds: number): SimulationBatchSummary {
  return {
    label: "classic",
    gameCount: 200,
    averageRounds,
    seatWinCounts: [100, 100],
    totalTies: 0,
    averageEndingCash: 0,
    averageEndingNetWorth: 0,
    totalStationPurchases: 0,
    totalTransportFarePayments: 0,
    totalBankruptcies: 0,
    totalLeadChanges: 0,
    tileLandingCounts: {},
    totalCashTileAwards: 0,
    totalPurchaseEnablesFromCashTile: 0
  };
}

describe("rankTransportFareRateCandidates", () => {
  test("passes each candidate fare rate to the simulation runner and sorts by closeness to the target", () => {
    const calls: number[] = [];

    const results = rankTransportFareRateCandidates({
      fareMin: 10,
      fareMax: 30,
      step: 10,
      targetRounds: 20,
      gameCount: 200,
      seed: 20260314,
      runBatch: ({ simulationConfig }) => {
        calls.push(simulationConfig.transportFareRate);

        const averages: Record<number, number> = {
          10: 27,
          20: 20.5,
          30: 17
        };

        return createBatchSummary(averages[simulationConfig.transportFareRate]);
      }
    });

    expect(calls).toEqual([10, 20, 30]);
    expect(results.map((entry) => entry.transportFareRate)).toEqual([20, 30, 10]);
    expect(results[0]).toMatchObject({
      transportFareRate: 20,
      averageRounds: 20.5,
      distanceFromTarget: 0.5
    });
  });

  test("breaks equal-distance ties by lower fare rate", () => {
    const results = rankTransportFareRateCandidates({
      fareMin: 15,
      fareMax: 25,
      step: 10,
      targetRounds: 20,
      gameCount: 200,
      seed: 20260314,
      runBatch: ({ simulationConfig }) =>
        createBatchSummary(simulationConfig.transportFareRate === 15 ? 19 : 21)
    });

    expect(results.map((entry) => entry.transportFareRate)).toEqual([15, 25]);
  });

  test("throws when the candidate range is invalid", () => {
    expect(() =>
      rankTransportFareRateCandidates({
        fareMin: 30,
        fareMax: 20,
        step: 100,
        targetRounds: 20,
        gameCount: 200,
        seed: 20260314
      })
    ).toThrow("Invalid transport fare calibration range");
  });
});
