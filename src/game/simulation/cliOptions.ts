export interface SummaryCliOptions {
  mode: "SUMMARY";
  games: number;
  seed: number;
}

export interface CalibrationCliOptions {
  mode: "CALIBRATE_TRANSPORT_FARE";
  games: number;
  seed: number;
  fareMin: number;
  fareMax: number;
  fareStep: number;
  targetRounds: number;
}

export type SimulationCliOptions = SummaryCliOptions | CalibrationCliOptions;

const DEFAULT_GAMES = 1000;
const DEFAULT_SEED = 20260314;
const DEFAULT_FARE_MIN = 5;
const DEFAULT_FARE_MAX = 80;
const DEFAULT_FARE_STEP = 5;
const DEFAULT_TARGET_ROUNDS = 20;

const OBSOLETE_FLAG_REPLACEMENTS: Record<string, string> = {
  "--calibrate-initial-cash": "--calibrate-transport-fare",
  "--cash-min": "--fare-min",
  "--cash-max": "--fare-max",
  "--cash-step": "--fare-step"
};

function parseRequiredInteger(flag: string, value: number): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${flag} value: ${value}`);
  }

  return value;
}

export function parseSimulationCliOptions(argv: string[]): SimulationCliOptions {
  let games = DEFAULT_GAMES;
  let seed = DEFAULT_SEED;
  let fareMin = DEFAULT_FARE_MIN;
  let fareMax = DEFAULT_FARE_MAX;
  let fareStep = DEFAULT_FARE_STEP;
  let targetRounds = DEFAULT_TARGET_ROUNDS;
  let calibrateTransportFare = false;

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];

    if (current in OBSOLETE_FLAG_REPLACEMENTS) {
      throw new Error(
        `Obsolete flag ${current}. Use ${OBSOLETE_FLAG_REPLACEMENTS[current]} instead.`
      );
    }

    if (current === "--calibrate-transport-fare") {
      calibrateTransportFare = true;
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

    if (current === "--fare-min" && next) {
      fareMin = Number(next);
      index += 1;
      continue;
    }

    if (current === "--fare-max" && next) {
      fareMax = Number(next);
      index += 1;
      continue;
    }

    if (current === "--fare-step" && next) {
      fareStep = Number(next);
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

  if (!calibrateTransportFare) {
    return {
      mode: "SUMMARY",
      games,
      seed
    };
  }

  fareMin = parseRequiredInteger("--fare-min", fareMin);
  fareMax = parseRequiredInteger("--fare-max", fareMax);
  fareStep = parseRequiredInteger("--fare-step", fareStep);
  targetRounds = parseRequiredInteger("--target-rounds", targetRounds);

  return {
    mode: "CALIBRATE_TRANSPORT_FARE",
    games,
    seed,
    fareMin,
    fareMax,
    fareStep,
    targetRounds
  };
}
