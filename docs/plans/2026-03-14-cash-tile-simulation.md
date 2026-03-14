# Cash Tile Simulation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a deterministic developer-only simulator that compares the current board against a `$500` cash-tile variant and reports whether the variant changes game excitement metrics.

**Architecture:** Add a simulation-only engine under `src/game/simulation/` that reuses the existing pure movement, economy, and end-condition helpers while keeping batch execution separate from the React reducer. Model two board presets inside the simulator: the baseline board with rent enabled and a variant that replaces `Choa Chu Kang LRT` with a repeatable `$500` cash tile.

**Tech Stack:** TypeScript, Node, React repo tooling, Vitest

---

### Task 1: Define simulation tiles and board presets

**Files:**
- Create: `src/game/simulation/types.ts`
- Create: `src/game/simulation/presets.ts`
- Create: `src/game/simulation/presets.test.ts`

**Step 1: Write the failing preset test**

Add `src/game/simulation/presets.test.ts` with coverage like:

```ts
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
    expect(baselineTile).toMatchObject({ type: "station", name: "Choa Chu Kang LRT" });

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
```

**Step 2: Run the preset test to verify it fails**

Run: `npm run test -- src/game/simulation/presets.test.ts`
Expected: FAIL because the simulation preset module does not exist yet.

**Step 3: Write the minimal implementation**

Create `src/game/simulation/types.ts` with simulation-only unions:

```ts
export interface SimulationStationTile {
  type: "station";
  id: string;
  name: string;
  price: number;
  baseRent: number;
  ownerId: string | null;
}

export interface SimulationCashTile {
  type: "cash";
  id: string;
  name: string;
  reward: number;
}

export type SimulationTile = SimulationStationTile | SimulationCashTile;

export interface SimulationPreset {
  id: string;
  label: string;
  board: SimulationTile[];
}
```

Create `src/game/simulation/presets.ts` that:

- maps `KEY_STATIONS_PRESET` into `SimulationStationTile[]`
- exports `BASELINE_SIMULATION_PRESET`
- exports `CASH_TILE_VARIANT_PRESET`
- replaces `Choa Chu Kang LRT` with:

```ts
{
  type: "cash",
  id: "cash-top-up",
  name: "Cash Top-Up",
  reward: 500
}
```

**Step 4: Run the preset test to verify it passes**

Run: `npm run test -- src/game/simulation/presets.test.ts`
Expected: PASS with both presets defined and the variant board length unchanged.

**Step 5: Commit**

```bash
git add src/game/simulation/types.ts src/game/simulation/presets.ts src/game/simulation/presets.test.ts
git commit -m "feat: add simulation board presets"
```

### Task 2: Add purchase policy and tile-resolution logic

**Files:**
- Create: `src/game/simulation/policy.ts`
- Create: `src/game/simulation/engine.ts`
- Create: `src/game/simulation/engine.test.ts`

**Step 1: Write the failing engine tests**

Add `src/game/simulation/engine.test.ts` with focused landing-resolution coverage:

```ts
test("buys an unowned station when cash remains above the safety threshold", () => {
  const result = resolveLandingTurn({
    playerCash: 1200,
    safetyThreshold: 200,
    tile: {
      type: "station",
      id: "jurong-east",
      name: "Jurong East",
      price: 280,
      baseRent: 28,
      ownerId: null
    }
  });

  expect(result.player.cash).toBe(920);
  expect(result.player.ownedStationIds).toContain("jurong-east");
  expect(result.metrics.stationPurchases).toBe(1);
});

test("pays rent to another owner and bankrupts the payer when cash is insufficient", () => {
  const result = resolveLandingTurn({
    playerCash: 20,
    ownerCash: 1000,
    tile: {
      type: "station",
      id: "raffles-place",
      name: "Raffles Place",
      price: 360,
      baseRent: 36,
      ownerId: "p2"
    }
  });

  expect(result.player.status).toBe("bankrupt");
  expect(result.owner?.cash).toBe(1020);
  expect(result.metrics.rentPayments).toBe(1);
  expect(result.metrics.bankruptcies).toBe(1);
});

test("awards 500 dollars when landing on the cash tile", () => {
  const result = resolveLandingTurn({
    playerCash: 400,
    tile: {
      type: "cash",
      id: "cash-top-up",
      name: "Cash Top-Up",
      reward: 500
    }
  });

  expect(result.player.cash).toBe(900);
  expect(result.metrics.cashTileAwards).toBe(1);
});
```

**Step 2: Run the engine tests to verify they fail**

Run: `npm run test -- src/game/simulation/engine.test.ts`
Expected: FAIL because the engine and policy modules do not exist yet.

**Step 3: Write the minimal implementation**

Create `src/game/simulation/policy.ts` with a configurable policy helper:

```ts
export interface PurchasePolicy {
  safetyThreshold: number;
}

export function shouldBuyStation(
  currentCash: number,
  price: number,
  policy: PurchasePolicy
) {
  return currentCash - price >= policy.safetyThreshold;
}
```

Create `src/game/simulation/engine.ts` with a pure landing resolver that:

- buys unowned stations only when `shouldBuyStation` returns `true`
- pays rent with `payRent`
- awards cash for `type === "cash"`
- records per-turn metric counters for purchases, rent payments, bankruptcies, and cash-tile awards

Prefer a small exported helper such as:

```ts
export function resolveLandingTurn(input: ResolveLandingTurnInput) {
  // return updated player, optional owner, updated tile, and metric deltas
}
```

**Step 4: Run the engine tests to verify they pass**

Run: `npm run test -- src/game/simulation/engine.test.ts`
Expected: PASS with purchase, rent, and cash-award flows covered.

**Step 5: Commit**

```bash
git add src/game/simulation/policy.ts src/game/simulation/engine.ts src/game/simulation/engine.test.ts
git commit -m "feat: add simulation landing resolution"
```

### Task 3: Build the seeded runner and aggregate metrics

**Files:**
- Create: `src/game/simulation/rng.ts`
- Create: `src/game/simulation/runner.ts`
- Create: `src/game/simulation/runner.test.ts`

**Step 1: Write the failing runner tests**

Add `src/game/simulation/runner.test.ts` with seeded and comparison coverage:

```ts
import { describe, expect, test } from "vitest";
import {
  BASELINE_SIMULATION_PRESET,
  CASH_TILE_VARIANT_PRESET
} from "./presets";
import { runSimulationBatch } from "./runner";

describe("runSimulationBatch", () => {
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
```

**Step 2: Run the runner tests to verify they fail**

Run: `npm run test -- src/game/simulation/runner.test.ts`
Expected: FAIL because the batch runner does not exist yet.

**Step 3: Write the minimal implementation**

Create `src/game/simulation/rng.ts` with a deterministic seeded random-number generator.

Create `src/game/simulation/runner.ts` that:

- initializes a fresh simulation game state for each run
- creates 2 to 4 simulated players with starting cash based on the current default config
- rolls a seeded die from 1 to 6 each turn
- uses `movePosition`, `resolveLandingTurn`, `calculateNetWorth`, and `evaluateEndCondition`
- tracks and aggregates:
  - average rounds to finish
  - seat-index win counts
  - average ending cash
  - average ending net worth
  - station purchases
  - rent payments
  - bankruptcies
  - lead changes
  - tile landing counts
  - cash-tile awards
  - purchases enabled by a cash-tile award on the same turn or next turn

Expose a single entry point like:

```ts
export function runSimulationBatch(input: RunSimulationBatchInput): SimulationBatchSummary
```

**Step 4: Run the runner tests to verify they pass**

Run: `npm run test -- src/game/simulation/runner.test.ts`
Expected: PASS with deterministic summaries and a measurable baseline-vs-variant difference.

**Step 5: Commit**

```bash
git add src/game/simulation/rng.ts src/game/simulation/runner.ts src/game/simulation/runner.test.ts
git commit -m "feat: add seeded simulation runner"
```

### Task 4: Add terminal reporting and the npm simulate command

**Files:**
- Create: `src/game/simulation/report.ts`
- Create: `src/game/simulation/report.test.ts`
- Create: `scripts/run-simulation.ts`
- Modify: `package.json`
- Modify: `tsconfig.node.json`

**Step 1: Write the failing report test**

Add `src/game/simulation/report.test.ts` with a formatter assertion such as:

```ts
import { describe, expect, test } from "vitest";
import { formatSimulationComparison } from "./report";

describe("formatSimulationComparison", () => {
  test("renders a side-by-side report for baseline and variant summaries", () => {
    const output = formatSimulationComparison({
      baseline: {
        label: "Baseline",
        averageRounds: 18.4,
        totalCashTileAwards: 0
      },
      variant: {
        label: "Cash Tile Variant",
        averageRounds: 16.9,
        totalCashTileAwards: 42
      }
    });

    expect(output).toContain("Baseline");
    expect(output).toContain("Cash Tile Variant");
    expect(output).toContain("Average rounds");
    expect(output).toContain("Cash-tile awards");
  });
});
```

**Step 2: Run the report test to verify it fails**

Run: `npm run test -- src/game/simulation/report.test.ts`
Expected: FAIL because the formatter module does not exist yet.

**Step 3: Write the minimal implementation**

Create `src/game/simulation/report.ts` with a string formatter that prints:

- preset labels
- average rounds
- win-rate spread by seat
- average ending cash and net worth
- purchases, rent payments, and bankruptcies
- lead changes
- cash-tile awards
- purchase-enable counts

Create `scripts/run-simulation.ts` that:

- parses optional CLI flags such as `--games` and `--seed`
- runs `BASELINE_SIMULATION_PRESET` and `CASH_TILE_VARIANT_PRESET`
- prints the formatted comparison report to stdout

Modify `package.json`:

```json
{
  "scripts": {
    "simulate": "tsx scripts/run-simulation.ts"
  },
  "devDependencies": {
    "tsx": "^4.19.2"
  }
}
```

Modify `tsconfig.node.json` so `scripts/**/*.ts` is type-checked:

```json
{
  "include": ["vite.config.ts", "playwright.config.ts", "scripts/**/*.ts"]
}
```

**Step 4: Run the report test and CLI command to verify them**

Run: `npm run test -- src/game/simulation/report.test.ts`
Expected: PASS with the formatted comparison labels present.

Run: `npm run simulate -- --games 200 --seed 20260314`
Expected: PASS with a terminal report that includes both preset names and metric rows.

**Step 5: Commit**

```bash
git add src/game/simulation/report.ts src/game/simulation/report.test.ts scripts/run-simulation.ts package.json tsconfig.node.json
git commit -m "feat: add simulation reporting command"
```

### Task 5: Run verification before calling the feature complete

**Files:**
- Verify only: `src/game/simulation/presets.test.ts`
- Verify only: `src/game/simulation/engine.test.ts`
- Verify only: `src/game/simulation/runner.test.ts`
- Verify only: `src/game/simulation/report.test.ts`
- Verify only: `package.json`
- Verify only: `scripts/run-simulation.ts`

**Step 1: Run all simulation-focused tests**

Run: `npm run test -- src/game/simulation/presets.test.ts src/game/simulation/engine.test.ts src/game/simulation/runner.test.ts src/game/simulation/report.test.ts`
Expected: PASS for the new simulation coverage.

**Step 2: Run the full test suite**

Run: `npm run test`
Expected: PASS with no regressions outside the simulation module.

**Step 3: Run type-checking**

Run: `npm run lint`
Expected: PASS, including the new `scripts/run-simulation.ts` entrypoint.

**Step 4: Run the simulator with a larger sample**

Run: `npm run simulate -- --games 1000 --seed 20260314`
Expected: PASS with a stable comparison report and non-zero cash-tile award counts in the variant.

**Step 5: Commit verification state**

```bash
git add src/game/simulation package.json tsconfig.node.json scripts/run-simulation.ts
git commit -m "test: verify cash tile simulation"
```
