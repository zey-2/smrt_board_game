# Transport Fare Revamp Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace fixed station rent with a distance-based transport fare, thread that rule through the live game and simulator, and calibrate a default fare rate that materially shortens the 2-player classic game.

**Architecture:** Add one shared `transportFareRate` config value and a small economy helper that computes and transfers transport fare as `steps × rate`. Keep the live turn loop familiar by auto-resolving owned-station arrivals into `turn_end`, while unowned arrivals still pause for buy-or-skip. Update the simulator to use the same fare rule, then sweep fare-rate candidates with the CLI to choose a default.

**Tech Stack:** TypeScript, React, Node CLI, Vitest

---

### Task 1: Add transport-fare defaults and economy helpers

**Files:**
- Create: `src/game/constants/economyDefaults.ts`
- Create: `src/game/constants/economyDefaults.test.ts`
- Modify: `src/game/types.ts`
- Modify: `src/game/rules/economy.ts`
- Modify: `src/game/rules/economy.test.ts`
- Modify: `src/game/constants/gameModeOptions.ts`
- Modify: `src/game/constants/gameModeOptions.test.ts`
- Modify: `src/game/state/initialState.ts`
- Modify: `src/game/state/initialState.test.ts`
- Modify: `src/features/setup/setupValidation.ts`
- Modify: `src/features/setup/SetupScreen.test.tsx`

**Step 1: Write the failing transport-fare and default-config tests**

Extend `src/game/rules/economy.test.ts` with coverage like:

```ts
import {
  buyStation,
  calculateNetWorth,
  calculateTransportFare,
  payTransportFare
} from "./economy";

describe("calculateTransportFare", () => {
  test("multiplies travelled steps by the shared fare rate", () => {
    expect(calculateTransportFare(4, 25)).toBe(100);
  });
});

describe("payTransportFare", () => {
  test("transfers the full fare to the destination owner when the payer has enough cash", () => {
    const result = payTransportFare(
      { id: "payer", cash: 240, status: "active" },
      { id: "owner", cash: 500, status: "active" },
      120
    );

    expect(result.payer.cash).toBe(120);
    expect(result.owner.cash).toBe(620);
    expect(result.payer.status).toBe("active");
  });
});
```

Create `src/game/constants/economyDefaults.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import {
  DEFAULT_INITIAL_CASH,
  DEFAULT_TARGET_WEALTH,
  DEFAULT_TRANSPORT_FARE_RATE
} from "./economyDefaults";

describe("economy defaults", () => {
  test("exports a shared transport fare rate for live and simulated games", () => {
    expect(DEFAULT_INITIAL_CASH).toBe(1500);
    expect(DEFAULT_TARGET_WEALTH).toBe(8000);
    expect(DEFAULT_TRANSPORT_FARE_RATE).toBe(25);
  });
});
```

Update `src/game/constants/gameModeOptions.test.ts` and `src/game/state/initialState.test.ts` so they assert `transportFareRate` is present on built configs and initial state.

Update `src/features/setup/SetupScreen.test.tsx` setup payload expectations so they include `transportFareRate: DEFAULT_TRANSPORT_FARE_RATE`.

**Step 2: Run the focused tests to verify they fail**

Run:

```bash
npm run test -- src/game/rules/economy.test.ts src/game/constants/economyDefaults.test.ts src/game/constants/gameModeOptions.test.ts src/game/state/initialState.test.ts src/features/setup/SetupScreen.test.tsx
```

Expected: FAIL because the transport-fare helpers and shared defaults do not exist yet.

**Step 3: Write the minimal implementation**

Create `src/game/constants/economyDefaults.ts`:

```ts
export const DEFAULT_INITIAL_CASH = 1500;
export const DEFAULT_TARGET_WEALTH = 8000;
export const DEFAULT_TRANSPORT_FARE_RATE = 25;
```

Update `src/game/types.ts` so `GameConfig` includes:

```ts
transportFareRate: number;
```

Extend `src/game/rules/economy.ts` with:

```ts
export function calculateTransportFare(steps: number, rate: number): number {
  return steps * rate;
}

export function payTransportFare(
  payer: EconomyPlayer,
  owner: EconomyPlayer,
  fare: number
) {
  return payRent(payer, owner, fare);
}
```

Replace scattered `1500` and `8000` literals in:

- `src/game/constants/gameModeOptions.ts`
- `src/game/state/initialState.ts`
- `src/features/setup/setupValidation.ts`

with imports from `economyDefaults.ts`, and thread `transportFareRate: DEFAULT_TRANSPORT_FARE_RATE` into every default `GameConfig`.

**Step 4: Run the focused tests to verify they pass**

Run:

```bash
npm run test -- src/game/rules/economy.test.ts src/game/constants/economyDefaults.test.ts src/game/constants/gameModeOptions.test.ts src/game/state/initialState.test.ts src/features/setup/SetupScreen.test.tsx
```

Expected: PASS with shared defaults and transport-fare helpers wired in.

**Step 5: Commit**

```bash
git add src/game/constants/economyDefaults.ts src/game/constants/economyDefaults.test.ts src/game/types.ts src/game/rules/economy.ts src/game/rules/economy.test.ts src/game/constants/gameModeOptions.ts src/game/constants/gameModeOptions.test.ts src/game/state/initialState.ts src/game/state/initialState.test.ts src/features/setup/setupValidation.ts src/features/setup/SetupScreen.test.tsx
git commit -m "feat: add transport fare defaults"
```

### Task 2: Apply transport fare to live turn resolution and UI text

**Files:**
- Modify: `src/game/state/reducer.ts`
- Modify: `src/game/state/reducer.test.ts`
- Modify: `src/features/game/BoardView.tsx`
- Modify: `src/features/game/GameScreen.test.tsx`
- Modify: `src/features/game/TurnControls.tsx`

**Step 1: Write the failing reducer and UI tests**

Add reducer coverage in `src/game/state/reducer.test.ts` like:

```ts
test("charges transport fare and ends the resolution step immediately when landing on another player's station", () => {
  const state = createGameState(
    [
      { ...initialState.players[0], id: "p1", cash: 500, position: 0 },
      { ...initialState.players[1], id: "p2", cash: 700, position: 0, ownedStationIds: ["queenstown"] }
    ],
    initialState.config
  );
  state.board = state.board.map((tile) =>
    tile.id === "queenstown" ? { ...tile, ownerId: "p2" } : tile
  );

  const next = reducer(state, { type: "ROLL_DICE", payload: { value: 3 } });

  expect(next.players[0].position).toBe(3);
  expect(next.players[0].cash).toBe(425);
  expect(next.players[1].cash).toBe(775);
  expect(next.phase).toBe("turn_end");
  expect(next.pendingMessage).toContain("transport fare");
});

test("keeps unowned destinations in resolve_tile so the player can buy", () => {
  const next = reducer(initialState, { type: "ROLL_DICE", payload: { value: 1 } });

  expect(next.phase).toBe("resolve_tile");
  expect(next.pendingMessage).toBeNull();
});
```

Add UI coverage in `src/features/game/GameScreen.test.tsx` like:

```ts
test("does not render per-station rent labels on the board", () => {
  render(<GameScreen initial={initialState} />);

  expect(screen.queryByText(/Rent /i)).not.toBeInTheDocument();
  expect(screen.getByText(/Fare rate/i)).toBeInTheDocument();
});
```

**Step 2: Run the reducer and UI tests to verify they fail**

Run:

```bash
npm run test -- src/game/state/reducer.test.ts src/features/game/GameScreen.test.tsx
```

Expected: FAIL because the reducer still leaves owned-station arrivals unresolved and the board still shows `Rent`.

**Step 3: Write the minimal implementation**

Update `src/game/state/reducer.ts` so `ROLL_DICE`:

- computes `nextPosition` as today
- reads the rolled steps from `action.payload.value`
- if the destination is owned by another player, calculates `steps × state.config.transportFareRate`, transfers it with `payTransportFare`, updates both players, logs the message, and moves straight to `turn_end`
- if the destination is self-owned, moves straight to `turn_end`
- if the destination is unowned, keeps `phase: "resolve_tile"` so buy/skip still works

Prefer a small internal helper like:

```ts
function resolveOwnedStationArrival(
  state: GameState,
  playerIndex: number,
  steps: number,
  nextPosition: number
): GameState
```

Update `src/features/game/TurnControls.tsx` so buy/skip actions only appear for unowned destinations in `resolve_tile`.

Update `src/features/game/BoardView.tsx` to remove the stale per-station rent label and replace it with either:

- a fare-rate summary in the board header, or
- a second station metric that does not imply station-specific rent

Keep the change narrow and consistent with the design.

**Step 4: Run the reducer and UI tests to verify they pass**

Run:

```bash
npm run test -- src/game/state/reducer.test.ts src/features/game/GameScreen.test.tsx
```

Expected: PASS with owned stations auto-resolving and no stale rent language left on the board.

**Step 5: Commit**

```bash
git add src/game/state/reducer.ts src/game/state/reducer.test.ts src/features/game/BoardView.tsx src/features/game/GameScreen.test.tsx src/features/game/TurnControls.tsx
git commit -m "feat: apply transport fare in live gameplay"
```

### Task 3: Update the simulator and reports for transport fare

**Files:**
- Modify: `src/game/simulation/types.ts`
- Modify: `src/game/simulation/engine.ts`
- Modify: `src/game/simulation/engine.test.ts`
- Modify: `src/game/simulation/runner.ts`
- Modify: `src/game/simulation/runner.test.ts`
- Modify: `src/game/simulation/report.ts`
- Modify: `src/game/simulation/report.test.ts`

**Step 1: Write the failing simulation tests**

Extend `src/game/simulation/engine.test.ts` with coverage like:

```ts
test("charges transport fare based on travelled steps when landing on an owned station", () => {
  const result = resolveLandingTurn({
    player: { id: "p1", cash: 300, position: 0, status: "active", ownedStationIds: [] },
    owner: { id: "p2", cash: 500, position: 3, status: "active", ownedStationIds: ["queenstown"] },
    tile: {
      type: "station",
      id: "queenstown",
      name: "Queenstown",
      price: 220,
      baseRent: 22,
      ownerId: "p2"
    },
    travelSteps: 3,
    transportFareRate: 25,
    policy: { safetyThreshold: 200 }
  });

  expect(result.player.cash).toBe(225);
  expect(result.owner?.cash).toBe(575);
  expect(result.metrics.transportFarePayments).toBe(1);
});
```

Update `src/game/simulation/runner.test.ts` and `src/game/simulation/report.test.ts` so they assert `transport fare payments` instead of `rent payments`.

**Step 2: Run the simulation tests to verify they fail**

Run:

```bash
npm run test -- src/game/simulation/engine.test.ts src/game/simulation/runner.test.ts src/game/simulation/report.test.ts
```

Expected: FAIL because the simulator still uses station `baseRent` and old metric names.

**Step 3: Write the minimal implementation**

Update `src/game/simulation/types.ts` so metric naming matches the new rule:

```ts
transportFarePayments: number;
```

Update `src/game/simulation/engine.ts` so `ResolveLandingTurnInput` includes:

```ts
travelSteps: number;
transportFareRate: number;
```

When a player lands on another player's station:

- compute fare with `calculateTransportFare(travelSteps, transportFareRate)`
- transfer with `payTransportFare`
- increment `transportFarePayments`

Update `src/game/simulation/runner.ts` so `SimulationConfig` includes `transportFareRate`, and pass the rolled die value into `resolveLandingTurn`.

Update `src/game/simulation/report.ts` so the report label says `Transport fare payments`.

**Step 4: Run the simulation tests to verify they pass**

Run:

```bash
npm run test -- src/game/simulation/engine.test.ts src/game/simulation/runner.test.ts src/game/simulation/report.test.ts
```

Expected: PASS with distance-based fare resolution active in the simulator.

**Step 5: Commit**

```bash
git add src/game/simulation/types.ts src/game/simulation/engine.ts src/game/simulation/engine.test.ts src/game/simulation/runner.ts src/game/simulation/runner.test.ts src/game/simulation/report.ts src/game/simulation/report.test.ts
git commit -m "feat: simulate transport fare economy"
```

### Task 4: Add fare-rate calibration mode and choose the default

**Files:**
- Modify: `src/game/simulation/calibration.ts`
- Modify: `src/game/simulation/calibration.test.ts`
- Modify: `src/game/simulation/cliOptions.ts`
- Modify: `src/game/simulation/cliOptions.test.ts`
- Modify: `src/game/simulation/calibrationReport.ts`
- Modify: `src/game/simulation/calibrationReport.test.ts`
- Modify: `scripts/run-simulation.ts`
- Modify: `src/game/constants/economyDefaults.ts`
- Modify: `src/game/constants/economyDefaults.test.ts`

**Step 1: Write the failing calibration tests**

Update `src/game/simulation/calibration.test.ts` so it ranks `transportFareRate` values instead of `initialCash`:

```ts
test("passes each candidate transport fare rate to the simulation runner and sorts by closeness to the target", () => {
  const calls: number[] = [];

  const results = rankTransportFareCandidates({
    minRate: 10,
    maxRate: 30,
    step: 10,
    targetRounds: 20,
    gameCount: 200,
    seed: 20260314,
    runBatch: ({ simulationConfig }) => {
      calls.push(simulationConfig.transportFareRate);

      const averages: Record<number, number> = {
        10: 90,
        20: 32,
        30: 18
      };

      return createBatchSummary(averages[simulationConfig.transportFareRate]);
    }
  });

  expect(calls).toEqual([10, 20, 30]);
  expect(results[0].transportFareRate).toBe(30);
});
```

Update `src/game/simulation/cliOptions.test.ts` and `src/game/simulation/calibrationReport.test.ts` so they parse and print `--calibrate-transport-fare`, `--fare-min`, `--fare-max`, and `--fare-step`.

**Step 2: Run the calibration tests to verify they fail**

Run:

```bash
npm run test -- src/game/simulation/calibration.test.ts src/game/simulation/cliOptions.test.ts src/game/simulation/calibrationReport.test.ts src/game/constants/economyDefaults.test.ts
```

Expected: FAIL because the calibration flow still targets `initialCash`.

**Step 3: Write the minimal implementation**

Generalize or replace the calibration helpers so they sweep `transportFareRate` and produce ranked results with:

```ts
{
  transportFareRate,
  averageRounds,
  distanceFromTarget
}
```

Update `scripts/run-simulation.ts` so it supports:

```bash
npm run simulate -- --calibrate-transport-fare --games 2000 --seed 20260314 --fare-min 5 --fare-max 80 --fare-step 5
```

**Step 4: Run the calibration command and lock the default fare rate**

Run a coarse sweep first:

```bash
npm run simulate -- --calibrate-transport-fare --games 1000 --seed 20260314 --fare-min 5 --fare-max 80 --fare-step 5
```

If the best candidate is near a boundary, rerun with a wider range. Then run a tighter sweep around the best region:

```bash
npm run simulate -- --calibrate-transport-fare --games 2000 --seed 20260314 --fare-min <LOWER_BOUND> --fare-max <UPPER_BOUND> --fare-step 1
```

Update `DEFAULT_TRANSPORT_FARE_RATE` in `src/game/constants/economyDefaults.ts` to the chosen value and update `economyDefaults.test.ts` to assert that exact rate.

**Step 5: Run the calibration tests to verify they pass**

Run:

```bash
npm run test -- src/game/simulation/calibration.test.ts src/game/simulation/cliOptions.test.ts src/game/simulation/calibrationReport.test.ts src/game/constants/economyDefaults.test.ts
```

Expected: PASS with fare-rate calibration fully wired.

**Step 6: Commit**

```bash
git add src/game/simulation/calibration.ts src/game/simulation/calibration.test.ts src/game/simulation/cliOptions.ts src/game/simulation/cliOptions.test.ts src/game/simulation/calibrationReport.ts src/game/simulation/calibrationReport.test.ts scripts/run-simulation.ts src/game/constants/economyDefaults.ts src/game/constants/economyDefaults.test.ts
git commit -m "feat: calibrate transport fare rate"
```

### Task 5: Final verification

**Files:**
- Verify only: `src/game/rules/economy.ts`
- Verify only: `src/game/state/reducer.ts`
- Verify only: `src/game/simulation/engine.ts`
- Verify only: `src/game/simulation/runner.ts`
- Verify only: `scripts/run-simulation.ts`

**Step 1: Run the focused rule and simulation checks**

Run:

```bash
npm run test -- src/game/rules/economy.test.ts src/game/state/reducer.test.ts src/features/game/GameScreen.test.tsx src/game/simulation/engine.test.ts src/game/simulation/runner.test.ts src/game/simulation/report.test.ts src/game/simulation/calibration.test.ts src/game/simulation/cliOptions.test.ts src/game/simulation/calibrationReport.test.ts
```

Expected: PASS with transport-fare rule coverage green.

**Step 2: Run the full unit suite**

Run: `npm test`
Expected: PASS with all Vitest files green.

**Step 3: Run the new fare calibration command**

Run:

```bash
npm run simulate -- --calibrate-transport-fare --games 2000 --seed 20260314 --fare-min <LOWER_BOUND> --fare-max <UPPER_BOUND> --fare-step 1
```

Expected: a ranked fare-rate report with the chosen default at or near the top.

**Step 4: Run the standard simulation report**

Run: `npm run simulate -- --games 1000 --seed 20260314`
Expected: the simulator still prints the standard multi-scenario report using the new transport-fare economy.
