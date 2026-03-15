import { describe, expect, test } from "vitest";
import { createGameState } from "../state/initialState";
import { KEY_STATIONS_PRESET } from "./stations";

describe("KEY_STATIONS_PRESET", () => {
  test("has exactly 25 key stations and unique ids", () => {
    expect(KEY_STATIONS_PRESET).toHaveLength(25);
    const ids = new Set(KEY_STATIONS_PRESET.map((station) => station.id));
    expect(ids.size).toBe(KEY_STATIONS_PRESET.length);
  });

  test("remains the full 25-station source of truth for live game state", () => {
    const gameState = createGameState();

    expect(gameState.board).toHaveLength(25);
    expect(gameState.board).not.toHaveLength(24);
    expect(gameState.board.map((station) => station.id)).toEqual(
      KEY_STATIONS_PRESET.map((station) => station.id)
    );
  });

  test("keeps Dhoby Ghaut in the North South line block between Orchard and City Hall", () => {
    const ids = KEY_STATIONS_PRESET.map((station) => station.id);

    expect(ids.slice(7, 14)).toEqual([
      "woodlands",
      "yishun",
      "bishan",
      "orchard",
      "dhoby-ghaut",
      "city-hall",
      "marina-south-pier"
    ]);
  });
});
