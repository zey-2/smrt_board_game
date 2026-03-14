import { describe, expect, test } from "vitest";
import type { SimulationBatchSummary } from "./runner";
import { formatSimulationComparison } from "./report";

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

describe("formatSimulationComparison", () => {
  test("renders a side-by-side report for baseline and variant summaries", () => {
    const output = formatSimulationComparison({
      baseline: createSummary("Baseline", 18.4, 0),
      variant: createSummary("Cash Tile Variant", 16.9, 42)
    });

    expect(output).toContain("Baseline");
    expect(output).toContain("Cash Tile Variant");
    expect(output).toContain("Average rounds");
    expect(output).toContain("Cash-tile awards");
    expect(output).toContain("Purchase enables");
  });
});
