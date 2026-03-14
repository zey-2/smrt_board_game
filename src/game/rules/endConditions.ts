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

interface ScoredPlayer {
  id: string;
  netWorth: number;
}

export interface EndConditionResolution {
  isComplete: boolean;
  winnerId: string | null;
}

const INCOMPLETE_RESULT: EndConditionResolution = {
  isComplete: false,
  winnerId: null
};

export function resolveHighestNetWorthOutcome(
  players: ScoredPlayer[]
): EndConditionResolution {
  if (players.length === 0) {
    return { isComplete: true, winnerId: null };
  }

  const richestNetWorth = Math.max(...players.map((player) => player.netWorth));
  const leaders = players.filter((player) => player.netWorth === richestNetWorth);

  return {
    isComplete: true,
    winnerId: leaders.length === 1 ? leaders[0].id : null
  };
}

export function evaluateEndCondition(
  mode: EndConditionMode,
  state: EvalState,
  config: EvalConfig = {}
): EndConditionResolution {
  if (mode === "LAST_PLAYER_STANDING") {
    const activePlayers = state.players.filter((player) => player.status === "active");
    if (activePlayers.length === 1) {
      return { isComplete: true, winnerId: activePlayers[0].id };
    }

    if (activePlayers.length === 0) {
      return { isComplete: true, winnerId: null };
    }

    return INCOMPLETE_RESULT;
  }

  if (mode === "FIXED_ROUNDS") {
    const fixedRoundLimit = config.fixedRoundLimit ?? 12;
    if (state.round < fixedRoundLimit) {
      return INCOMPLETE_RESULT;
    }

    return resolveHighestNetWorthOutcome(state.players);
  }

  const targetWealth = config.targetWealth ?? 8000;
  const winner = state.players.find((player) => player.netWorth >= targetWealth);
  return winner
    ? { isComplete: true, winnerId: winner.id }
    : INCOMPLETE_RESULT;
}
