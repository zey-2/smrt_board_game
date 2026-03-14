import {
  FIXED_ROUND_OPTIONS,
  buildGameConfigFromModeSelection
} from "../src/game/constants/gameModeOptions";
import { rankInitialCashCandidates } from "../src/game/simulation/calibration";
import { formatInitialCashCalibrationReport } from "../src/game/simulation/calibrationReport";
import { parseSimulationCliOptions } from "../src/game/simulation/cliOptions";
import { BASELINE_SIMULATION_PRESET } from "../src/game/simulation/presets";
import { formatSimulationReport } from "../src/game/simulation/report";
import { runSimulationBatch } from "../src/game/simulation/runner";

function main() {
  const options = parseSimulationCliOptions(process.argv.slice(2));

  if (options.mode === "CALIBRATE_INITIAL_CASH") {
    const results = rankInitialCashCandidates({
      minCash: options.cashMin,
      maxCash: options.cashMax,
      step: options.cashStep,
      targetRounds: options.targetRounds,
      gameCount: options.games,
      seed: options.seed
    });

    console.log(
      formatInitialCashCalibrationReport({
        targetRounds: options.targetRounds,
        results
      })
    );
    return;
  }

  const summaries = [
    {
      label: "Classic mode",
      simulationConfig: buildGameConfigFromModeSelection({
        modeId: "CLASSIC"
      })
    },
    ...FIXED_ROUND_OPTIONS.map((option) => ({
      label: option.label,
      simulationConfig: buildGameConfigFromModeSelection({
        modeId: "FIXED_ROUNDS",
        fixedRoundOptionId: option.id
      })
    }))
  ].map(({ label, simulationConfig }) => ({
    ...runSimulationBatch({
      preset: BASELINE_SIMULATION_PRESET,
      gameCount: options.games,
      seed: options.seed,
      playerCount: 2,
      simulationConfig
    }),
    label
  }));

  console.log(formatSimulationReport(summaries));
}

main();
