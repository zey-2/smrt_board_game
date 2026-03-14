import type { GameConfig } from "../types";

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
  endCondition: GameConfig["endCondition"];
  fixedRoundLimit: number;
}

export const DEFAULT_GAME_LENGTH_PRESET_ID: GameLengthPresetId = "MINUTES_20";

export const GAME_LENGTH_PRESETS: GameLengthPreset[] = [
  {
    id: "CLASSIC",
    label: "Classic mode",
    description: "Play until only one player is left active.",
    endCondition: "LAST_PLAYER_STANDING",
    fixedRoundLimit: 12
  },
  {
    id: "MINUTES_10",
    label: "10 minutes",
    description: "Fast 2-player game.",
    endCondition: "FIXED_ROUNDS",
    fixedRoundLimit: 6
  },
  {
    id: "MINUTES_15",
    label: "15 minutes",
    description: "Short 2-player game.",
    endCondition: "FIXED_ROUNDS",
    fixedRoundLimit: 9
  },
  {
    id: "MINUTES_20",
    label: "20 minutes",
    description: "Recommended 2-player length.",
    endCondition: "FIXED_ROUNDS",
    fixedRoundLimit: 12
  },
  {
    id: "MINUTES_30",
    label: "30 minutes",
    description: "Longer timed session.",
    endCondition: "FIXED_ROUNDS",
    fixedRoundLimit: 18
  }
];

export function buildGameConfigFromGameLengthPreset(
  presetId: GameLengthPresetId,
  overrides: Partial<Pick<GameConfig, "initialCash" | "targetWealth">> = {}
): GameConfig {
  const preset =
    GAME_LENGTH_PRESETS.find((entry) => entry.id === presetId) ?? GAME_LENGTH_PRESETS[0];

  return {
    endCondition: preset.endCondition,
    fixedRoundLimit: preset.fixedRoundLimit,
    targetWealth: overrides.targetWealth ?? 8000,
    initialCash: overrides.initialCash ?? 1500
  };
}
