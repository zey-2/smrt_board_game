export interface SummaryCliOptions {
  mode: "SUMMARY";
  games: number;
  seed: number;
}

export interface CalibrationCliOptions {
  mode: "CALIBRATE_INITIAL_CASH";
  games: number;
  seed: number;
  cashMin: number;
  cashMax: number;
  cashStep: number;
  targetRounds: number;
}

export type SimulationCliOptions = SummaryCliOptions | CalibrationCliOptions;

const DEFAULT_GAMES = 1000;
const DEFAULT_SEED = 20260314;
const DEFAULT_CASH_MIN = 100;
const DEFAULT_CASH_MAX = 1500;
const DEFAULT_CASH_STEP = 50;
const DEFAULT_TARGET_ROUNDS = 20;

function parseRequiredInteger(flag: string, value: number): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${flag} value: ${value}`);
  }

  return value;
}

export function parseSimulationCliOptions(argv: string[]): SimulationCliOptions {
  let games = DEFAULT_GAMES;
  let seed = DEFAULT_SEED;
  let cashMin = DEFAULT_CASH_MIN;
  let cashMax = DEFAULT_CASH_MAX;
  let cashStep = DEFAULT_CASH_STEP;
  let targetRounds = DEFAULT_TARGET_ROUNDS;
  let calibrateInitialCash = false;

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];

    if (current === "--calibrate-initial-cash") {
      calibrateInitialCash = true;
      continue;
    }

    if (current === "--games" && next) {
      games = Number(next);
      index += 1;
      continue;
    }

    if (current === "--seed" && next) {
      seed = Number(next);
      index += 1;
      continue;
    }

    if (current === "--cash-min" && next) {
      cashMin = Number(next);
      index += 1;
      continue;
    }

    if (current === "--cash-max" && next) {
      cashMax = Number(next);
      index += 1;
      continue;
    }

    if (current === "--cash-step" && next) {
      cashStep = Number(next);
      index += 1;
      continue;
    }

    if (current === "--target-rounds" && next) {
      targetRounds = Number(next);
      index += 1;
    }
  }

  games = parseRequiredInteger("--games", games);
  seed = parseRequiredInteger("--seed", seed);

  if (!calibrateInitialCash) {
    return {
      mode: "SUMMARY",
      games,
      seed
    };
  }

  parseRequiredInteger("--cash-min", cashMin);
  parseRequiredInteger("--cash-max", cashMax);
  cashStep = parseRequiredInteger("--cash-step", cashStep);
  targetRounds = parseRequiredInteger("--target-rounds", targetRounds);

  return {
    mode: "CALIBRATE_INITIAL_CASH",
    games,
    seed,
    cashMin,
    cashMax,
    cashStep,
    targetRounds
  };
}
