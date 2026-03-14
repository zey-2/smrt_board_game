import type { SimulationBatchSummary } from "./runner";

interface SimulationComparison {
  baseline: SimulationBatchSummary;
  variant: SimulationBatchSummary;
}

function formatDecimal(value: number): string {
  return value.toFixed(2);
}

function formatSeatWins(summary: SimulationBatchSummary): string {
  return summary.seatWinCounts
    .map((wins, index) => {
      const rate = summary.gameCount === 0 ? 0 : (wins / summary.gameCount) * 100;
      return `P${index + 1}: ${wins} (${rate.toFixed(1)}%)`;
    })
    .join(", ");
}

function formatTopLandings(summary: SimulationBatchSummary): string {
  return Object.entries(summary.tileLandingCounts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([tileId, count]) => `${tileId} ${count}`)
    .join(", ");
}

function formatSummary(summary: SimulationBatchSummary): string[] {
  return [
    summary.label,
    `Games: ${summary.gameCount}`,
    `Average rounds: ${formatDecimal(summary.averageRounds)}`,
    `Seat wins: ${formatSeatWins(summary)}`,
    `Average ending cash: ${formatDecimal(summary.averageEndingCash)}`,
    `Average ending net worth: ${formatDecimal(summary.averageEndingNetWorth)}`,
    `Station purchases: ${summary.totalStationPurchases}`,
    `Rent payments: ${summary.totalRentPayments}`,
    `Bankruptcies: ${summary.totalBankruptcies}`,
    `Lead changes: ${summary.totalLeadChanges}`,
    `Cash-tile awards: ${summary.totalCashTileAwards}`,
    `Purchase enables: ${summary.totalPurchaseEnablesFromCashTile}`,
    `Top landings: ${formatTopLandings(summary)}`
  ];
}

export function formatSimulationComparison({
  baseline,
  variant
}: SimulationComparison): string {
  return [
    "SMRT Monopoly Simulation Report",
    "",
    ...formatSummary(baseline),
    "",
    ...formatSummary(variant)
  ].join("\n");
}
