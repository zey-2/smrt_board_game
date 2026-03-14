# Game Length Timed Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a player-facing `Game Length` selector that maps to calibrated `FIXED_ROUNDS` limits for 2-player games and extend the simulator so those timed presets can be compared against classic mode.

**Architecture:** Keep the core game model unchanged by expressing timed mode as existing `FIXED_ROUNDS` config. Add shared game-length preset constants for setup and simulation, replace the setup screen’s raw end-condition selector with those presets, and update the simulation CLI to compare classic mode with `10 / 15 / 20 / 30 minute` options for 2-player pacing analysis.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, Node CLI

---

### Task 1: Add shared game-length presets and config mapping

**Files:**
- Create: `src/game/constants/gameLengthPresets.ts`
- Create: `src/game/constants/gameLengthPresets.test.ts`

**Step 1: Write the failing preset test**

Create `src/game/constants/gameLengthPresets.test.ts` with coverage like:

```ts
import { describe, expect, test } from "vitest";
import {
  DEFAULT_GAME_LENGTH_PRESET_ID,
  GAME_LENGTH_PRESETS,
  buildGameConfigFromGameLengthPreset
} from "./gameLengthPresets";

describe("gameLengthPresets", () => {
  test("defaults to the 20-minute timed preset and keeps classic mode available", () => {
    expect(DEFAULT_GAME_LENGTH_PRESET_ID).toBe("MINUTES_20");
    expect(GAME_LENGTH_PRESETS.map((preset) => preset.id)).toEqual([
      "CLASSIC",
      "MINUTES_10",
      "MINUTES_15",
      "MINUTES_20",
      "MINUTES_30"
    ]);
  });

  test("maps the 20-minute preset to fixed rounds and classic mode to last player standing", () => {
    expect(buildGameConfigFromGameLengthPreset("MINUTES_20")).toMatchObject({
      endCondition: "FIXED_ROUNDS",
      fixedRoundLimit: 12,
      targetWealth: 8000,
      initialCash: 1500
    });

    expect(buildGameConfigFromGameLengthPreset("CLASSIC")).toMatchObject({
      endCondition: "LAST_PLAYER_STANDING",
      fixedRoundLimit: 12
    });
  });
});
```

**Step 2: Run the preset test to verify it fails**

Run: `npm run test -- src/game/constants/gameLengthPresets.test.ts`
Expected: FAIL because the preset module does not exist yet.

**Step 3: Write the minimal implementation**

Create `src/game/constants/gameLengthPresets.ts` with:

```ts
import type { GameConfig } from "../types";

export type GameLengthPresetId =
  | "CLASSIC"
  | "MINUTES_10"
  | "MINUTES_15"
  | "MINUTES_20"
  | "MINUTES_30";

export interface GameLengthPreset {
  id: GameLengthPresetId;
  label: string;
  description: string;
  endCondition: GameConfig["endCondition"];
  fixedRoundLimit: number;
}

export const DEFAULT_GAME_LENGTH_PRESET_ID: GameLengthPresetId = "MINUTES_20";

export const GAME_LENGTH_PRESETS: GameLengthPreset[] = [
  {
    id: "CLASSIC",
    label: "Classic mode",
    description: "Play until only one player is left active.",
    endCondition: "LAST_PLAYER_STANDING",
    fixedRoundLimit: 12
  },
  {
    id: "MINUTES_10",
    label: "10 minutes",
    description: "Fast 2-player game.",
    endCondition: "FIXED_ROUNDS",
    fixedRoundLimit: 6
  },
  {
    id: "MINUTES_15",
    label: "15 minutes",
    description: "Short 2-player game.",
    endCondition: "FIXED_ROUNDS",
    fixedRoundLimit: 9
  },
  {
    id: "MINUTES_20",
    label: "20 minutes",
    description: "Recommended 2-player length.",
    endCondition: "FIXED_ROUNDS",
    fixedRoundLimit: 12
  },
  {
    id: "MINUTES_30",
    label: "30 minutes",
    description: "Longer timed session.",
    endCondition: "FIXED_ROUNDS",
    fixedRoundLimit: 18
  }
];

export function buildGameConfigFromGameLengthPreset(
  presetId: GameLengthPresetId,
  overrides: Partial<Pick<GameConfig, "initialCash" | "targetWealth">> = {}
): GameConfig {
  const preset =
    GAME_LENGTH_PRESETS.find((entry) => entry.id === presetId) ?? GAME_LENGTH_PRESETS[0];

  return {
    endCondition: preset.endCondition,
    fixedRoundLimit: preset.fixedRoundLimit,
    targetWealth: overrides.targetWealth ?? 8000,
    initialCash: overrides.initialCash ?? 1500
  };
}
```

**Step 4: Run the preset test to verify it passes**

Run: `npm run test -- src/game/constants/gameLengthPresets.test.ts`
Expected: PASS with the shared mapping available to both UI and simulator.

**Step 5: Commit**

```bash
git add src/game/constants/gameLengthPresets.ts src/game/constants/gameLengthPresets.test.ts
git commit -m "feat: add game length presets"
```

### Task 2: Replace the setup end-condition selector with game length

**Files:**
- Modify: `src/features/setup/SetupScreen.tsx`
- Modify: `src/features/setup/SetupScreen.test.tsx`

**Step 1: Write the failing setup tests**

Update `src/features/setup/SetupScreen.test.tsx` with focused coverage:

```ts
test("shows one shared game length selector with 20 minutes as the default", async () => {
  const onStart = vi.fn();
  const user = userEvent.setup();
  render(<SetupScreen onStart={onStart} />);

  const gameLengthSelect = screen.getByLabelText("Game length");
  expect(gameLengthSelect).toHaveValue("MINUTES_20");
  expect(screen.queryByLabelText("End condition")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Start Game" }));

  expect(onStart).toHaveBeenCalledTimes(1);
  expect(onStart.mock.calls[0][0].config).toMatchObject({
    endCondition: "FIXED_ROUNDS",
    fixedRoundLimit: 12
  });
});

test("uses classic mode when the player selects the classic game length option", async () => {
  const onStart = vi.fn();
  const user = userEvent.setup();
  render(<SetupScreen onStart={onStart} />);

  await user.selectOptions(screen.getByLabelText("Game length"), "CLASSIC");
  await user.click(screen.getByRole("button", { name: "Start Game" }));

  expect(onStart.mock.calls[0][0].config).toMatchObject({
    endCondition: "LAST_PLAYER_STANDING"
  });
});
```

**Step 2: Run the setup test to verify it fails**

Run: `npm run test -- src/features/setup/SetupScreen.test.tsx -t "shared game length selector"`
Expected: FAIL because the setup screen still renders the raw end-condition selector.

**Step 3: Write the minimal implementation**

Modify `src/features/setup/SetupScreen.tsx` so it:

- imports `DEFAULT_GAME_LENGTH_PRESET_ID`, `GAME_LENGTH_PRESETS`, and `buildGameConfigFromGameLengthPreset`
- stores `selectedGameLength` in local state instead of `endCondition`
- renders:

```tsx
<label>
  Game length
  <select
    value={selectedGameLength}
    onChange={(event) => setSelectedGameLength(event.target.value as GameLengthPresetId)}
  >
    {GAME_LENGTH_PRESETS.map((preset) => (
      <option key={preset.id} value={preset.id}>
        {preset.label}
      </option>
    ))}
  </select>
</label>
```

- builds config on start with:

```ts
const config = buildGameConfigFromGameLengthPreset(selectedGameLength);
const result = validateAndBuildSetup({
  players,
  endCondition: config.endCondition,
  initialCash: config.initialCash,
  fixedRoundLimit: config.fixedRoundLimit,
  targetWealth: config.targetWealth
});
```

Remove the `END_CONDITION_OPTIONS` import and the old `endCondition` state.

**Step 4: Run the setup tests to verify they pass**

Run: `npm run test -- src/features/setup/SetupScreen.test.tsx`
Expected: PASS with `Game length` shown and the default `20 minutes` mapping to `FIXED_ROUNDS`.

**Step 5: Commit**

```bash
git add src/features/setup/SetupScreen.tsx src/features/setup/SetupScreen.test.tsx
git commit -m "feat: add timed game length selector"
```

### Task 3: Extend the simulator to compare classic mode against timed presets

**Files:**
- Modify: `src/game/simulation/runner.ts`
- Modify: `src/game/simulation/runner.test.ts`
- Modify: `src/game/simulation/report.ts`
- Modify: `src/game/simulation/report.test.ts`
- Modify: `scripts/run-simulation.ts`

**Step 1: Write the failing simulation tests**

Update `src/game/simulation/runner.test.ts` with a fixed-round stop test:

```ts
test("stops at the configured fixed round limit when using timed mode", () => {
  const result = runSimulationBatch({
    preset: BASELINE_SIMULATION_PRESET,
    gameCount: 1,
    seed: 20260314,
    playerCount: 2,
    simulationConfig: {
      endCondition: "FIXED_ROUNDS",
      fixedRoundLimit: 2,
      targetWealth: 8000,
      initialCash: 1500
    },
    maxTurnsPerGame: 100,
    diceValueProvider: () => 1
  });

  expect(result.averageRounds).toBe(2);
});
```

Update `src/game/simulation/report.test.ts` to assert multi-scenario output:

```ts
test("renders classic and timed summaries in one report", () => {
  const output = formatSimulationReport([
    createSummary("Classic mode", 236.1, 0),
    createSummary("20 minutes", 12, 0)
  ]);

  expect(output).toContain("Classic mode");
  expect(output).toContain("20 minutes");
  expect(output).toContain("Average rounds");
});
```

**Step 2: Run the simulation tests to verify they fail**

Run: `npm run test -- src/game/simulation/runner.test.ts src/game/simulation/report.test.ts`
Expected: FAIL because the runner still hardcodes `LAST_PLAYER_STANDING` and the report formatter only supports baseline-vs-variant output.

**Step 3: Write the minimal implementation**

Modify `src/game/simulation/runner.ts` to accept a `simulationConfig` override:

```ts
interface SimulationConfig {
  endCondition: EndConditionMode;
  fixedRoundLimit: number;
  targetWealth: number;
  initialCash: number;
}

interface RunSimulationBatchInput {
  preset: SimulationPreset;
  gameCount: number;
  seed: number;
  simulationConfig?: SimulationConfig;
  playerCount?: number;
  policy?: PurchasePolicy;
  maxTurnsPerGame?: number;
  diceValueProvider?: () => number;
}
```

Use `simulationConfig ?? DEFAULT_CONFIG` when creating players and calling `evaluateEndCondition`.

Modify `src/game/simulation/report.ts` so it formats an array of summaries instead of a hardcoded `{ baseline, variant }` pair:

```ts
export function formatSimulationReport(summaries: SimulationBatchSummary[]): string {
  return [
    "SMRT Monopoly Simulation Report",
    "",
    ...summaries.flatMap((summary) => [...formatSummary(summary), ""])
  ].join("\n");
}
```

Modify `scripts/run-simulation.ts` so it:

- imports `GAME_LENGTH_PRESETS` and `buildGameConfigFromGameLengthPreset`
- runs a `Classic mode` scenario plus each timed preset for `playerCount: 2`
- prints a single report with all summaries

Structure the scenario build like:

```ts
const summaries = GAME_LENGTH_PRESETS.map((preset) =>
  runSimulationBatch({
    preset: BASELINE_SIMULATION_PRESET,
    gameCount: options.games,
    seed: options.seed,
    playerCount: 2,
    simulationConfig: buildGameConfigFromGameLengthPreset(preset.id)
  })
);
```

If you want `Classic mode` first in the report, keep the presets array ordered that way in `gameLengthPresets.ts`.

**Step 4: Run the simulation tests and CLI command to verify them**

Run: `npm run test -- src/game/simulation/runner.test.ts src/game/simulation/report.test.ts`
Expected: PASS with timed-mode stop behavior covered and the new multi-scenario report format green.

Run: `npm run simulate -- --games 1000 --seed 20260314`
Expected: PASS with output that includes `Classic mode`, `10 minutes`, `15 minutes`, `20 minutes`, and `30 minutes`.

**Step 5: Commit**

```bash
git add src/game/simulation/runner.ts src/game/simulation/runner.test.ts src/game/simulation/report.ts src/game/simulation/report.test.ts scripts/run-simulation.ts
git commit -m "feat: add timed mode simulation analysis"
```

### Task 4: Run verification before completion

**Files:**
- Verify only: `src/game/constants/gameLengthPresets.ts`
- Verify only: `src/features/setup/SetupScreen.tsx`
- Verify only: `src/game/simulation/runner.ts`
- Verify only: `src/game/simulation/report.ts`
- Verify only: `scripts/run-simulation.ts`

**Step 1: Run focused feature tests**

Run: `npm run test -- src/game/constants/gameLengthPresets.test.ts src/features/setup/SetupScreen.test.tsx src/game/simulation/runner.test.ts src/game/simulation/report.test.ts`
Expected: PASS for the new timed-mode feature coverage.

**Step 2: Run the full test suite**

Run: `npm run test`
Expected: PASS with no regressions across the app or simulator.

**Step 3: Run type-checking**

Run: `npm run lint`
Expected: PASS for both app and script code.

**Step 4: Run the 2-player timed-mode analysis**

Run: `npm run simulate -- --games 1000 --seed 20260314`
Expected: PASS with a report containing classic mode and all timed presets in one output.

**Step 5: Commit verification state**

```bash
git add src/game/constants/gameLengthPresets.ts src/features/setup/SetupScreen.tsx src/game/simulation/runner.ts src/game/simulation/report.ts scripts/run-simulation.ts
git commit -m "test: verify timed game length mode"
```
