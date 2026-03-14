import { KEY_STATIONS_PRESET } from "../constants/stations";
import type {
  SimulationCashTile,
  SimulationPreset,
  SimulationStationTile
} from "./types";

function createStationTiles(): SimulationStationTile[] {
  return KEY_STATIONS_PRESET.map((tile) => ({
    type: "station",
    id: tile.id,
    name: tile.name,
    price: tile.price,
    baseRent: tile.baseRent,
    ownerId: tile.ownerId
  }));
}

const CASH_TOP_UP_TILE: SimulationCashTile = {
  type: "cash",
  id: "cash-top-up",
  name: "Cash Top-Up",
  reward: 500
};

export const BASELINE_SIMULATION_PRESET: SimulationPreset = {
  id: "baseline",
  label: "Baseline",
  board: createStationTiles()
};

export const CASH_TILE_VARIANT_PRESET: SimulationPreset = {
  id: "cash-tile-variant",
  label: "Cash Tile Variant",
  board: createStationTiles().map((tile) =>
    tile.id === "choa-chu-kang-lrt" ? CASH_TOP_UP_TILE : tile
  )
};
