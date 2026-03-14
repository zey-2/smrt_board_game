export type SmrtLine = "NSL" | "EWL" | "CCL" | "TEL" | "BPLRT";

export type EndConditionMode =
  | "LAST_PLAYER_STANDING"
  | "FIXED_ROUNDS"
  | "TARGET_WEALTH";

export interface StationTile {
  id: string;
  name: string;
  line: SmrtLine;
  price: number;
  baseRent: number;
  group: string;
  ownerId: string | null;
}

export interface Player {
  id: string;
  name: string;
  iconId: string;
  colorId: string;
  cash: number;
  position: number;
  ownedStationIds: string[];
  status: "active" | "bankrupt";
}

export interface GameConfig {
  mode: "CLASSIC" | "TIMED" | "FIXED_ROUNDS";
  endCondition: EndConditionMode;
  fixedRoundLimit: number;
  timeLimitSeconds: number | null;
  targetWealth: number;
  initialCash: number;
  transportFareRate: number;
}

export interface GameState {
  config: GameConfig;
  players: Player[];
  board: StationTile[];
  turnIndex: number;
  round: number;
  lastDiceRoll: number | null;
  phase: "setup" | "roll" | "resolve_tile" | "turn_end" | "completed";
  pendingMessage: string | null;
  winnerId: string | null;
  remainingTimeMs: number | null;
  actionLog: string[];
}
