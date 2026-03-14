import { describe, expect, test } from "vitest";
import { KEY_STATIONS_PRESET } from "../constants/stations";
import { initialState } from "./initialState";
import { reducer } from "./reducer";

describe("reducer", () => {
  test("uses last player standing as the default end condition", () => {
    expect(initialState.config.endCondition).toBe("LAST_PLAYER_STANDING");
  });

  test("rejects BUY_STATION when tile is already owned", () => {
    const occupiedBoard = KEY_STATIONS_PRESET.map((tile, index) =>
      index === 0 ? { ...tile, ownerId: "p2" } : tile
    );
    const state = {
      ...initialState,
      board: occupiedBoard,
      phase: "resolve_tile" as const,
      players: [
        { ...initialState.players[0], position: 0, cash: 1000, ownedStationIds: [] },
        initialState.players[1]
      ]
    };

    const next = reducer(state, { type: "BUY_STATION" });
    expect(next.pendingMessage).toBe("Tile already owned");
    expect(next.players[0].cash).toBe(1000);
  });

  test("applies ROLL_DICE movement and updates phase", () => {
    const next = reducer(initialState, { type: "ROLL_DICE", payload: { value: 4 } });
    expect(next.players[0].position).toBe(4);
    expect(next.lastDiceRoll).toBe(4);
    expect(next.phase).toBe("resolve_tile");
  });

  test("END_TURN advances turn and increments round when cycling", () => {
    const afterFirst = reducer(
      { ...initialState, phase: "turn_end" as const },
      { type: "END_TURN" }
    );
    const afterSecond = reducer({ ...afterFirst, phase: "turn_end" as const }, { type: "END_TURN" });
    expect(afterSecond.turnIndex).toBe(0);
    expect(afterSecond.round).toBe(initialState.round + 1);
  });
});
