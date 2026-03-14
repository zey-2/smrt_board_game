import { KEY_STATIONS_PRESET } from "../constants/stations";
import { getRandomDogBreedNames } from "../defaultPlayerNames";
import type { GameConfig, GameState, Player } from "../types";
import { PLAYER_COLOR_OPTIONS, PLAYER_ICON_OPTIONS } from "../../features/players/playerAppearance";

declare module "../types" {
  interface GameState {
    remainingTimeMs: number | null;
  }
}

const DEFAULT_CONFIG: GameConfig = {
  mode: "CLASSIC",
  endCondition: "LAST_PLAYER_STANDING",
  fixedRoundLimit: 12,
  timeLimitSeconds: null,
  targetWealth: 8000,
  initialCash: 1500
};

function getInitialRemainingTimeMs(config: GameConfig): number | null {
  return config.timeLimitSeconds === null ? null : config.timeLimitSeconds * 1000;
}

function createDefaultPlayers(): Player[] {
  return getRandomDogBreedNames(2).map((name, index) => ({
    id: `p${index + 1}`,
    name,
    iconId: PLAYER_ICON_OPTIONS[index]?.id ?? PLAYER_ICON_OPTIONS[0].id,
    colorId: PLAYER_COLOR_OPTIONS[index]?.id ?? PLAYER_COLOR_OPTIONS[0].id,
    cash: 1500,
    position: 0,
    ownedStationIds: [],
    status: "active"
  }));
}

export function createGameState(players = createDefaultPlayers(), config = DEFAULT_CONFIG): GameState {
  return {
    config,
    players,
    board: KEY_STATIONS_PRESET.map((station) => ({ ...station })),
    turnIndex: 0,
    round: 1,
    lastDiceRoll: null,
    phase: "roll",
    pendingMessage: null,
    winnerId: null,
    remainingTimeMs: getInitialRemainingTimeMs(config),
    actionLog: []
  };
}

export const initialState: GameState = createGameState();
