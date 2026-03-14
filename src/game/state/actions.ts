import type { EndConditionMode, GameConfig, Player } from "../types";

export type GameAction =
  | { type: "START_GAME"; payload: { players: Player[]; config: GameConfig } }
  | { type: "ROLL_DICE"; payload: { value: number } }
  | { type: "BUY_STATION" }
  | { type: "SKIP_PURCHASE" }
  | { type: "END_TURN" }
  | { type: "TICK_TIMER"; payload: { elapsedMs: number } }
  | { type: "SET_PHASE"; payload: { phase: "roll" | "resolve_tile" | "turn_end" | "completed" } }
  | { type: "SET_END_CONDITION"; payload: { mode: EndConditionMode } };
