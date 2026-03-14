import {
  buyStation,
  calculateTransportFare,
  payTransportFare
} from "../rules/economy";
import { shouldBuyStation } from "./policy";
import type { PurchasePolicy } from "./policy";
import type {
  SimulationMetricDelta,
  SimulationPlayer,
  SimulationStationTile,
  SimulationTile
} from "./types";

export interface ResolveLandingTurnInput {
  player: SimulationPlayer;
  tile: SimulationTile;
  owner?: SimulationPlayer;
  travelSteps?: number;
  transportFareRate?: number;
  policy: PurchasePolicy;
}

export interface ResolveLandingTurnResult {
  player: SimulationPlayer;
  owner?: SimulationPlayer;
  tile: SimulationTile;
  metrics: SimulationMetricDelta;
}

function createEmptyMetrics(): SimulationMetricDelta {
  return {
    stationPurchases: 0,
    transportFarePayments: 0,
    bankruptcies: 0,
    cashTileAwards: 0
  };
}

function resolveStationLanding(
  input: ResolveLandingTurnInput,
  tile: SimulationStationTile
): ResolveLandingTurnResult {
  const metrics = createEmptyMetrics();

  if (tile.ownerId === null && shouldBuyStation(input.player.cash, tile.price, input.policy)) {
    const result = buyStation(input.player, tile);

    if (!result.ok) {
      return {
        player: input.player,
        owner: input.owner,
        tile,
        metrics
      };
    }

    return {
      player: result.player,
      owner: input.owner,
      tile: result.tile,
      metrics: {
        ...metrics,
        stationPurchases: 1
      }
    };
  }

  if (tile.ownerId !== null && tile.ownerId !== input.player.id) {
    if (!input.owner) {
      throw new Error(`Missing owner for tile ${tile.id}`);
    }

    if (input.travelSteps === undefined) {
      throw new Error(`Missing travel steps for tile ${tile.id}`);
    }

    if (input.transportFareRate === undefined) {
      throw new Error(`Missing transport fare rate for tile ${tile.id}`);
    }

    const fare = calculateTransportFare(input.travelSteps, input.transportFareRate);
    const result = payTransportFare(input.player, input.owner, fare);
    return {
      player: result.payer,
      owner: result.owner,
      tile,
      metrics: {
        ...metrics,
        transportFarePayments: 1,
        bankruptcies: result.payer.status === "bankrupt" ? 1 : 0
      }
    };
  }

  return {
    player: input.player,
    owner: input.owner,
    tile,
    metrics
  };
}

export function resolveLandingTurn(
  input: ResolveLandingTurnInput
): ResolveLandingTurnResult {
  if (input.tile.type === "cash") {
    return {
      player: {
        ...input.player,
        cash: input.player.cash + input.tile.reward
      },
      owner: input.owner,
      tile: input.tile,
      metrics: {
        ...createEmptyMetrics(),
        cashTileAwards: 1
      }
    };
  }

  return resolveStationLanding(input, input.tile);
}
