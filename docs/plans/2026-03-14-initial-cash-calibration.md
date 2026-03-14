# Initial Cash Calibration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a repeatable simulator calibration flow for baseline 2-player classic games, use it to pick the starting cash closest to a 20-round average, and update the shared default `initialCash` to that calibrated value.

**Architecture:** Keep the existing simulation engine intact and add a small calibration layer that evaluates candidate cash values through `runSimulationBatch`. Put CLI parsing and calibration report formatting into pure modules so they can be tested directly, then wire the chosen cash value through a shared default constant that setup, state, and simulation all consume.

**Tech Stack:** TypeScript, Node, React repo tooling, Vitest

---

### Task 1: Add initial-cash calibration ranking

**Files:**
- Create: `src/game/simulation/calibration.ts`
- Create: `src/game/simulation/calibration.test.ts`

**Step 1: Write the failing calibration tests**

Create `src/game/simulation/calibration.test.ts` with focused candidate-ranking coverage:

```ts
import { describe, expect, test } from "vitest";
import { rankInitialCashCandidates } from "./calibration";
import type { SimulationBatchSummary } from "./runner";

function createBatchSummary(averageRounds: number): SimulationBatchSummary {
  return {
    label: "classic",
    gameCount: 200,
    averageRounds,
    seatWinCounts: [100, 100],
    totalTies: 0,
    averageEndingCash: 0,
    averageEndingNetWorth: 0,
    totalStationPurchases: 0,
    totalRentPayments: 0,
    totalBankruptcies: 0,
    totalLeadChanges: 0,
    tileLandingCounts: {},
    totalCashTileAwards: 0,
    totalPurchaseEnablesFromCashTile: 0
  };
}

describe("rankInitialCashCandidates", () => {
  test("passes each candidate initial cash to the simulation runner and sorts by closeness to the target", () => {
    const calls: number[] = [];

    const results = rankInitialCashCandidates({
      minCash: 800,
      maxCash: 1200,
      step: 200,
      targetRounds: 20,
      gameCount: 200,
      seed: 20260314,
      runBatch: ({ simulationConfig }) => {
        calls.push(simulationConfig.initialCash);

        const averages: Record<number, number> = {
          800: 27,
          1000: 20.5,
          1200: 17
        };

        return createBatchSummary(averages[simulationConfig.initialCash]);
      }
    });

    expect(calls).toEqual([800, 1000, 1200]);
    expect(results.map((entry) => entry.initialCash)).toEqual([1000, 1200, 800]);
    expect(results[0]).toMatchObject({
      initialCash: 1000,
      averageRounds: 20.5,
      distanceFromTarget: 0.5
    });
  });

  test("breaks equal-distance ties by lower initial cash", () => {
    const results = rankInitialCashCandidates({
      minCash: 900,
      maxCash: 1100,
      step: 200,
      targetRounds: 20,
      gameCount: 200,
      seed: 20260314,
      runBatch: ({ simulationConfig }) =>
        createBatchSummary(simulationConfig.initialCash === 900 ? 19 : 21)
    });

    expect(results.map((entry) => entry.initialCash)).toEqual([900, 1100]);
  });

  test("throws when the candidate range is invalid", () => {
    expect(() =>
      rankInitialCashCandidates({
        minCash: 1000,
        maxCash: 800,
        step: 100,
        targetRounds: 20,
        gameCount: 200,
        seed: 20260314
      })
    ).toThrow("Invalid initial cash calibration range");
  });
});
```

**Step 2: Run the calibration tests to verify they fail**

Run: `npm run test -- src/game/simulation/calibration.test.ts`
Expected: FAIL because the calibration module does not exist yet.

**Step 3: Write the minimal implementation**

Create `src/game/simulation/calibration.ts` with:

- an exported `InitialCashCalibrationResult` type
- an exported `rankInitialCashCandidates` function
- candidate-range validation (`minCash <= maxCash`, `step > 0`)
- default behavior that evaluates the baseline preset for `2` players in classic mode
- support for injecting `runBatch` in tests
- sorting by:
  1. absolute distance from `targetRounds`
  2. lower `initialCash` for equal-distance ties

Use `runSimulationBatch` with:

```ts
simulationConfig: {
  endCondition: "LAST_PLAYER_STANDING",
  fixedRoundLimit: 12,
  targetWealth: 8000,
  initialCash
}
```

**Step 4: Run the calibration tests to verify they pass**

Run: `npm run test -- src/game/simulation/calibration.test.ts`
Expected: PASS with the candidate cash values ranked correctly.

**Step 5: Commit**

```bash
git add src/game/simulation/calibration.ts src/game/simulation/calibration.test.ts
git commit -m "feat: add initial cash calibration helper"
```

### Task 2: Add calibration CLI parsing and reporting

**Files:**
- Create: `src/game/simulation/cliOptions.ts`
- Create: `src/game/simulation/cliOptions.test.ts`
- Create: `src/game/simulation/calibrationReport.ts`
- Create: `src/game/simulation/calibrationReport.test.ts`
- Modify: `scripts/run-simulation.ts`

**Step 1: Write the failing parsing and report tests**

Create `src/game/simulation/cliOptions.test.ts` with parsing coverage like:

```ts
import { describe, expect, test } from "vitest";
import { parseSimulationCliOptions } from "./cliOptions";

describe("parseSimulationCliOptions", () => {
  test("parses initial cash calibration mode and range flags", () => {
    expect(
      parseSimulationCliOptions([
        "--calibrate-initial-cash",
        "--games",
        "2000",
        "--seed",
        "20260314",
        "--cash-min",
        "600",
        "--cash-max",
        "1200",
        "--cash-step",
        "100"
      ])
    ).toEqual({
      mode: "CALIBRATE_INITIAL_CASH",
      games: 2000,
      seed: 20260314,
      cashMin: 600,
      cashMax: 1200,
      cashStep: 100,
      targetRounds: 20
    });
  });

  test("defaults to summary mode when calibration is not requested", () => {
    expect(parseSimulationCliOptions([])).toMatchObject({
      mode: "SUMMARY",
      games: 1000,
      seed: 20260314
    });
  });

  test("throws when cash step is not positive", () => {
    expect(() =>
      parseSimulationCliOptions([
        "--calibrate-initial-cash",
        "--cash-step",
        "0"
      ])
    ).toThrow("Invalid --cash-step value");
  });
});
```

Create `src/game/simulation/calibrationReport.test.ts` with output coverage like:

```ts
import { describe, expect, test } from "vitest";
import { formatInitialCashCalibrationReport } from "./calibrationReport";

describe("formatInitialCashCalibrationReport", () => {
  test("renders the best candidates first and shows ties", () => {
    const output = formatInitialCashCalibrationReport({
      targetRounds: 20,
      results: [
        { initialCash: 900, averageRounds: 20.2, distanceFromTarget: 0.2 },
        { initialCash: 1000, averageRounds: 19.8, distanceFromTarget: 0.2 },
        { initialCash: 1100, averageRounds: 23.1, distanceFromTarget: 3.1 }
      ]
    });

    expect(output).toContain("Initial Cash Calibration Report");
    expect(output).toContain("Target average rounds: 20");
    expect(output).toContain("Best candidates: $900, $1000");
    expect(output).toContain("$1100");
  });
});
```

**Step 2: Run the new tests to verify they fail**

Run: `npm run test -- src/game/simulation/cliOptions.test.ts src/game/simulation/calibrationReport.test.ts`
Expected: FAIL because the parsing and report modules do not exist yet.

**Step 3: Write the minimal implementation**

Create `src/game/simulation/cliOptions.ts` that:

- parses the existing `--games` and `--seed` flags
- adds `--calibrate-initial-cash`
- adds `--cash-min`, `--cash-max`, `--cash-step`, and optional `--target-rounds`
- returns either `{ mode: "SUMMARY", ... }` or `{ mode: "CALIBRATE_INITIAL_CASH", ... }`
- validates positive integers for game count, seed, and calibration step

Create `src/game/simulation/calibrationReport.ts` that:

- formats a title and target-round line
- identifies all best candidates that tie for the lowest distance
- prints a ranked table with `initialCash`, `averageRounds`, and `distanceFromTarget`

Modify `scripts/run-simulation.ts` so it:

- delegates CLI parsing to `parseSimulationCliOptions`
- keeps the current summary behavior when `mode === "SUMMARY"`
- runs `rankInitialCashCandidates` and prints `formatInitialCashCalibrationReport(...)` when `mode === "CALIBRATE_INITIAL_CASH"`

**Step 4: Run the parsing and report tests to verify they pass**

Run: `npm run test -- src/game/simulation/cliOptions.test.ts src/game/simulation/calibrationReport.test.ts`
Expected: PASS with calibration mode parsing and report formatting covered.

**Step 5: Commit**

```bash
git add src/game/simulation/cliOptions.ts src/game/simulation/cliOptions.test.ts src/game/simulation/calibrationReport.ts src/game/simulation/calibrationReport.test.ts scripts/run-simulation.ts
git commit -m "feat: add initial cash calibration mode"
```

### Task 3: Apply the calibrated default starting cash

**Files:**
- Create: `src/game/constants/defaultValues.ts`
- Create: `src/game/constants/defaultValues.test.ts`
- Modify: `src/game/constants/gameModeOptions.ts`
- Modify: `src/game/constants/gameModeOptions.test.ts`
- Modify: `src/features/setup/setupValidation.ts`
- Modify: `src/features/setup/SetupScreen.test.tsx`
- Modify: `src/game/state/initialState.ts`
- Modify: `src/game/state/initialState.test.ts`
- Modify: `src/game/simulation/runner.ts`

**Step 1: Run the calibration command and record the winning candidate**

Run:

```bash
npm run simulate -- --calibrate-initial-cash --games 5000 --seed 20260314 --cash-min 100 --cash-max 1500 --cash-step 50
```

If the best candidate lands on either boundary, rerun with a wider range before locking the default value.

**Step 2: Write the failing default-value tests using the chosen cash amount**

Create `src/game/constants/defaultValues.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { DEFAULT_INITIAL_CASH } from "./defaultValues";

describe("DEFAULT_INITIAL_CASH", () => {
  test("stores the calibrated default for baseline 2-player classic games", () => {
    expect(DEFAULT_INITIAL_CASH).toBe(<WINNING_CASH_VALUE>);
  });
});
```

Update `src/game/constants/gameModeOptions.test.ts` to assert:

```ts
expect(buildGameConfigFromModeSelection({ modeId: "CLASSIC" }).initialCash).toBe(
  DEFAULT_INITIAL_CASH
);
expect(buildGameConfigFromModeSelection({ modeId: "TIMED" }).initialCash).toBe(
  DEFAULT_INITIAL_CASH
);
expect(
  buildGameConfigFromModeSelection({
    modeId: "FIXED_ROUNDS",
    fixedRoundOptionId: "ROUNDS_9"
  }).initialCash
).toBe(DEFAULT_INITIAL_CASH);
```

Update `src/game/state/initialState.test.ts` to assert:

```ts
expect(initialState.config.initialCash).toBe(DEFAULT_INITIAL_CASH);
expect(initialState.players.every((player) => player.cash === DEFAULT_INITIAL_CASH)).toBe(true);
```

Update `src/features/setup/SetupScreen.test.tsx` so the expected start-game payload uses `DEFAULT_INITIAL_CASH` instead of a literal `1500`.

**Step 3: Run the targeted default-value tests to verify they fail**

Run:

```bash
npm run test -- src/game/constants/defaultValues.test.ts src/game/constants/gameModeOptions.test.ts src/game/state/initialState.test.ts src/features/setup/SetupScreen.test.tsx
```

Expected: FAIL because the shared default constant does not exist yet and the product defaults still use `1500`.

**Step 4: Write the minimal implementation**

Create `src/game/constants/defaultValues.ts` with:

```ts
export const DEFAULT_INITIAL_CASH = <WINNING_CASH_VALUE>;
```

Replace literal default `1500` values with `DEFAULT_INITIAL_CASH` in:

- `src/game/constants/gameModeOptions.ts`
- `src/features/setup/setupValidation.ts`
- `src/game/state/initialState.ts`
- `src/game/simulation/runner.ts`

Import `DEFAULT_INITIAL_CASH` into the updated tests so they all share one source of truth.

**Step 5: Run the targeted tests to verify they pass**

Run:

```bash
npm run test -- src/game/constants/defaultValues.test.ts src/game/constants/gameModeOptions.test.ts src/game/state/initialState.test.ts src/features/setup/SetupScreen.test.tsx
```

Expected: PASS with the calibrated default wired through setup, state, and simulation.

**Step 6: Commit**

```bash
git add src/game/constants/defaultValues.ts src/game/constants/defaultValues.test.ts src/game/constants/gameModeOptions.ts src/game/constants/gameModeOptions.test.ts src/features/setup/setupValidation.ts src/features/setup/SetupScreen.test.tsx src/game/state/initialState.ts src/game/state/initialState.test.ts src/game/simulation/runner.ts
git commit -m "feat: calibrate default initial cash"
```

### Task 4: Final verification

**Files:**
- Verify only: `src/game/simulation/calibration.ts`
- Verify only: `src/game/simulation/cliOptions.ts`
- Verify only: `src/game/simulation/calibrationReport.ts`
- Verify only: `src/game/constants/defaultValues.ts`
- Verify only: `scripts/run-simulation.ts`

**Step 1: Run the focused automated checks**

Run:

```bash
npm run test -- src/game/simulation/calibration.test.ts src/game/simulation/cliOptions.test.ts src/game/simulation/calibrationReport.test.ts src/game/constants/defaultValues.test.ts src/game/constants/gameModeOptions.test.ts src/game/state/initialState.test.ts src/features/setup/SetupScreen.test.tsx src/game/simulation/runner.test.ts src/game/simulation/report.test.ts
```

Expected: PASS with all calibration-related tests green.

**Step 2: Run the full unit suite**

Run: `npm test`
Expected: PASS with all Vitest files green.

**Step 3: Run both simulator modes manually**

Run:

```bash
npm run simulate -- --calibrate-initial-cash --games 5000 --seed 20260314 --cash-min 100 --cash-max 1500 --cash-step 50
```

Expected: a ranked calibration report with the chosen default at or near the top.

Run:

```bash
npm run simulate -- --games 1000 --seed 20260314
```

Expected: the original multi-scenario simulation report still prints normally.
