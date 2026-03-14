import type { GameConfig } from "../types";

export type GameModeId = "CLASSIC" | "TIMED" | "FIXED_ROUNDS";
export type TimedModeOptionId = "MINUTES_10" | "MINUTES_15" | "MINUTES_20" | "MINUTES_30";
export type FixedRoundOptionId = "ROUNDS_6" | "ROUNDS_9" | "ROUNDS_12" | "ROUNDS_18";

export interface GameModeOption {
  id: GameModeId;
  label: string;
  description: string;
}

export interface TimedModeOption {
  id: TimedModeOptionId;
  label: string;
  description: string;
  timeLimitSeconds: number;
}

export interface FixedRoundOption {
  id: FixedRoundOptionId;
  label: string;
  description: string;
  fixedRoundLimit: number;
}

export interface GameModeSelection {
  modeId: GameModeId;
  timedOptionId?: TimedModeOptionId;
  fixedRoundOptionId?: FixedRoundOptionId;
}

export const GAME_MODE_OPTIONS: GameModeOption[] = [
  {
    id: "CLASSIC",
    label: "Classic",
    description: "Play until only one player is left active."
  },
  {
    id: "TIMED",
    label: "Timed",
    description: "Play against the clock with a real time limit."
  },
  {
    id: "FIXED_ROUNDS",
    label: "Fixed rounds",
    description: "Play a set number of rounds and compare wealth."
  }
];

export const TIMED_MODE_OPTIONS: TimedModeOption[] = [
  {
    id: "MINUTES_10",
    label: "10 minutes",
    description: "Fast timed session.",
    timeLimitSeconds: 10 * 60
  },
  {
    id: "MINUTES_15",
    label: "15 minutes",
    description: "Short timed session.",
    timeLimitSeconds: 15 * 60
  },
  {
    id: "MINUTES_20",
    label: "20 minutes",
    description: "Recommended timed session.",
    timeLimitSeconds: 20 * 60
  },
  {
    id: "MINUTES_30",
    label: "30 minutes",
    description: "Longer timed session.",
    timeLimitSeconds: 30 * 60
  }
];

export const FIXED_ROUND_OPTIONS: FixedRoundOption[] = [
  {
    id: "ROUNDS_6",
    label: "6 rounds",
    description: "Fast 2-player game.",
    fixedRoundLimit: 6
  },
  {
    id: "ROUNDS_9",
    label: "9 rounds",
    description: "Short fixed-round game.",
    fixedRoundLimit: 9
  },
  {
    id: "ROUNDS_12",
    label: "12 rounds",
    description: "Recommended fixed-round length.",
    fixedRoundLimit: 12
  },
  {
    id: "ROUNDS_18",
    label: "18 rounds",
    description: "Longer fixed-round session.",
    fixedRoundLimit: 18
  }
];

export const DEFAULT_GAME_MODE_ID: GameModeId = "TIMED";
export const DEFAULT_TIMED_MODE_OPTION_ID: TimedModeOptionId = "MINUTES_20";
export const DEFAULT_FIXED_ROUND_OPTION_ID: FixedRoundOptionId = "ROUNDS_12";

function getTimedOption(optionId: TimedModeOptionId = DEFAULT_TIMED_MODE_OPTION_ID): TimedModeOption {
  const option = TIMED_MODE_OPTIONS.find((entry) => entry.id === optionId);

  if (!option) {
    throw new Error(`Missing timed mode option: ${optionId}`);
  }

  return option;
}

function getFixedRoundOption(
  optionId: FixedRoundOptionId = DEFAULT_FIXED_ROUND_OPTION_ID
): FixedRoundOption {
  const option = FIXED_ROUND_OPTIONS.find((entry) => entry.id === optionId);

  if (!option) {
    throw new Error(`Missing fixed-round option: ${optionId}`);
  }

  return option;
}

export function buildGameConfigFromModeSelection({
  modeId,
  timedOptionId,
  fixedRoundOptionId
}: GameModeSelection): GameConfig {
  const defaultRoundLimit = getFixedRoundOption().fixedRoundLimit;

  if (modeId === "TIMED") {
    const timedOption = getTimedOption(timedOptionId);

    return {
      mode: modeId,
      endCondition: "LAST_PLAYER_STANDING",
      fixedRoundLimit: defaultRoundLimit,
      timeLimitSeconds: timedOption.timeLimitSeconds,
      targetWealth: 8000,
      initialCash: 1500
    };
  }

  if (modeId === "FIXED_ROUNDS") {
    const fixedRoundOption = getFixedRoundOption(fixedRoundOptionId);

    return {
      mode: modeId,
      endCondition: "FIXED_ROUNDS",
      fixedRoundLimit: fixedRoundOption.fixedRoundLimit,
      timeLimitSeconds: null,
      targetWealth: 8000,
      initialCash: 1500
    };
  }

  return {
    mode: modeId,
    endCondition: "LAST_PLAYER_STANDING",
    fixedRoundLimit: defaultRoundLimit,
    timeLimitSeconds: null,
    targetWealth: 8000,
    initialCash: 1500
  };
}
