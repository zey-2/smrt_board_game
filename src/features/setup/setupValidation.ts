import type { EndConditionMode, GameConfig, Player } from "../../game/types";
import { PLAYER_COLOR_OPTIONS, PLAYER_ICON_OPTIONS } from "../players/playerAppearance";

export interface SetupPlayerDraft {
  name: string;
  iconId: string;
  colorId: string;
}

export interface SetupDraft {
  names?: string[];
  players?: SetupPlayerDraft[];
  mode: GameConfig["mode"];
  endCondition: EndConditionMode;
  initialCash: number;
  timeLimitSeconds: number | null;
  fixedRoundLimit: number;
  targetWealth: number;
}

export interface SetupResult {
  players: Player[];
  config: GameConfig;
  error: string | null;
}

export function validateAndBuildSetup(draft: SetupDraft): SetupResult {
  const draftPlayers =
    draft.players ??
    draft.names?.map((name, index) => ({
      name,
      iconId: PLAYER_ICON_OPTIONS[index]?.id ?? PLAYER_ICON_OPTIONS[0].id,
      colorId: PLAYER_COLOR_OPTIONS[index]?.id ?? PLAYER_COLOR_OPTIONS[0].id
    })) ??
    [];

  if (draftPlayers.length < 2 || draftPlayers.length > 4) {
    return {
      players: [],
      config: createDefaultConfig("LAST_PLAYER_STANDING"),
      error: "Player count must be 2-4"
    };
  }

  if (draftPlayers.some((player) => player.name.trim().length === 0)) {
    return {
      players: [],
      config: createDefaultConfig("LAST_PLAYER_STANDING"),
      error: "All players need a name"
    };
  }

  const appearancePairs = new Set(
    draftPlayers.map((player) => `${player.iconId}:${player.colorId}`)
  );

  if (appearancePairs.size !== draftPlayers.length) {
    return {
      players: [],
      config: createDefaultConfig("LAST_PLAYER_STANDING"),
      error: "Each player needs a unique icon and background colour combination"
    };
  }

  const config: GameConfig = {
    mode: draft.mode,
    endCondition: draft.endCondition,
    fixedRoundLimit: draft.fixedRoundLimit,
    timeLimitSeconds: draft.timeLimitSeconds,
    targetWealth: draft.targetWealth,
    initialCash: draft.initialCash
  };

  const players: Player[] = draftPlayers.map((player, index) => ({
    id: `p${index + 1}`,
    name: player.name.trim(),
    iconId: player.iconId,
    colorId: player.colorId,
    cash: draft.initialCash,
    position: 0,
    ownedStationIds: [],
    status: "active"
  }));

  return { players, config, error: null };
}

function createDefaultConfig(endCondition: EndConditionMode): GameConfig {
  return {
    mode: "CLASSIC",
    endCondition,
    fixedRoundLimit: 12,
    timeLimitSeconds: null,
    targetWealth: 8000,
    initialCash: 1500
  };
}
