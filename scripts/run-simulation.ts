import {
  BASELINE_SIMULATION_PRESET,
  CASH_TILE_VARIANT_PRESET
} from "../src/game/simulation/presets";
import { formatSimulationComparison } from "../src/game/simulation/report";
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
  const baseline = runSimulationBatch({
    preset: BASELINE_SIMULATION_PRESET,
    gameCount: options.games,
    seed: options.seed
  });
  const variant = runSimulationBatch({
    preset: CASH_TILE_VARIANT_PRESET,
    gameCount: options.games,
    seed: options.seed
  });

  console.log(
    formatSimulationComparison({
      baseline,
      variant
    })
  );
}

main();
