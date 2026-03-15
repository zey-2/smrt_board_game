import { calculateNetWorth } from "../rules/economy";
import {
  DEFAULT_INITIAL_CASH,
  DEFAULT_TARGET_WEALTH,
  DEFAULT_TRANSPORT_FARE_RATE
} from "../constants/economyDefaults";
import { evaluateEndCondition } from "../rules/endConditions";
import type { EndConditionResolution } from "../rules/endConditions";
import { movePosition } from "../rules/movement";
import type { EndConditionMode } from "../types";
import { resolveLandingTurn } from "./engine";
import { shouldBuyStation } from "./policy";
import type { PurchasePolicy } from "./policy";
import { createSeededRandom } from "./rng";
import type {
  SimulationPlayer,
  SimulationPreset,
  SimulationStationTile,
  SimulationTile
} from "./types";

const DEFAULT_POLICY: PurchasePolicy = {
  safetyThreshold: 5
};

export interface SimulationConfig {
  endCondition: EndConditionMode;
  fixedRoundLimit: number;
  targetWealth: number;
  initialCash: number;
  transportFareRate: number;
}

const DEFAULT_CONFIG: SimulationConfig = {
  endCondition: "LAST_PLAYER_STANDING",
  fixedRoundLimit: 12,
  targetWealth: DEFAULT_TARGET_WEALTH,
  initialCash: DEFAULT_INITIAL_CASH,
  transportFareRate: DEFAULT_TRANSPORT_FARE_RATE
};

const DEFAULT_PLAYER_COUNT = 2;
const MAX_TURNS_PER_GAME = 5000;

interface RunSimulationBatchInput {
  preset: SimulationPreset;
  gameCount: number;
  seed: number;
  simulationConfig?: Partial<SimulationConfig>;
  playerCount?: number;
  policy?: PurchasePolicy;
  maxTurnsPerGame?: number;
  diceValueProvider?: () => number;
}

export interface SimulationBatchSummary {
  label: string;
  gameCount: number;
  averageRounds: number;
  seatWinCounts: number[];
  totalTies: number;
  averageEndingCash: number;
  averageEndingNetWorth: number;
  totalStationPurchases: number;
  totalTransportFarePayments: number;
  totalBankruptcies: number;
  totalLeadChanges: number;
  tileLandingCounts: Record<string, number>;
  totalCashTileAwards: number;
  totalPurchaseEnablesFromCashTile: number;
}

interface SingleGameSummary {
  winnerSeat: number | null;
  isTie: boolean;
  rounds: number;
  endingCashTotal: number;
  endingNetWorthTotal: number;
  stationPurchases: number;
  transportFarePayments: number;
  bankruptcies: number;
  leadChanges: number;
  tileLandingCounts: Record<string, number>;
  cashTileAwards: number;
  purchaseEnablesFromCashTile: number;
}

function cloneTile(tile: SimulationTile): SimulationTile {
  return tile.type === "cash" ? { ...tile } : { ...tile };
}

function createPlayers(playerCount: number, simulationConfig: SimulationConfig): SimulationPlayer[] {
  return Array.from({ length: playerCount }, (_, index) => ({
    id: `p${index + 1}`,
    cash: simulationConfig.initialCash,
    position: 0,
    status: "active",
    ownedStationIds: []
  }));
}

function createTileLandingCounts(board: SimulationTile[]): Record<string, number> {
  return Object.fromEntries(board.map((tile) => [tile.id, 0]));
}

function getNetWorth(player: SimulationPlayer, board: SimulationTile[]): number {
  const assetValues = player.ownedStationIds.map((stationId) => {
    const tile = board.find((entry) => entry.id === stationId);
    return tile?.type === "station" ? tile.price : 0;
  });

  return calculateNetWorth(player.cash, assetValues);
}

function getUniqueLeaderId(players: SimulationPlayer[], board: SimulationTile[]): string | null {
  const ranked = players
    .map((player) => ({
      id: player.id,
      netWorth: getNetWorth(player, board)
    }))
    .sort((left, right) => right.netWorth - left.netWorth);

  if (ranked.length === 0) {
    return null;
  }

  if (ranked[0].netWorth === ranked[1]?.netWorth) {
    return null;
  }

  return ranked[0].id;
}

function maybeResolveWinner(
  players: SimulationPlayer[],
  board: SimulationTile[],
  round: number,
  simulationConfig: SimulationConfig,
  roundComplete = false
): EndConditionResolution {
  if (simulationConfig.endCondition === "FIXED_ROUNDS" && !roundComplete) {
    return { isComplete: false, winnerId: null };
  }

  return evaluateEndCondition(
    simulationConfig.endCondition,
    {
      players: players.map((player) => ({
        id: player.id,
        status: player.status,
        netWorth: getNetWorth(player, board)
      })),
      round
    },
    {
      fixedRoundLimit: simulationConfig.fixedRoundLimit,
      targetWealth: simulationConfig.targetWealth
    }
  );
}

function getRichestPlayerId(players: SimulationPlayer[], board: SimulationTile[]): string {
  return [...players].sort(
    (left, right) => getNetWorth(right, board) - getNetWorth(left, board)
  )[0].id;
}

function resolveSimulationConfig(
  simulationConfig?: Partial<SimulationConfig>
): SimulationConfig {
  return {
    ...DEFAULT_CONFIG,
    ...simulationConfig
  };
}

function simulateGame(
  preset: SimulationPreset,
  seed: number,
  playerCount: number,
  simulationConfig: SimulationConfig,
  policy: PurchasePolicy,
  maxTurnsPerGame: number,
  diceValueProvider?: () => number
): SingleGameSummary {
  const random = createSeededRandom(seed);
  const board = preset.board.map(cloneTile);
  const players = createPlayers(playerCount, simulationConfig);
  const tileLandingCounts = createTileLandingCounts(board);
  const pendingCashBoosts = new Map<string, number>();

  let turnIndex = 0;
  let round = 1;
  let totalStationPurchases = 0;
  let totalTransportFarePayments = 0;
  let totalBankruptcies = 0;
  let totalLeadChanges = 0;
  let totalCashTileAwards = 0;
  let totalPurchaseEnablesFromCashTile = 0;
  let previousLeaderId = getUniqueLeaderId(players, board);
  let winnerId: string | null = null;
  let isComplete = false;

  for (let turnCount = 0; turnCount < maxTurnsPerGame; turnCount += 1) {
    const currentPlayer = players[turnIndex];

    if (currentPlayer.status === "active") {
      const dieValue = diceValueProvider ? diceValueProvider() : Math.floor(random() * 6) + 1;
      const nextPosition = movePosition(currentPlayer.position, dieValue, board.length);
      const tile = board[nextPosition];
      const activeCashBoost = pendingCashBoosts.get(currentPlayer.id) ?? 0;

      tileLandingCounts[tile.id] += 1;

      const owner =
        tile.type === "station" && tile.ownerId !== null && tile.ownerId !== currentPlayer.id
          ? players.find((player) => player.id === tile.ownerId)
          : undefined;

      const result = resolveLandingTurn({
        player: currentPlayer,
        owner,
        tile,
        travelSteps: dieValue,
        transportFareRate: simulationConfig.transportFareRate,
        policy
      });

      players[turnIndex] = {
        ...players[turnIndex],
        ...result.player,
        position: nextPosition
      };

      if (result.owner) {
        const ownerIndex = players.findIndex((player) => player.id === result.owner?.id);
        if (ownerIndex >= 0) {
          players[ownerIndex] = {
            ...players[ownerIndex],
            ...result.owner
          };
        }
      }

      if (tile.type === "station") {
        board[nextPosition] = result.tile as SimulationStationTile;
      }

      totalStationPurchases += result.metrics.stationPurchases;
      totalTransportFarePayments += result.metrics.transportFarePayments;
      totalBankruptcies += result.metrics.bankruptcies;
      totalCashTileAwards += result.metrics.cashTileAwards;

      if (
        activeCashBoost > 0 &&
        tile.type === "station" &&
        tile.ownerId === null &&
        result.metrics.stationPurchases === 1 &&
        !shouldBuyStation(currentPlayer.cash - activeCashBoost, tile.price, policy)
      ) {
        totalPurchaseEnablesFromCashTile += 1;
      }

      if (activeCashBoost > 0) {
        pendingCashBoosts.delete(currentPlayer.id);
      }

      if (tile.type === "cash" && result.metrics.cashTileAwards === 1) {
        pendingCashBoosts.set(currentPlayer.id, tile.reward);
      }

      const resolution = maybeResolveWinner(players, board, round, simulationConfig);
      winnerId = resolution.winnerId;
      const leaderId = getUniqueLeaderId(players, board);
      if (previousLeaderId && leaderId && previousLeaderId !== leaderId) {
        totalLeadChanges += 1;
      }
      previousLeaderId = leaderId;

      if (resolution.isComplete) {
        isComplete = true;
        break;
      }
    }

    turnIndex = (turnIndex + 1) % players.length;
    if (turnIndex === 0) {
      const resolution = maybeResolveWinner(players, board, round, simulationConfig, true);
      winnerId = resolution.winnerId;
      if (resolution.isComplete) {
        isComplete = true;
        break;
      }

      round += 1;
    }
  }

  const finalWinnerId = isComplete ? winnerId : getRichestPlayerId(players, board);

  return {
    winnerSeat:
      finalWinnerId === null
        ? null
        : players.findIndex((player) => player.id === finalWinnerId),
    isTie: isComplete && finalWinnerId === null,
    rounds: round,
    endingCashTotal: players.reduce((sum, player) => sum + player.cash, 0),
    endingNetWorthTotal: players.reduce((sum, player) => sum + getNetWorth(player, board), 0),
    stationPurchases: totalStationPurchases,
    transportFarePayments: totalTransportFarePayments,
    bankruptcies: totalBankruptcies,
    leadChanges: totalLeadChanges,
    tileLandingCounts,
    cashTileAwards: totalCashTileAwards,
    purchaseEnablesFromCashTile: totalPurchaseEnablesFromCashTile
  };
}

export function runSimulationBatch(input: RunSimulationBatchInput): SimulationBatchSummary {
  const playerCount = input.playerCount ?? DEFAULT_PLAYER_COUNT;
  const simulationConfig = resolveSimulationConfig(input.simulationConfig);
  const policy = input.policy ?? DEFAULT_POLICY;
  const maxTurnsPerGame = input.maxTurnsPerGame ?? MAX_TURNS_PER_GAME;
  const seatWinCounts = Array.from({ length: playerCount }, () => 0);
  const tileLandingCounts = createTileLandingCounts(input.preset.board);

  let totalRounds = 0;
  let totalTies = 0;
  let totalEndingCash = 0;
  let totalEndingNetWorth = 0;
  let totalStationPurchases = 0;
  let totalTransportFarePayments = 0;
  let totalBankruptcies = 0;
  let totalLeadChanges = 0;
  let totalCashTileAwards = 0;
  let totalPurchaseEnablesFromCashTile = 0;

  for (let gameIndex = 0; gameIndex < input.gameCount; gameIndex += 1) {
    const summary = simulateGame(
      input.preset,
      input.seed + gameIndex,
      playerCount,
      simulationConfig,
      policy,
      maxTurnsPerGame,
      input.diceValueProvider
    );

    if (summary.isTie) {
      totalTies += 1;
    } else if (summary.winnerSeat !== null) {
      seatWinCounts[summary.winnerSeat] += 1;
    }

    totalRounds += summary.rounds;
    totalEndingCash += summary.endingCashTotal;
    totalEndingNetWorth += summary.endingNetWorthTotal;
    totalStationPurchases += summary.stationPurchases;
    totalTransportFarePayments += summary.transportFarePayments;
    totalBankruptcies += summary.bankruptcies;
    totalLeadChanges += summary.leadChanges;
    totalCashTileAwards += summary.cashTileAwards;
    totalPurchaseEnablesFromCashTile += summary.purchaseEnablesFromCashTile;

    for (const [tileId, count] of Object.entries(summary.tileLandingCounts)) {
      tileLandingCounts[tileId] += count;
    }
  }

  return {
    label: input.preset.label,
    gameCount: input.gameCount,
    averageRounds: totalRounds / input.gameCount,
    seatWinCounts,
    totalTies,
    averageEndingCash: totalEndingCash / (input.gameCount * playerCount),
    averageEndingNetWorth: totalEndingNetWorth / (input.gameCount * playerCount),
    totalStationPurchases,
    totalTransportFarePayments,
    totalBankruptcies,
    totalLeadChanges,
    tileLandingCounts,
    totalCashTileAwards,
    totalPurchaseEnablesFromCashTile
  };
}
