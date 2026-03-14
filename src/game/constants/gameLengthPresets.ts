import type { GameConfig } from "../types";
import {
  buildGameConfigFromModeSelection,
  type GameModeId,
  type TimedModeOptionId
} from "./gameModeOptions";

export type GameLengthPresetId =
  | "CLASSIC"
  | "MINUTES_10"
  | "MINUTES_15"
  | "MINUTES_20"
  | "MINUTES_30";

export interface GameLengthPreset {
  id: GameLengthPresetId;
  label: string;
  description: string;
  modeId: GameModeId;
  timedOptionId?: TimedModeOptionId;
  endCondition: GameConfig["endCondition"];
  fixedRoundLimit: number;
}

export const DEFAULT_GAME_LENGTH_PRESET_ID: GameLengthPresetId = "MINUTES_20";

export const GAME_LENGTH_PRESETS: GameLengthPreset[] = [
  {
    id: "CLASSIC",
    label: "Classic mode",
    description: "Play until only one player is left active.",
    modeId: "CLASSIC",
    endCondition: "LAST_PLAYER_STANDING",
    fixedRoundLimit: 12
  },
  {
    id: "MINUTES_10",
    label: "10 minutes",
    description: "Fast 2-player game.",
    modeId: "TIMED",
    timedOptionId: "MINUTES_10",
    endCondition: "FIXED_ROUNDS",
    fixedRoundLimit: 6
  },
  {
    id: "MINUTES_15",
    label: "15 minutes",
    description: "Short 2-player game.",
    modeId: "TIMED",
    timedOptionId: "MINUTES_15",
    endCondition: "FIXED_ROUNDS",
    fixedRoundLimit: 9
  },
  {
    id: "MINUTES_20",
    label: "20 minutes",
    description: "Recommended 2-player length.",
    modeId: "TIMED",
    timedOptionId: "MINUTES_20",
    endCondition: "FIXED_ROUNDS",
    fixedRoundLimit: 12
  },
  {
    id: "MINUTES_30",
    label: "30 minutes",
    description: "Longer timed session.",
    modeId: "TIMED",
    timedOptionId: "MINUTES_30",
    endCondition: "FIXED_ROUNDS",
    fixedRoundLimit: 18
  }
];

function getDefaultGameLengthPreset(): GameLengthPreset {
  const defaultPreset = GAME_LENGTH_PRESETS.find(
    (entry) => entry.id === DEFAULT_GAME_LENGTH_PRESET_ID
  );

  if (!defaultPreset) {
    throw new Error(`Missing default game length preset: ${DEFAULT_GAME_LENGTH_PRESET_ID}`);
  }

  return defaultPreset;
}

export function buildGameConfigFromGameLengthPreset(
  presetId: GameLengthPresetId,
  overrides: Partial<Pick<GameConfig, "initialCash" | "targetWealth">> = {}
): GameConfig {
  const preset =
    GAME_LENGTH_PRESETS.find((entry) => entry.id === presetId) ?? getDefaultGameLengthPreset();
  const config = buildGameConfigFromModeSelection({
    modeId: preset.modeId,
    timedOptionId: preset.timedOptionId
  });

  return {
    ...config,
    endCondition: preset.endCondition,
    fixedRoundLimit: preset.fixedRoundLimit,
    targetWealth: overrides.targetWealth ?? 8000,
    initialCash: overrides.initialCash ?? 1500
  };
}
