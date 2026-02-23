import { calculateNetWorth, buyStation } from "../rules/economy";
import { evaluateEndCondition } from "../rules/endConditions";
import { movePosition } from "../rules/movement";
import type { Player } from "../types";
import type { GameAction } from "./actions";
import type { GameState } from "../types";

const APP_LOG_LIMIT = 200;

function getPlayerNetWorth(player: Player, state: GameState): number {
  const assets = player.ownedStationIds
    .map((stationId) => state.board.find((station) => station.id === stationId)?.price ?? 0);
  return calculateNetWorth(player.cash, assets);
}

function maybeResolveWinner(state: GameState): string | null {
  const enrichedPlayers = state.players.map((player) => ({
    id: player.id,
    status: player.status,
    netWorth: getPlayerNetWorth(player, state)
  }));
  return evaluateEndCondition(
    state.config.endCondition,
    { players: enrichedPlayers, round: state.round },
    {
      fixedRoundLimit: state.config.fixedRoundLimit,
      targetWealth: state.config.targetWealth
    }
  );
}

function withLog(state: GameState, logLine: string): GameState {
  const nextLog = [...state.actionLog, logLine];
  return {
    ...state,
    actionLog: nextLog.slice(Math.max(0, nextLog.length - APP_LOG_LIMIT))
  };
}

export function reducer(state: GameState, action: GameAction): GameState {
  if (state.phase === "completed" && action.type !== "START_GAME") {
    return state;
  }

  if (action.type === "START_GAME") {
    return {
      ...state,
      config: action.payload.config,
      players: action.payload.players,
      turnIndex: 0,
      round: 1,
      phase: "roll",
      pendingMessage: null,
      winnerId: null,
      actionLog: ["Game started"]
    };
  }

  if (action.type === "SET_END_CONDITION") {
    return {
      ...state,
      config: {
        ...state.config,
        endCondition: action.payload.mode
      }
    };
  }

  if (action.type === "SET_PHASE") {
    return { ...state, phase: action.payload.phase };
  }

  if (action.type === "ROLL_DICE") {
    if (state.phase !== "roll") return { ...state, pendingMessage: "Cannot roll at this phase" };
    const currentPlayer = state.players[state.turnIndex];
    if (!currentPlayer || currentPlayer.status === "bankrupt") {
      return { ...state, pendingMessage: "Current player is bankrupt" };
    }

    const nextPosition = movePosition(
      currentPlayer.position,
      action.payload.value,
      state.board.length
    );
    const players = [...state.players];
    players[state.turnIndex] = { ...currentPlayer, position: nextPosition };
    return withLog(
      {
        ...state,
        players,
        lastDiceRoll: action.payload.value,
        phase: "resolve_tile",
        pendingMessage: null
      },
      `${currentPlayer.name} rolled ${action.payload.value}`
    );
  }

  if (action.type === "BUY_STATION") {
    if (state.phase !== "resolve_tile") {
      return { ...state, pendingMessage: "Cannot buy at this phase" };
    }

    const player = state.players[state.turnIndex];
    const tile = state.board[player.position];
    const result = buyStation(
      { id: player.id, cash: player.cash, ownedStationIds: player.ownedStationIds },
      { id: tile.id, ownerId: tile.ownerId, price: tile.price }
    );

    if (!result.ok) {
      return { ...state, pendingMessage: result.reason };
    }

    const players = [...state.players];
    players[state.turnIndex] = {
      ...player,
      cash: result.player.cash,
      ownedStationIds: result.player.ownedStationIds
    };

    const board = [...state.board];
    board[player.position] = {
      ...tile,
      ownerId: result.tile.ownerId
    };

    const nextState = withLog(
      {
        ...state,
        players,
        board,
        phase: "turn_end",
        pendingMessage: `${player.name} purchased ${tile.name}`
      },
      `${player.name} bought ${tile.name}`
    );

    const winnerId = maybeResolveWinner(nextState);
    return winnerId
      ? { ...nextState, winnerId, phase: "completed", pendingMessage: "Game over" }
      : nextState;
  }

  if (action.type === "SKIP_PURCHASE") {
    if (state.phase !== "resolve_tile") return state;
    return withLog(
      {
        ...state,
        phase: "turn_end",
        pendingMessage: "Purchase skipped"
      },
      `${state.players[state.turnIndex].name} skipped purchase`
    );
  }

  if (action.type === "END_TURN") {
    if (state.phase !== "turn_end") {
      return { ...state, pendingMessage: "Cannot end turn at this phase" };
    }

    const nextTurnIndex = (state.turnIndex + 1) % state.players.length;
    const nextRound = nextTurnIndex === 0 ? state.round + 1 : state.round;
    const nextState = withLog(
      {
        ...state,
        turnIndex: nextTurnIndex,
        round: nextRound,
        phase: "roll",
        pendingMessage: null
      },
      `Turn moved to ${state.players[nextTurnIndex].name}`
    );

    const winnerId = maybeResolveWinner(nextState);
    return winnerId ? { ...nextState, winnerId, phase: "completed" } : nextState;
  }

  return state;
}
