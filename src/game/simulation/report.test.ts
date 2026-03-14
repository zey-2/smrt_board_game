import { describe, expect, test } from "vitest";
import type { SimulationBatchSummary } from "./runner";
import { formatSimulationReport } from "./report";

function createSummary(
  label: string,
  averageRounds: number,
  totalCashTileAwards: number,
  totalTies: number
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
    totalTies,
    totalCashTileAwards,
    totalPurchaseEnablesFromCashTile: 9
  };
}

describe("formatSimulationReport", () => {
  test("renders structured classic and fixed-round summaries including ties", () => {
    const output = formatSimulationReport([
      createSummary("Classic mode", 236.1, 0, 0),
      createSummary("12 rounds", 12, 0, 3)
    ]);

    expect(output).toContain("SMRT Monopoly Simulation Report");
    expect(output).toContain("Classic mode");
    expect(output).toContain("Games: 50");
    expect(output).toContain("Seat wins: P1: 28 (56.0%), P2: 22 (44.0%)");
    expect(output).toContain("Ties: 0 (0.0%)");
    expect(output).toContain("12 rounds");
    expect(output).not.toContain("20 minutes");
    expect(output).toContain("Average rounds");
    expect(output).toContain("Ties: 3 (6.0%)");
    expect(output).toContain("Top landings: jurong-east 12, cash-top-up 0");
  });
});
