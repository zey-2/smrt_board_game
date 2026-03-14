import type { EndConditionMode, GameConfig, Player } from "../../game/types";

export interface SetupDraft {
  names: string[];
  endCondition: EndConditionMode;
  initialCash: number;
  fixedRoundLimit: number;
  targetWealth: number;
}

export interface SetupResult {
  players: Player[];
  config: GameConfig;
  error: string | null;
}

export function validateAndBuildSetup(draft: SetupDraft): SetupResult {
  if (draft.names.length < 2 || draft.names.length > 4) {
    return {
      players: [],
      config: createDefaultConfig("LAST_PLAYER_STANDING"),
      error: "Player count must be 2-4"
    };
  }

  if (draft.names.some((name) => name.trim().length === 0)) {
    return {
      players: [],
      config: createDefaultConfig("LAST_PLAYER_STANDING"),
      error: "All players need a name"
    };
  }

  const config: GameConfig = {
    endCondition: draft.endCondition,
    fixedRoundLimit: draft.fixedRoundLimit,
    targetWealth: draft.targetWealth,
    initialCash: draft.initialCash
  };

  const players: Player[] = draft.names.map((name, index) => ({
    id: `p${index + 1}`,
    name: name.trim(),
    cash: draft.initialCash,
    position: 0,
    ownedStationIds: [],
    status: "active"
  }));

  return { players, config, error: null };
}

function createDefaultConfig(mode: EndConditionMode): GameConfig {
  return {
    endCondition: mode,
    fixedRoundLimit: 12,
    targetWealth: 8000,
    initialCash: 1500
  };
}
