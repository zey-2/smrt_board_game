import { describe, expect, test } from "vitest";
import { rankInitialCashCandidates } from "./calibration";
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
    totalRentPayments: 0,
    totalBankruptcies: 0,
    totalLeadChanges: 0,
    tileLandingCounts: {},
    totalCashTileAwards: 0,
    totalPurchaseEnablesFromCashTile: 0
  };
}

describe("rankInitialCashCandidates", () => {
  test("passes each candidate initial cash to the simulation runner and sorts by closeness to the target", () => {
    const calls: number[] = [];

    const results = rankInitialCashCandidates({
      minCash: 800,
      maxCash: 1200,
      step: 200,
      targetRounds: 20,
      gameCount: 200,
      seed: 20260314,
      runBatch: ({ simulationConfig }) => {
        calls.push(simulationConfig.initialCash);

        const averages: Record<number, number> = {
          800: 27,
          1000: 20.5,
          1200: 17
        };

        return createBatchSummary(averages[simulationConfig.initialCash]);
      }
    });

    expect(calls).toEqual([800, 1000, 1200]);
    expect(results.map((entry) => entry.initialCash)).toEqual([1000, 1200, 800]);
    expect(results[0]).toMatchObject({
      initialCash: 1000,
      averageRounds: 20.5,
      distanceFromTarget: 0.5
    });
  });

  test("breaks equal-distance ties by lower initial cash", () => {
    const results = rankInitialCashCandidates({
      minCash: 900,
      maxCash: 1100,
      step: 200,
      targetRounds: 20,
      gameCount: 200,
      seed: 20260314,
      runBatch: ({ simulationConfig }) =>
        createBatchSummary(simulationConfig.initialCash === 900 ? 19 : 21)
    });

    expect(results.map((entry) => entry.initialCash)).toEqual([900, 1100]);
  });

  test("throws when the candidate range is invalid", () => {
    expect(() =>
      rankInitialCashCandidates({
        minCash: 1000,
        maxCash: 800,
        step: 100,
        targetRounds: 20,
        gameCount: 200,
        seed: 20260314
      })
    ).toThrow("Invalid initial cash calibration range");
  });
});
