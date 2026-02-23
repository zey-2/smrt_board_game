# SMRT Monopoly V1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a desktop-first React web game for 2-4 local pass-and-play players with SMRT key-station property mechanics and player-voted end conditions.

**Architecture:** Use a pure TypeScript rules engine plus a React reducer-driven UI shell. Keep game logic deterministic, validate actions in the rules engine, and persist state to localStorage after each accepted action.

**Tech Stack:** React, TypeScript, Vite, Vitest, React Testing Library, Playwright

---

**Skill references for implementation:** `@superpowers/test-driven-development`, `@superpowers/verification-before-completion`

### Task 1: Scaffold project and baseline scripts

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `README.md`
- Test: `npm run build`

**Step 1: Write the failing test**

```bash
npm run build
```

Expected: FAIL with missing project files and dependencies.

**Step 2: Run test to verify it fails**

Run: `npm run build`  
Expected: command not found or missing config error.

**Step 3: Write minimal implementation**

```tsx
// src/App.tsx
export default function App() {
  return <h1>SMRT Monopoly</h1>;
}
```

**Step 4: Run test to verify it passes**

Run: `npm install && npm run build`  
Expected: PASS, Vite build output generated.

**Step 5: Commit**

```bash
git add package.json vite.config.ts tsconfig.json index.html src/main.tsx src/App.tsx src/styles.css README.md
git commit -m "chore: scaffold react typescript vite app"
```

### Task 2: Configure unit and UI test harness

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `vitest.setup.ts`
- Create: `src/App.test.tsx`
- Test: `src/App.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/App.test.tsx
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders title", () => {
  render(<App />);
  expect(screen.getByText("SMRT Monopoly")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/App.test.tsx -t "renders title"`  
Expected: FAIL due to missing Vitest/RTL config.

**Step 3: Write minimal implementation**

```ts
// vitest.setup.ts
import "@testing-library/jest-dom";
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/App.test.tsx -t "renders title"`  
Expected: PASS (1 test passed).

**Step 5: Commit**

```bash
git add package.json vite.config.ts vitest.setup.ts src/App.test.tsx
git commit -m "test: add vitest and react testing library setup"
```

### Task 3: Define domain types and key-station board preset

**Files:**
- Create: `src/game/types.ts`
- Create: `src/game/constants/stations.ts`
- Create: `src/game/constants/endConditions.ts`
- Test: `src/game/constants/stations.test.ts`

**Step 1: Write the failing test**

```ts
import { KEY_STATIONS_PRESET } from "./stations";

test("has at least 22 key stations and unique ids", () => {
  expect(KEY_STATIONS_PRESET.length).toBeGreaterThanOrEqual(22);
  const ids = new Set(KEY_STATIONS_PRESET.map((s) => s.id));
  expect(ids.size).toBe(KEY_STATIONS_PRESET.length);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/game/constants/stations.test.ts`  
Expected: FAIL because constants file does not exist.

**Step 3: Write minimal implementation**

```ts
// src/game/constants/stations.ts
export const KEY_STATIONS_PRESET = [
  { id: "jurong-east", name: "Jurong East", line: "EWL", price: 240, baseRent: 24, group: "west" }
];
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/game/constants/stations.test.ts`  
Expected: PASS after expanding list to target size and unique ids.

**Step 5: Commit**

```bash
git add src/game/types.ts src/game/constants/stations.ts src/game/constants/endConditions.ts src/game/constants/stations.test.ts
git commit -m "feat: add core domain types and key station preset"
```

### Task 4: Implement movement rules with reducer-safe pure function

**Files:**
- Create: `src/game/rules/movement.ts`
- Test: `src/game/rules/movement.test.ts`

**Step 1: Write the failing test**

```ts
import { movePosition } from "./movement";

test("wraps around board when moving past last tile", () => {
  expect(movePosition(20, 5, 22)).toBe(3);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/game/rules/movement.test.ts`  
Expected: FAIL (module/function missing).

**Step 3: Write minimal implementation**

```ts
export function movePosition(current: number, steps: number, boardSize: number) {
  return (current + steps) % boardSize;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/game/rules/movement.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/game/rules/movement.ts src/game/rules/movement.test.ts
git commit -m "feat: add movement rule with board wrap"
```

### Task 5: Implement property purchase and rent rules

**Files:**
- Create: `src/game/rules/economy.ts`
- Test: `src/game/rules/economy.test.ts`

**Step 1: Write the failing test**

```ts
import { buyStation, payRent } from "./economy";

test("prevents buying when cash is insufficient", () => {
  const result = buyStation({ cash: 100 }, { price: 200 });
  expect(result.ok).toBe(false);
  expect(result.reason).toBe("Insufficient cash");
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/game/rules/economy.test.ts`  
Expected: FAIL.

**Step 3: Write minimal implementation**

```ts
export function buyStation(player: { cash: number }, tile: { price: number }) {
  if (player.cash < tile.price) return { ok: false, reason: "Insufficient cash" };
  return { ok: true };
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/game/rules/economy.test.ts`  
Expected: PASS, then add rent transfer and bankruptcy tests until passing.

**Step 5: Commit**

```bash
git add src/game/rules/economy.ts src/game/rules/economy.test.ts
git commit -m "feat: add purchase and rent economy rules"
```

### Task 6: Implement end-condition evaluators

**Files:**
- Create: `src/game/rules/endConditions.ts`
- Test: `src/game/rules/endConditions.test.ts`

**Step 1: Write the failing test**

```ts
import { evaluateEndCondition } from "./endConditions";

test("detects winner by target wealth", () => {
  const winner = evaluateEndCondition("TARGET_WEALTH", {
    players: [{ id: "p1", netWorth: 8000 }, { id: "p2", netWorth: 6200 }]
  });
  expect(winner).toBe("p1");
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/game/rules/endConditions.test.ts`  
Expected: FAIL.

**Step 3: Write minimal implementation**

```ts
export function evaluateEndCondition(mode: string, state: any): string | null {
  if (mode === "TARGET_WEALTH") return state.players.find((p: any) => p.netWorth >= 8000)?.id ?? null;
  return null;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/game/rules/endConditions.test.ts`  
Expected: PASS; extend to fixed-round and last-player-standing until green.

**Step 5: Commit**

```bash
git add src/game/rules/endConditions.ts src/game/rules/endConditions.test.ts
git commit -m "feat: add end condition evaluation rules"
```

### Task 7: Build central reducer and action contracts

**Files:**
- Create: `src/game/state/actions.ts`
- Create: `src/game/state/reducer.ts`
- Create: `src/game/state/initialState.ts`
- Test: `src/game/state/reducer.test.ts`

**Step 1: Write the failing test**

```ts
import { reducer } from "./reducer";
import { initialState } from "./initialState";

test("rejects BUY_STATION when tile already owned", () => {
  const result = reducer(initialState, { type: "BUY_STATION" });
  expect(result.pendingMessage).toBe("Tile already owned");
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/game/state/reducer.test.ts`  
Expected: FAIL.

**Step 3: Write minimal implementation**

```ts
export function reducer(state: any, action: any) {
  if (action.type === "BUY_STATION") return { ...state, pendingMessage: "Tile already owned" };
  return state;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/game/state/reducer.test.ts`  
Expected: PASS; iterate to support roll, move, pay rent, end turn.

**Step 5: Commit**

```bash
git add src/game/state/actions.ts src/game/state/reducer.ts src/game/state/initialState.ts src/game/state/reducer.test.ts
git commit -m "feat: add deterministic game reducer and actions"
```

### Task 8: Build setup screen with player-voted end condition

**Files:**
- Create: `src/features/setup/SetupScreen.tsx`
- Create: `src/features/setup/setupValidation.ts`
- Test: `src/features/setup/SetupScreen.test.tsx`
- Modify: `src/App.tsx`

**Step 1: Write the failing test**

```tsx
test("requires majority-voted end condition before start", async () => {
  // render setup and click start without vote
  // expect validation message
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/setup/SetupScreen.test.tsx`  
Expected: FAIL.

**Step 3: Write minimal implementation**

```tsx
export function SetupScreen() {
  return <button disabled>Start Game</button>;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/setup/SetupScreen.test.tsx`  
Expected: PASS after implementing vote inputs and validation.

**Step 5: Commit**

```bash
git add src/features/setup/SetupScreen.tsx src/features/setup/setupValidation.ts src/features/setup/SetupScreen.test.tsx src/App.tsx
git commit -m "feat: add setup flow and voted end condition selection"
```

### Task 9: Build board rendering and turn action controls

**Files:**
- Create: `src/features/game/BoardView.tsx`
- Create: `src/features/game/PlayerPanel.tsx`
- Create: `src/features/game/TurnControls.tsx`
- Create: `src/features/game/GameScreen.tsx`
- Test: `src/features/game/GameScreen.test.tsx`
- Modify: `src/App.tsx`

**Step 1: Write the failing test**

```tsx
test("allows current player to roll and attempts tile resolution", async () => {
  // render GameScreen and click Roll Dice
  // expect phase text to change from "idle" to "resolve_tile"
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/game/GameScreen.test.tsx`  
Expected: FAIL.

**Step 3: Write minimal implementation**

```tsx
export function TurnControls() {
  return <button>Roll Dice</button>;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/game/GameScreen.test.tsx`  
Expected: PASS after wiring reducer actions.

**Step 5: Commit**

```bash
git add src/features/game/BoardView.tsx src/features/game/PlayerPanel.tsx src/features/game/TurnControls.tsx src/features/game/GameScreen.tsx src/features/game/GameScreen.test.tsx src/App.tsx
git commit -m "feat: add board rendering and turn controls"
```

### Task 10: Add pass-device handoff and local persistence

**Files:**
- Create: `src/features/game/PassDeviceOverlay.tsx`
- Create: `src/game/persistence/localSave.ts`
- Test: `src/features/game/PassDeviceOverlay.test.tsx`
- Test: `src/game/persistence/localSave.test.ts`
- Modify: `src/features/game/GameScreen.tsx`

**Step 1: Write the failing test**

```tsx
test("shows handoff overlay before next player turn", () => {
  // transition turn and assert overlay visible
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/game/PassDeviceOverlay.test.tsx`  
Expected: FAIL.

**Step 3: Write minimal implementation**

```tsx
export function PassDeviceOverlay() {
  return <div>Pass device to next player</div>;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/game/PassDeviceOverlay.test.tsx src/game/persistence/localSave.test.ts`  
Expected: PASS after save/restore logic is added.

**Step 5: Commit**

```bash
git add src/features/game/PassDeviceOverlay.tsx src/game/persistence/localSave.ts src/features/game/PassDeviceOverlay.test.tsx src/game/persistence/localSave.test.ts src/features/game/GameScreen.tsx
git commit -m "feat: add pass-device privacy overlay and local save restore"
```

### Task 11: Add winner screen and end-of-game ranking

**Files:**
- Create: `src/features/results/WinnerScreen.tsx`
- Test: `src/features/results/WinnerScreen.test.tsx`
- Modify: `src/features/game/GameScreen.tsx`

**Step 1: Write the failing test**

```tsx
test("renders winner and sorted net worth ranking", () => {
  // feed completed game state and verify winner/ranking text
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/results/WinnerScreen.test.tsx`  
Expected: FAIL.

**Step 3: Write minimal implementation**

```tsx
export function WinnerScreen() {
  return <h2>Winner</h2>;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/results/WinnerScreen.test.tsx`  
Expected: PASS after ranking logic is complete.

**Step 5: Commit**

```bash
git add src/features/results/WinnerScreen.tsx src/features/results/WinnerScreen.test.tsx src/features/game/GameScreen.tsx
git commit -m "feat: add end game winner and ranking screen"
```

### Task 12: End-to-end pass-and-play verification

**Files:**
- Create: `tests/e2e/pass-and-play.spec.ts`
- Modify: `package.json`
- Test: `tests/e2e/pass-and-play.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from "@playwright/test";

test("setup to winner flow works for 2 players", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("SMRT Monopoly")).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/pass-and-play.spec.ts`  
Expected: FAIL before Playwright config and selectors are implemented.

**Step 3: Write minimal implementation**

```ts
// add playwright config and minimal selectors for setup/game/result screens
```

**Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- tests/e2e/pass-and-play.spec.ts`  
Expected: PASS (1 test passed).

**Step 5: Commit**

```bash
git add tests/e2e/pass-and-play.spec.ts package.json playwright.config.ts
git commit -m "test: add e2e pass-and-play game flow coverage"
```

### Task 13: Verification, docs, and release note

**Files:**
- Modify: `README.md`
- Create: `docs/game-rules-v1.md`

**Step 1: Write the failing test**

```bash
npm run lint && npm run test && npm run build
```

Expected: FAIL until all commands and docs references are consistent.

**Step 2: Run test to verify it fails**

Run: `npm run lint && npm run test && npm run build`  
Expected: at least one failure before final fixes.

**Step 3: Write minimal implementation**

```md
# docs/game-rules-v1.md
- Setup flow
- Turn flow
- End conditions
```

**Step 4: Run test to verify it passes**

Run: `npm run lint && npm run test && npm run build && npm run test:e2e`  
Expected: all PASS.

**Step 5: Commit**

```bash
git add README.md docs/game-rules-v1.md
git commit -m "docs: finalize v1 rules and runbook"
```

