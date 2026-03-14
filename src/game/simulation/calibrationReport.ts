import type { InitialCashCalibrationResult } from "./calibration";

interface FormatInitialCashCalibrationReportInput {
  targetRounds: number;
  results: InitialCashCalibrationResult[];
}

function formatDecimal(value: number): string {
  return value.toFixed(2);
}

function formatMoney(value: number): string {
  return `$${value}`;
}

export function formatInitialCashCalibrationReport(
  input: FormatInitialCashCalibrationReportInput
): string {
  const bestDistance = input.results[0]?.distanceFromTarget ?? 0;
  const bestCandidates = input.results
    .filter((result) => result.distanceFromTarget === bestDistance)
    .map((result) => formatMoney(result.initialCash))
    .join(", ");

  return [
    "Initial Cash Calibration Report",
    "",
    `Target average rounds: ${input.targetRounds}`,
    `Best candidates: ${bestCandidates}`,
    "",
    "Ranked candidates:",
    ...input.results.map(
      (result) =>
        `${formatMoney(result.initialCash)} | average rounds ${formatDecimal(result.averageRounds)} | distance ${formatDecimal(result.distanceFromTarget)}`
    )
  ].join("\n");
}
