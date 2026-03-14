import { BASELINE_SIMULATION_PRESET } from "./presets";
import { runSimulationBatch } from "./runner";
import type { SimulationBatchSummary } from "./runner";
import type { SimulationPreset } from "./types";

interface RankTransportFareRateCandidatesInput {
  fareMin: number;
  fareMax: number;
  step: number;
  targetRounds: number;
  gameCount: number;
  seed: number;
  playerCount?: number;
  preset?: SimulationPreset;
  runBatch?: typeof runSimulationBatch;
}

export interface TransportFareCalibrationResult {
  transportFareRate: number;
  averageRounds: number;
  distanceFromTarget: number;
}

const DEFAULT_PLAYER_COUNT = 2;

function getCandidateFareRates(fareMin: number, fareMax: number, step: number): number[] {
  if (fareMin > fareMax || step <= 0) {
    throw new Error("Invalid transport fare calibration range");
  }

  const values: number[] = [];

  for (let fareRate = fareMin; fareRate <= fareMax; fareRate += step) {
    values.push(fareRate);
  }

  return values;
}

export function rankTransportFareRateCandidates(
  input: RankTransportFareRateCandidatesInput
): TransportFareCalibrationResult[] {
  const runBatch = input.runBatch ?? runSimulationBatch;
  const preset = input.preset ?? BASELINE_SIMULATION_PRESET;
  const playerCount = input.playerCount ?? DEFAULT_PLAYER_COUNT;

  return getCandidateFareRates(input.fareMin, input.fareMax, input.step)
    .map((transportFareRate) => {
      const summary: SimulationBatchSummary = runBatch({
        preset,
        gameCount: input.gameCount,
        seed: input.seed,
        playerCount,
        simulationConfig: {
          endCondition: "LAST_PLAYER_STANDING",
          fixedRoundLimit: 12,
          targetWealth: 8000,
          transportFareRate
        }
      });

      return {
        transportFareRate,
        averageRounds: summary.averageRounds,
        distanceFromTarget: Math.abs(summary.averageRounds - input.targetRounds)
      };
    })
    .sort(
      (left, right) =>
        left.distanceFromTarget - right.distanceFromTarget ||
        left.transportFareRate - right.transportFareRate
    );
}
