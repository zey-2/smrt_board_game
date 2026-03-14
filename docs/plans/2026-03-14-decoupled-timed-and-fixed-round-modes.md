# Decoupled Timed And Fixed-Round Modes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Decouple real timed mode from fixed-round mode so players can explicitly choose `Classic`, `Timed`, or `Fixed rounds`, with timed games ending by elapsed wall-clock time while the live game screen is active and fixed rounds remaining a separate deterministic rules mode.

**Architecture:** Add an explicit player-facing `mode` to game config, keep `endCondition` as an internal rules helper for classic and fixed-round paths, and introduce persisted `remainingTimeMs` for timed games. Replace the overloaded setup `Game length` preset UI with a mode selector plus conditional `Time limit` or `Round limit`, and retarget simulation analysis to fixed-round presets instead of faux timed labels.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, localStorage persistence, Node CLI

---

### Task 1: Add explicit game modes, setup option constants, and config building

**Files:**
- Create: `src/game/constants/gameModeOptions.ts`
- Create: `src/game/constants/gameModeOptions.test.ts`
- Modify: `src/game/types.ts`
- Modify: `src/game/state/initialState.ts`
- Modify: `src/features/setup/setupValidation.ts`
- Modify: `src/game/constants/gameLengthPresets.ts`

**Step 1: Write the failing mode-options test**

Create `src/game/constants/gameModeOptions.test.ts` with coverage like:

```ts
import { describe, expect, test } from "vitest";
import {
  DEFAULT_FIXED_ROUND_OPTION_ID,
  DEFAULT_GAME_MODE_ID,
  DEFAULT_TIMED_MODE_OPTION_ID,
  FIXED_ROUND_OPTIONS,
  GAME_MODE_OPTIONS,
  TIMED_MODE_OPTIONS,
  buildGameConfigFromModeSelection
} from "./gameModeOptions";

describe("gameModeOptions", () => {
  test("exposes explicit classic, timed, and fixed-round setup modes", () => {
    expect(DEFAULT_GAME_MODE_ID).toBe("TIMED");
    expect(DEFAULT_TIMED_MODE_OPTION_ID).toBe("MINUTES_20");
    expect(DEFAULT_FIXED_ROUND_OPTION_ID).toBe("ROUNDS_12");
    expect(GAME_MODE_OPTIONS.map((option) => option.id)).toEqual([
      "CLASSIC",
      "TIMED",
      "FIXED_ROUNDS"
    ]);
    expect(TIMED_MODE_OPTIONS.map((option) => option.id)).toEqual([
      "MINUTES_10",
      "MINUTES_15",
      "MINUTES_20",
      "MINUTES_30"
    ]);
    expect(FIXED_ROUND_OPTIONS.map((option) => option.id)).toEqual([
      "ROUNDS_6",
      "ROUNDS_9",
      "ROUNDS_12",
      "ROUNDS_18"
    ]);
  });

  test("builds classic, timed, and fixed-round configs explicitly", () => {
    expect(buildGameConfigFromModeSelection({
      modeId: "CLASSIC"
    })).toMatchObject({
      mode: "CLASSIC",
      endCondition: "LAST_PLAYER_STANDING",
      timeLimitSeconds: null,
      fixedRoundLimit: 12
    });

    expect(buildGameConfigFromModeSelection({
      modeId: "TIMED",
      timedOptionId: "MINUTES_20"
    })).toMatchObject({
      mode: "TIMED",
      endCondition: "LAST_PLAYER_STANDING",
      timeLimitSeconds: 1200,
      fixedRoundLimit: 12
    });

    expect(buildGameConfigFromModeSelection({
      modeId: "FIXED_ROUNDS",
      fixedRoundOptionId: "ROUNDS_9"
    })).toMatchObject({
      mode: "FIXED_ROUNDS",
      endCondition: "FIXED_ROUNDS",
      timeLimitSeconds: null,
      fixedRoundLimit: 9
    });
  });
});
```

**Step 2: Run the new mode-options test to verify it fails**

Run: `npm run test -- src/game/constants/gameModeOptions.test.ts`
Expected: FAIL because the explicit mode-options module does not exist yet.

**Step 3: Write the minimal implementation**

Create `src/game/constants/gameModeOptions.ts` with:

- `GameModeId = "CLASSIC" | "TIMED" | "FIXED_ROUNDS"`
- `TimedModeOptionId = "MINUTES_10" | "MINUTES_15" | "MINUTES_20" | "MINUTES_30"`
- `FixedRoundOptionId = "ROUNDS_6" | "ROUNDS_9" | "ROUNDS_12" | "ROUNDS_18"`
- `GAME_MODE_OPTIONS`, `TIMED_MODE_OPTIONS`, `FIXED_ROUND_OPTIONS`
- defaults:
  - `DEFAULT_GAME_MODE_ID = "TIMED"`
  - `DEFAULT_TIMED_MODE_OPTION_ID = "MINUTES_20"`
  - `DEFAULT_FIXED_ROUND_OPTION_ID = "ROUNDS_12"`
- `buildGameConfigFromModeSelection(...)`

The config builder should return a `GameConfig` with:

```ts
{
  mode,
  endCondition,
  timeLimitSeconds,
  fixedRoundLimit,
  targetWealth: 8000,
  initialCash: 1500
}
```

Update `src/game/types.ts` so `GameConfig` becomes:

```ts
export interface GameConfig {
  mode: "CLASSIC" | "TIMED" | "FIXED_ROUNDS";
  endCondition: EndConditionMode;
  fixedRoundLimit: number;
  timeLimitSeconds: number | null;
  targetWealth: number;
  initialCash: number;
}
```

Update `src/game/state/initialState.ts` to include the new `mode` and `timeLimitSeconds` fields in the default config.

Update `src/features/setup/setupValidation.ts` so the setup draft accepts:

```ts
mode: GameConfig["mode"];
timeLimitSeconds: number | null;
fixedRoundLimit: number;
endCondition: EndConditionMode;
```

and copies all four values into the built `GameConfig`.

Temporarily update `src/game/constants/gameLengthPresets.ts` into a compatibility wrapper so the branch still compiles until later tasks move its callsites. It should use `buildGameConfigFromModeSelection` internally and return configs with the new `mode` and `timeLimitSeconds` fields populated.

**Step 4: Run the new and affected tests to verify they pass**

Run: `npm run test -- src/game/constants/gameModeOptions.test.ts src/game/constants/gameLengthPresets.test.ts`
Expected: PASS with the new explicit mode model in place and the compatibility wrapper still green.

**Step 5: Commit**

```bash
git add src/game/constants/gameModeOptions.ts src/game/constants/gameModeOptions.test.ts src/game/types.ts src/game/state/initialState.ts src/features/setup/setupValidation.ts src/game/constants/gameLengthPresets.ts
git commit -m "feat: add explicit game mode configuration"
```

### Task 2: Replace the setup game-length selector with explicit mode and secondary controls

**Files:**
- Modify: `src/features/setup/SetupScreen.tsx`
- Modify: `src/features/setup/SetupScreen.test.tsx`

**Step 1: Write the failing setup tests**

Update `src/features/setup/SetupScreen.test.tsx` with focused coverage like:

```ts
test("defaults to timed mode with a 20-minute limit", async () => {
  const onStart = vi.fn();
  const user = userEvent.setup();
  render(<SetupScreen onStart={onStart} />);

  expect(screen.getByLabelText("Mode")).toHaveValue("TIMED");
  expect(screen.getByLabelText("Time limit")).toHaveValue("MINUTES_20");
  expect(screen.queryByLabelText("Round limit")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Start Game" }));

  expect(onStart.mock.calls[0][0].config).toMatchObject({
    mode: "TIMED",
    timeLimitSeconds: 1200
  });
});

test("switches to fixed-round controls and starts a fixed-round game", async () => {
  const onStart = vi.fn();
  const user = userEvent.setup();
  render(<SetupScreen onStart={onStart} />);

  await user.selectOptions(screen.getByLabelText("Mode"), "FIXED_ROUNDS");
  expect(screen.getByLabelText("Round limit")).toHaveValue("ROUNDS_12");
  expect(screen.queryByLabelText("Time limit")).not.toBeInTheDocument();

  await user.selectOptions(screen.getByLabelText("Round limit"), "ROUNDS_9");
  await user.click(screen.getByRole("button", { name: "Start Game" }));

  expect(onStart.mock.calls[0][0].config).toMatchObject({
    mode: "FIXED_ROUNDS",
    endCondition: "FIXED_ROUNDS",
    fixedRoundLimit: 9
  });
});

test("hides secondary limit selectors in classic mode", async () => {
  const user = userEvent.setup();
  render(<SetupScreen onStart={() => undefined} />);

  await user.selectOptions(screen.getByLabelText("Mode"), "CLASSIC");

  expect(screen.queryByLabelText("Time limit")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Round limit")).not.toBeInTheDocument();
});
```

**Step 2: Run the setup test file to verify it fails**

Run: `npm run test -- src/features/setup/SetupScreen.test.tsx`
Expected: FAIL because setup still renders the old overloaded `Game length` selector.

**Step 3: Write the minimal implementation**

Modify `src/features/setup/SetupScreen.tsx` so it:

- imports mode and option constants from `src/game/constants/gameModeOptions.ts`
- stores:
  - `selectedMode`
  - `selectedTimedOption`
  - `selectedFixedRoundOption`
- renders:

```tsx
<label>
  Mode
  <select value={selectedMode} onChange={...}>
    ...
  </select>
</label>
```

and conditionally:

```tsx
{selectedMode === "TIMED" ? (
  <label>
    Time limit
    <select value={selectedTimedOption} onChange={...}>...</select>
  </label>
) : null}

{selectedMode === "FIXED_ROUNDS" ? (
  <label>
    Round limit
    <select value={selectedFixedRoundOption} onChange={...}>...</select>
  </label>
) : null}
```

Build config on start with:

```ts
const config = buildGameConfigFromModeSelection({
  modeId: selectedMode,
  timedOptionId: selectedTimedOption,
  fixedRoundOptionId: selectedFixedRoundOption
});
```

Remove the old “timed presets are calibrated for 2-player games” message, because real timed mode is no longer a round-calibration feature.

**Step 4: Run the setup tests to verify they pass**

Run: `npm run test -- src/features/setup/SetupScreen.test.tsx`
Expected: PASS with explicit `Mode`, `Time limit`, and `Round limit` behavior.

**Step 5: Commit**

```bash
git add src/features/setup/SetupScreen.tsx src/features/setup/SetupScreen.test.tsx
git commit -m "feat: add explicit setup modes"
```

### Task 3: Add timed-mode runtime state, timer actions, and scored completion logic

**Files:**
- Modify: `src/game/rules/endConditions.ts`
- Modify: `src/game/rules/endConditions.test.ts`
- Modify: `src/game/state/actions.ts`
- Modify: `src/game/state/reducer.ts`
- Modify: `src/game/state/reducer.test.ts`
- Modify: `src/game/state/initialState.ts`
- Modify: `src/game/persistence/localSave.ts`
- Modify: `src/game/persistence/localSave.test.ts`

**Step 1: Write the failing reducer and persistence tests**

Update `src/game/state/reducer.test.ts` with coverage like:

```ts
test("decrements remaining time in timed mode", () => {
  const timedState = createGameState(initialState.players, {
    ...initialState.config,
    mode: "TIMED",
    timeLimitSeconds: 600,
    endCondition: "LAST_PLAYER_STANDING"
  });
  const next = reducer(
    { ...timedState, remainingTimeMs: 600000 },
    { type: "TICK_TIMER", payload: { elapsedMs: 1000 } }
  );

  expect(next.remainingTimeMs).toBe(599000);
  expect(next.phase).toBe("roll");
});

test("completes timed games on timeout using highest net worth", () => {
  const timedState = createGameState(
    [
      { ...initialState.players[0], id: "p1", cash: 1200 },
      { ...initialState.players[1], id: "p2", cash: 1800 }
    ],
    {
      ...initialState.config,
      mode: "TIMED",
      timeLimitSeconds: 1,
      endCondition: "LAST_PLAYER_STANDING"
    }
  );

  const next = reducer(
    { ...timedState, remainingTimeMs: 500 },
    { type: "TICK_TIMER", payload: { elapsedMs: 1000 } }
  );

  expect(next.phase).toBe("completed");
  expect(next.winnerId).toBe("p2");
  expect(next.remainingTimeMs).toBe(0);
});

test("completes timed games as draws on tied net worth", () => {
  const timedState = createGameState(
    [
      { ...initialState.players[0], id: "p1", cash: 1500 },
      { ...initialState.players[1], id: "p2", cash: 1500 }
    ],
    {
      ...initialState.config,
      mode: "TIMED",
      timeLimitSeconds: 1,
      endCondition: "LAST_PLAYER_STANDING"
    }
  );

  const next = reducer(
    { ...timedState, remainingTimeMs: 250 },
    { type: "TICK_TIMER", payload: { elapsedMs: 1000 } }
  );

  expect(next.phase).toBe("completed");
  expect(next.winnerId).toBeNull();
  expect(next.pendingMessage).toBe("Game ended in a draw");
});
```

Update `src/game/persistence/localSave.test.ts` to assert `remainingTimeMs` survives save/load.

**Step 2: Run the reducer and persistence tests to verify they fail**

Run: `npm run test -- src/game/state/reducer.test.ts src/game/persistence/localSave.test.ts`
Expected: FAIL because timed game state and timer actions do not exist yet.

**Step 3: Write the minimal implementation**

Update `src/game/state/actions.ts` to add:

```ts
| { type: "TICK_TIMER"; payload: { elapsedMs: number } }
```

Update `src/game/types.ts` and `src/game/state/initialState.ts` so `GameState` includes:

```ts
remainingTimeMs: number | null;
```

Initialize `remainingTimeMs` from `config.timeLimitSeconds` in `createGameState`.

In `src/game/rules/endConditions.ts`, extract a helper for scored endings, for example:

```ts
export function resolveHighestNetWorthOutcome(
  players: { id: string; netWorth: number }[]
): EndConditionResolution
```

Use that helper for fixed-round completion too, so fixed-round and timed scored endings share the same winner/draw logic.

In `src/game/state/reducer.ts`:

- ignore `TICK_TIMER` for non-timed games and completed games
- decrement `remainingTimeMs` with `Math.max(0, ...)`
- when time reaches `0`, complete the game immediately using highest net worth

Leave classic and fixed-round turn logic intact.

Update `src/game/persistence/localSave.ts` validation so a saved timed game with `remainingTimeMs` still loads correctly.

**Step 4: Run the affected tests to verify they pass**

Run: `npm run test -- src/game/rules/endConditions.test.ts src/game/state/reducer.test.ts src/game/persistence/localSave.test.ts`
Expected: PASS with timed-mode state and timeout completion in place.

**Step 5: Commit**

```bash
git add src/game/rules/endConditions.ts src/game/rules/endConditions.test.ts src/game/state/actions.ts src/game/state/reducer.ts src/game/state/reducer.test.ts src/game/state/initialState.ts src/game/persistence/localSave.ts src/game/persistence/localSave.test.ts
git commit -m "feat: add timed mode state and completion"
```

### Task 4: Add the live countdown display and pause/resume behavior

**Files:**
- Modify: `src/features/game/GameScreen.tsx`
- Modify: `src/features/game/GameScreen.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

**Step 1: Write the failing countdown tests**

Update `src/features/game/GameScreen.test.tsx` with fake-timer coverage like:

```ts
test("shows a live time-left countdown in timed mode", () => {
  vi.useFakeTimers();
  const timedState = createGameState(initialState.players, {
    ...initialState.config,
    mode: "TIMED",
    timeLimitSeconds: 600,
    endCondition: "LAST_PLAYER_STANDING"
  });

  render(<GameScreen initial={timedState} />);

  expect(screen.getByText("Time left: 10:00")).toBeInTheDocument();
});

test("ticks the countdown while the live game screen is mounted", async () => {
  vi.useFakeTimers();
  const timedState = createGameState(initialState.players, {
    ...initialState.config,
    mode: "TIMED",
    timeLimitSeconds: 600,
    endCondition: "LAST_PLAYER_STANDING"
  });

  render(<GameScreen initial={timedState} />);

  await act(async () => {
    vi.advanceTimersByTime(3000);
  });

  expect(screen.getByText("Time left: 09:57")).toBeInTheDocument();
});

test("does not show the countdown in classic mode", () => {
  render(<GameScreen initial={initialState} />);
  expect(screen.queryByText(/Time left:/i)).not.toBeInTheDocument();
});
```

Update `src/App.test.tsx` with a save/resume pause test:

```ts
test("pauses timed countdown outside the live game screen", async () => {
  vi.useFakeTimers();
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<App />);

  await user.selectOptions(screen.getByLabelText("Mode"), "TIMED");
  await user.selectOptions(screen.getByLabelText("Time limit"), "MINUTES_10");
  await user.click(screen.getByRole("button", { name: "Start Game" }));

  await act(async () => {
    vi.advanceTimersByTime(3000);
  });

  expect(screen.getByText("Time left: 09:57")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Save" }));

  await act(async () => {
    vi.advanceTimersByTime(5000);
  });

  await user.click(screen.getByRole("button", { name: "Resume Saved Game" }));
  expect(screen.getByText("Time left: 09:57")).toBeInTheDocument();
});
```

**Step 2: Run the screen tests to verify they fail**

Run: `npm run test -- src/features/game/GameScreen.test.tsx src/App.test.tsx`
Expected: FAIL because no live countdown is rendered and no timer is ticking.

**Step 3: Write the minimal implementation**

Modify `src/features/game/GameScreen.tsx` so timed mode:

- shows a `Time left: MM:SS` status pill when `state.config.mode === "TIMED"`
- starts an interval while mounted and not completed
- dispatches `TICK_TIMER` with actual elapsed milliseconds, for example:

```ts
useEffect(() => {
  if (state.config.mode !== "TIMED" || state.phase === "completed") {
    return undefined;
  }

  let lastTickAt = Date.now();
  const intervalId = window.setInterval(() => {
    const now = Date.now();
    const elapsedMs = now - lastTickAt;
    lastTickAt = now;
    dispatch({ type: "TICK_TIMER", payload: { elapsedMs } });
  }, 250);

  return () => window.clearInterval(intervalId);
}, [state.config.mode, state.phase]);
```

Format the display from `remainingTimeMs` with a small helper inside `GameScreen.tsx` or a nearby utility.

No background timer should exist in `App.tsx`; pause behavior should come entirely from `GameScreen` mounting and unmounting.

**Step 4: Run the screen tests to verify they pass**

Run: `npm run test -- src/features/game/GameScreen.test.tsx src/App.test.tsx`
Expected: PASS with live ticking and save/resume pause coverage.

**Step 5: Commit**

```bash
git add src/features/game/GameScreen.tsx src/features/game/GameScreen.test.tsx src/App.tsx src/App.test.tsx
git commit -m "feat: add live timed countdown"
```

### Task 5: Retarget simulation analysis to fixed-round mode and remove faux timed presets

**Files:**
- Modify: `scripts/run-simulation.ts`
- Modify: `src/game/simulation/report.test.ts`
- Modify: `src/game/constants/gameLengthPresets.ts`
- Modify: `src/game/constants/gameLengthPresets.test.ts`

**Step 1: Write the failing report/update tests**

Update `src/game/simulation/report.test.ts` so the sample labels no longer claim real time, for example:

```ts
test("renders classic and fixed-round summaries in one report", () => {
  const output = formatSimulationReport([
    createSummary("Classic mode", 236.1, 0, 0),
    createSummary("12 rounds", 12, 0, 3)
  ]);

  expect(output).toContain("Classic mode");
  expect(output).toContain("12 rounds");
  expect(output).toContain("Ties:");
});
```

Update `src/game/constants/gameLengthPresets.test.ts` to either fail explicitly or replace it with a small compatibility-removal assertion so the old faux-timed preset module can be deleted in this task.

**Step 2: Run the affected tests to verify they fail**

Run: `npm run test -- src/game/simulation/report.test.ts src/game/constants/gameLengthPresets.test.ts`
Expected: FAIL because the code still treats time-flavored labels as simulation presets.

**Step 3: Write the minimal implementation**

Modify `scripts/run-simulation.ts` so it uses the fixed-round option constants from `src/game/constants/gameModeOptions.ts`, not the old timed preset module.

Structure it like:

```ts
const summaries = [
  runSimulationBatch({
    preset: BASELINE_SIMULATION_PRESET,
    gameCount: options.games,
    seed: options.seed,
    playerCount: 2
  }),
  ...FIXED_ROUND_OPTIONS.map((option) => ({
    ...runSimulationBatch({
      preset: BASELINE_SIMULATION_PRESET,
      gameCount: options.games,
      seed: options.seed,
      playerCount: 2,
      simulationConfig: buildGameConfigFromModeSelection({
        modeId: "FIXED_ROUNDS",
        fixedRoundOptionId: option.id
      })
    }),
    label: option.label
  }))
];
```

Use fixed-round labels like:

- `6 rounds`
- `9 rounds`
- `12 rounds`
- `18 rounds`

Delete `src/game/constants/gameLengthPresets.ts` and `src/game/constants/gameLengthPresets.test.ts` once no callsites remain.

**Step 4: Run the focused tests and simulation command**

Run: `npm run test -- src/game/simulation/report.test.ts`
Expected: PASS with fixed-round report wording.

Run: `npm run simulate -- --games 1000 --seed 20260314`
Expected: PASS with `Classic mode` plus fixed-round scenario labels instead of real-time labels.

**Step 5: Commit**

```bash
git add scripts/run-simulation.ts src/game/simulation/report.test.ts src/game/constants/gameModeOptions.ts
git rm src/game/constants/gameLengthPresets.ts src/game/constants/gameLengthPresets.test.ts
git commit -m "refactor: decouple simulation from timed mode"
```

### Task 6: Run verification before completion

**Files:**
- Verify only: `src/game/constants/gameModeOptions.ts`
- Verify only: `src/features/setup/SetupScreen.tsx`
- Verify only: `src/game/state/reducer.ts`
- Verify only: `src/features/game/GameScreen.tsx`
- Verify only: `scripts/run-simulation.ts`

**Step 1: Run focused feature tests**

Run:

```bash
npm run test -- src/game/constants/gameModeOptions.test.ts src/features/setup/SetupScreen.test.tsx src/game/state/reducer.test.ts src/features/game/GameScreen.test.tsx src/features/results/WinnerScreen.test.tsx src/App.test.tsx src/game/persistence/localSave.test.ts src/game/simulation/report.test.ts
```

Expected: PASS for explicit modes, live countdown behavior, save/resume pause, draw handling, and fixed-round simulation naming.

**Step 2: Run the full test suite**

Run: `npm run test`
Expected: PASS with no regressions across the app, reducer, persistence, and simulator.

**Step 3: Run type-checking**

Run: `npm run lint`
Expected: PASS for app and script code.

**Step 4: Run the fixed-round simulation analysis**

Run: `npm run simulate -- --games 1000 --seed 20260314`
Expected: PASS with `Classic mode` and fixed-round scenario labels only.

**Step 5: Commit verification state**

```bash
git add src/game/constants/gameModeOptions.ts src/features/setup/SetupScreen.tsx src/game/state/reducer.ts src/features/game/GameScreen.tsx scripts/run-simulation.ts
git commit --allow-empty -m "test: verify decoupled timed and fixed-round modes"
```
