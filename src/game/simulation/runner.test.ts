import { describe, expect, test } from "vitest";
import {
  BASELINE_SIMULATION_PRESET,
  CASH_TILE_VARIANT_PRESET
} from "./presets";
import { runSimulationBatch } from "./runner";

describe("runSimulationBatch", () => {
  test("advances each player from their current position across turns", () => {
    const customPreset = {
      id: "position-check",
      label: "Position Check",
      board: [
        { type: "cash" as const, id: "tile-0", name: "Tile 0", reward: 0 },
        { type: "cash" as const, id: "tile-1", name: "Tile 1", reward: 0 },
        { type: "cash" as const, id: "tile-2", name: "Tile 2", reward: 0 },
        { type: "cash" as const, id: "tile-3", name: "Tile 3", reward: 0 }
      ]
    };

    const result = runSimulationBatch({
      preset: customPreset,
      gameCount: 1,
      seed: 20260314,
      playerCount: 2,
      maxTurnsPerGame: 4,
      diceValueProvider: () => 1
    });

    expect(result.tileLandingCounts["tile-1"]).toBe(2);
    expect(result.tileLandingCounts["tile-2"]).toBe(2);
    expect(result.tileLandingCounts["tile-3"]).toBe(0);
  });

  test("is deterministic for the same preset, game count, and seed", () => {
    const first = runSimulationBatch({
      preset: BASELINE_SIMULATION_PRESET,
      gameCount: 50,
      seed: 20260314
    });
    const second = runSimulationBatch({
      preset: BASELINE_SIMULATION_PRESET,
      gameCount: 50,
      seed: 20260314
    });

    expect(second).toEqual(first);
  });

  test("shows cash-tile rewards in the variant but not the baseline", () => {
    const baseline = runSimulationBatch({
      preset: BASELINE_SIMULATION_PRESET,
      gameCount: 50,
      seed: 20260314
    });
    const variant = runSimulationBatch({
      preset: CASH_TILE_VARIANT_PRESET,
      gameCount: 50,
      seed: 20260314
    });

    expect(baseline.totalCashTileAwards).toBe(0);
    expect(variant.totalCashTileAwards).toBeGreaterThan(0);
  });
});
