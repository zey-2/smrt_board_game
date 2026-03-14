import { describe, expect, test } from "vitest";
import {
  BASELINE_SIMULATION_PRESET,
  CASH_TILE_VARIANT_PRESET
} from "./presets";

describe("simulation presets", () => {
  test("keeps the baseline board unchanged and swaps choa chu kang lrt for a 500-dollar cash tile in the variant", () => {
    const baselineTile = BASELINE_SIMULATION_PRESET.board.find(
      (tile) => tile.id === "choa-chu-kang-lrt"
    );
    expect(baselineTile).toMatchObject({
      type: "station",
      name: "Choa Chu Kang LRT"
    });

    const variantStation = CASH_TILE_VARIANT_PRESET.board.find(
      (tile) => tile.id === "choa-chu-kang-lrt"
    );
    expect(variantStation).toBeUndefined();

    const variantCashTile = CASH_TILE_VARIANT_PRESET.board.find(
      (tile) => tile.id === "cash-top-up"
    );
    expect(variantCashTile).toMatchObject({
      type: "cash",
      name: "Cash Top-Up",
      reward: 500
    });
    expect(CASH_TILE_VARIANT_PRESET.board).toHaveLength(
      BASELINE_SIMULATION_PRESET.board.length
    );
  });
});
