import { describe, expect, test } from "vitest";
import { KEY_STATIONS_PRESET } from "../constants/stations";
import { createGameState, initialState } from "./initialState";
import { reducer } from "./reducer";
import type { GameState } from "../types";

function createFixedRoundState({
  fixedRoundLimit,
  cashByPlayer
}: {
  fixedRoundLimit: number;
  cashByPlayer: [number, number];
}) {
  return {
    ...createGameState(
      [
        { ...initialState.players[0], id: "p1", name: "Player 1", cash: cashByPlayer[0] },
        { ...initialState.players[1], id: "p2", name: "Player 2", cash: cashByPlayer[1] }
      ],
      {
        ...initialState.config,
        endCondition: "FIXED_ROUNDS",
        fixedRoundLimit
      }
    ),
    phase: "turn_end" as const
  };
}

function endTurn(state: GameState) {
  return reducer({ ...state, phase: "turn_end" as const }, { type: "END_TURN" });
}

function createTimedState(cashByPlayer: [number, number]) {
  return createGameState(
    [
      { ...initialState.players[0], id: "p1", name: "Player 1", cash: cashByPlayer[0] },
      { ...initialState.players[1], id: "p2", name: "Player 2", cash: cashByPlayer[1] }
    ],
    {
      ...initialState.config,
      mode: "TIMED",
      timeLimitSeconds: 600,
      endCondition: "LAST_PLAYER_STANDING"
    }
  );
}

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

  test("fixed-round games complete only after the capped round is fully played", () => {
    const start = createFixedRoundState({
      fixedRoundLimit: 2,
      cashByPlayer: [1400, 1600]
    });

    const afterFirstTurn = endTurn(start);
    expect(afterFirstTurn.phase).toBe("roll");
    expect(afterFirstTurn.round).toBe(1);
    expect(afterFirstTurn.winnerId).toBeNull();

    const afterRoundOne = endTurn(afterFirstTurn);
    expect(afterRoundOne.phase).toBe("roll");
    expect(afterRoundOne.round).toBe(2);
    expect(afterRoundOne.winnerId).toBeNull();

    const afterThirdTurn = endTurn(afterRoundOne);
    expect(afterThirdTurn.phase).toBe("roll");
    expect(afterThirdTurn.round).toBe(2);
    expect(afterThirdTurn.winnerId).toBeNull();

    const completed = endTurn(afterThirdTurn);
    expect(completed.phase).toBe("completed");
    expect(completed.round).toBe(2);
    expect(completed.winnerId).toBe("p2");
  });

  test("fixed-round ties complete the game without assigning a winner", () => {
    const start = createFixedRoundState({
      fixedRoundLimit: 1,
      cashByPlayer: [1500, 1500]
    });

    const afterFirstTurn = endTurn(start);
    expect(afterFirstTurn.phase).toBe("roll");
    expect(afterFirstTurn.winnerId).toBeNull();

    const completed = endTurn(afterFirstTurn);
    expect(completed.phase).toBe("completed");
    expect(completed.round).toBe(1);
    expect(completed.winnerId).toBeNull();
  });

  test("decrements remaining time in timed mode", () => {
    const timedState = createTimedState([1500, 1500]);
    const next = reducer(
      { ...timedState, remainingTimeMs: 600000 },
      { type: "TICK_TIMER", payload: { elapsedMs: 1000 } } as never
    ) as GameState & { remainingTimeMs: number | null };

    expect(next.remainingTimeMs).toBe(599000);
    expect(next.phase).toBe("roll");
  });

  test("completes timed games on timeout using highest net worth", () => {
    const timedState = createTimedState([1200, 1800]);
    const next = reducer(
      { ...timedState, remainingTimeMs: 500 },
      { type: "TICK_TIMER", payload: { elapsedMs: 1000 } } as never
    ) as GameState & { remainingTimeMs: number | null };

    expect(next.phase).toBe("completed");
    expect(next.winnerId).toBe("p2");
    expect(next.remainingTimeMs).toBe(0);
  });

  test("completes timed games as draws on tied net worth", () => {
    const timedState = createTimedState([1500, 1500]);
    const next = reducer(
      { ...timedState, remainingTimeMs: 250 },
      { type: "TICK_TIMER", payload: { elapsedMs: 1000 } } as never
    ) as GameState & { remainingTimeMs: number | null };

    expect(next.phase).toBe("completed");
    expect(next.winnerId).toBeNull();
    expect(next.pendingMessage).toBe("Game ended in a draw");
  });
});
