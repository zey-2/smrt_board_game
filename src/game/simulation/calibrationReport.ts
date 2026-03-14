import type { TransportFareCalibrationResult } from "./calibration";

interface FormatTransportFareCalibrationReportInput {
  targetRounds: number;
  results: TransportFareCalibrationResult[];
}

function formatDecimal(value: number): string {
  return value.toFixed(2);
}

function formatFareRate(value: number): string {
  return `${value}`;
}

export function formatTransportFareCalibrationReport(
  input: FormatTransportFareCalibrationReportInput
): string {
  const bestDistance = input.results[0]?.distanceFromTarget ?? 0;
  const bestCandidates = input.results
    .filter((result) => result.distanceFromTarget === bestDistance)
    .map((result) => formatFareRate(result.transportFareRate))
    .join(", ");

  return [
    "Transport Fare Calibration Report",
    "",
    `Target average rounds: ${input.targetRounds}`,
    `Best candidates: ${bestCandidates}`,
    "",
    "Ranked candidates:",
    ...input.results.map(
      (result) =>
        `${formatFareRate(result.transportFareRate)} | average rounds ${formatDecimal(result.averageRounds)} | distance ${formatDecimal(result.distanceFromTarget)}`
    )
  ].join("\n");
}
