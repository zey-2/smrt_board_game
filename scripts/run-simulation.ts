import {
  FIXED_ROUND_OPTIONS,
  buildGameConfigFromModeSelection
} from "../src/game/constants/gameModeOptions";
import { BASELINE_SIMULATION_PRESET } from "../src/game/simulation/presets";
import { formatSimulationReport } from "../src/game/simulation/report";
import { runSimulationBatch } from "../src/game/simulation/runner";

interface CliOptions {
  games: number;
  seed: number;
}

function parseCliOptions(argv: string[]): CliOptions {
  let games = 1000;
  let seed = 20260314;

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];

    if (current === "--games" && next) {
      games = Number(next);
      index += 1;
      continue;
    }

    if (current === "--seed" && next) {
      seed = Number(next);
      index += 1;
    }
  }

  if (!Number.isInteger(games) || games <= 0) {
    throw new Error(`Invalid --games value: ${games}`);
  }

  if (!Number.isInteger(seed) || seed <= 0) {
    throw new Error(`Invalid --seed value: ${seed}`);
  }

  return { games, seed };
}

function main() {
  const options = parseCliOptions(process.argv.slice(2));
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
