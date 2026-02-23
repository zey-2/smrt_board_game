import type { EndConditionMode } from "../types";

interface EvalPlayer {
  id: string;
  status: "active" | "bankrupt";
  netWorth: number;
}

interface EvalState {
  players: EvalPlayer[];
  round: number;
}

interface EvalConfig {
  fixedRoundLimit?: number;
  targetWealth?: number;
}

export function evaluateEndCondition(
  mode: EndConditionMode,
  state: EvalState,
  config: EvalConfig = {}
): string | null {
  if (mode === "LAST_PLAYER_STANDING") {
    const activePlayers = state.players.filter((player) => player.status === "active");
    return activePlayers.length === 1 ? activePlayers[0].id : null;
  }

  if (mode === "FIXED_ROUNDS") {
    const fixedRoundLimit = config.fixedRoundLimit ?? 12;
    if (state.round < fixedRoundLimit) return null;
    const sorted = [...state.players].sort((a, b) => b.netWorth - a.netWorth);
    return sorted[0]?.id ?? null;
  }

  const targetWealth = config.targetWealth ?? 8000;
  const winner = state.players.find((player) => player.netWorth >= targetWealth);
  return winner?.id ?? null;
}
