import { BASELINE_SIMULATION_PRESET } from "./presets";
import { runSimulationBatch } from "./runner";
import type { SimulationBatchSummary } from "./runner";
import type { SimulationPreset } from "./types";

interface RankInitialCashCandidatesInput {
  minCash: number;
  maxCash: number;
  step: number;
  targetRounds: number;
  gameCount: number;
  seed: number;
  playerCount?: number;
  preset?: SimulationPreset;
  runBatch?: typeof runSimulationBatch;
}

export interface InitialCashCalibrationResult {
  initialCash: number;
  averageRounds: number;
  distanceFromTarget: number;
}

const DEFAULT_PLAYER_COUNT = 2;

function getCandidateCashValues(minCash: number, maxCash: number, step: number): number[] {
  if (minCash > maxCash || step <= 0) {
    throw new Error("Invalid initial cash calibration range");
  }

  const values: number[] = [];

  for (let cash = minCash; cash <= maxCash; cash += step) {
    values.push(cash);
  }

  return values;
}

export function rankInitialCashCandidates(
  input: RankInitialCashCandidatesInput
): InitialCashCalibrationResult[] {
  const runBatch = input.runBatch ?? runSimulationBatch;
  const preset = input.preset ?? BASELINE_SIMULATION_PRESET;
  const playerCount = input.playerCount ?? DEFAULT_PLAYER_COUNT;

  return getCandidateCashValues(input.minCash, input.maxCash, input.step)
    .map((initialCash) => {
      const summary: SimulationBatchSummary = runBatch({
        preset,
        gameCount: input.gameCount,
        seed: input.seed,
        playerCount,
        simulationConfig: {
          endCondition: "LAST_PLAYER_STANDING",
          fixedRoundLimit: 12,
          targetWealth: 8000,
          initialCash
        }
      });

      return {
        initialCash,
        averageRounds: summary.averageRounds,
        distanceFromTarget: Math.abs(summary.averageRounds - input.targetRounds)
      };
    })
    .sort(
      (left, right) =>
        left.distanceFromTarget - right.distanceFromTarget || left.initialCash - right.initialCash
    );
}
