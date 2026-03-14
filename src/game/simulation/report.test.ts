import { describe, expect, test } from "vitest";
import type { SimulationBatchSummary } from "./runner";
import { formatSimulationReport } from "./report";

function createSummary(
  label: string,
  averageRounds: number,
  totalCashTileAwards: number
): SimulationBatchSummary {
  return {
    label,
    gameCount: 50,
    averageRounds,
    seatWinCounts: [28, 22],
    averageEndingCash: 1320.5,
    averageEndingNetWorth: 2440.25,
    totalStationPurchases: 61,
    totalRentPayments: 33,
    totalBankruptcies: 4,
    totalLeadChanges: 17,
    tileLandingCounts: {
      "jurong-east": 12,
      "cash-top-up": totalCashTileAwards
    },
    totalCashTileAwards,
    totalPurchaseEnablesFromCashTile: 9
  };
}

describe("formatSimulationReport", () => {
  test("renders classic and timed summaries in one report", () => {
    const output = formatSimulationReport([
      createSummary("Classic mode", 236.1, 0),
      createSummary("20 minutes", 12, 0)
    ]);

    expect(output).toContain("Classic mode");
    expect(output).toContain("20 minutes");
    expect(output).toContain("Average rounds");
  });
});
