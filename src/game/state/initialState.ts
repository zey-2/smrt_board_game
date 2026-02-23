import { KEY_STATIONS_PRESET } from "../constants/stations";
import type { GameConfig, GameState, Player } from "../types";

const DEFAULT_CONFIG: GameConfig = {
  endCondition: "FIXED_ROUNDS",
  fixedRoundLimit: 12,
  targetWealth: 8000,
  initialCash: 1500
};

const DEFAULT_PLAYERS: Player[] = [
  {
    id: "p1",
    name: "Player 1",
    cash: 1500,
    position: 0,
    ownedStationIds: [],
    status: "active"
  },
  {
    id: "p2",
    name: "Player 2",
    cash: 1500,
    position: 0,
    ownedStationIds: [],
    status: "active"
  }
];

export function createGameState(players = DEFAULT_PLAYERS, config = DEFAULT_CONFIG): GameState {
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
