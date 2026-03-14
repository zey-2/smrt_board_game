import {
  buildGameConfigFromGameLengthPreset,
  GAME_LENGTH_PRESETS
} from "../src/game/constants/gameLengthPresets";
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
  const summaries = GAME_LENGTH_PRESETS.map((preset) => ({
    ...runSimulationBatch({
      preset: BASELINE_SIMULATION_PRESET,
      gameCount: options.games,
      seed: options.seed,
      playerCount: 2,
      simulationConfig: buildGameConfigFromGameLengthPreset(preset.id)
    }),
    label: preset.label
  }));

  console.log(formatSimulationReport(summaries));
}

main();
