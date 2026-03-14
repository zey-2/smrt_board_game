import { describe, expect, test } from "vitest";
import { formatInitialCashCalibrationReport } from "./calibrationReport";

describe("formatInitialCashCalibrationReport", () => {
  test("renders the best candidates first and shows ties", () => {
    const output = formatInitialCashCalibrationReport({
      targetRounds: 20,
      results: [
        { initialCash: 900, averageRounds: 20.2, distanceFromTarget: 0.2 },
        { initialCash: 1000, averageRounds: 19.8, distanceFromTarget: 0.2 },
        { initialCash: 1100, averageRounds: 23.1, distanceFromTarget: 3.1 }
      ]
    });

    expect(output).toContain("Initial Cash Calibration Report");
    expect(output).toContain("Target average rounds: 20");
    expect(output).toContain("Best candidates: $900, $1000");
    expect(output).toContain("$1100");
  });
});
