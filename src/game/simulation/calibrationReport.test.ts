import { describe, expect, test } from "vitest";
import { formatTransportFareCalibrationReport } from "./calibrationReport";

describe("formatTransportFareCalibrationReport", () => {
  test("renders the best candidates first and shows ties", () => {
    const output = formatTransportFareCalibrationReport({
      targetRounds: 20,
      results: [
        { transportFareRate: 20, averageRounds: 20.2, distanceFromTarget: 0.2 },
        { transportFareRate: 25, averageRounds: 19.8, distanceFromTarget: 0.2 },
        { transportFareRate: 30, averageRounds: 23.1, distanceFromTarget: 3.1 }
      ]
    });

    expect(output).toContain("Transport Fare Calibration Report");
    expect(output).toContain("Target average rounds: 20");
    expect(output).toContain("Best candidates: 20, 25");
    expect(output).toContain("30");
  });
});
