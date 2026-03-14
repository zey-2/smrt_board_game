import { KEY_STATIONS_PRESET } from "../constants/stations";
import { getRandomDogBreedNames } from "../defaultPlayerNames";
import type { GameConfig, GameState, Player } from "../types";

const DEFAULT_CONFIG: GameConfig = {
  endCondition: "LAST_PLAYER_STANDING",
  fixedRoundLimit: 12,
  targetWealth: 8000,
  initialCash: 1500
};

function createDefaultPlayers(): Player[] {
  return getRandomDogBreedNames(2).map((name, index) => ({
    id: `p${index + 1}`,
    name,
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
    actionLog: []
  };
}

export const initialState: GameState = createGameState();
