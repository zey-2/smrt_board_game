# Add 25th Station Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `Dhoby Ghaut` as the 25th board station so the wide desktop board fills a 5 by 5 grid.

**Architecture:** Keep the existing board rendering and layout unchanged. Update only the station preset data, then cover the new board size with focused tests so the 25-station outcome is explicit and protected.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library

---

### Task 1: Lock in the new board size with failing tests

**Files:**
- Modify: `src/game/constants/stations.test.ts`
- Modify: `src/features/game/GameScreen.test.tsx`

**Step 1: Write the failing preset test**

Add a stricter assertion in `src/game/constants/stations.test.ts`:

```ts
test("has exactly 25 key stations and unique ids", () => {
  expect(KEY_STATIONS_PRESET).toHaveLength(25);
  const ids = new Set(KEY_STATIONS_PRESET.map((station) => station.id));
  expect(ids.size).toBe(KEY_STATIONS_PRESET.length);
});
```

**Step 2: Run the preset test to verify it fails**

Run: `npm run test -- src/game/constants/stations.test.ts`
Expected: FAIL because the preset still contains 24 stations.

**Step 3: Write the failing game UI count test**

Add a UI assertion in `src/features/game/GameScreen.test.tsx`:

```ts
test("shows the updated 25-station board count", () => {
  render(<GameScreen initial={initialState} />);
  expect(screen.getByText("25 stations")).toBeInTheDocument();
});
```

**Step 4: Run the game UI test to verify it fails**

Run: `npm run test -- src/features/game/GameScreen.test.tsx -t "updated 25-station board count"`
Expected: FAIL because the header still shows `24 stations`.

**Step 5: Commit the red tests**

```bash
git add src/game/constants/stations.test.ts src/features/game/GameScreen.test.tsx
git commit -m "test: lock 25-station board size"
```

### Task 2: Add Dhoby Ghaut to the station preset

**Files:**
- Modify: `src/game/constants/stations.ts`

**Step 1: Write the minimal implementation**

Append this station object to the `STATIONS` array in `src/game/constants/stations.ts`:

```ts
{
  id: "dhoby-ghaut",
  name: "Dhoby Ghaut",
  line: "NSL",
  price: 320,
  baseRent: 32,
  group: "central-hub"
}
```

Place it after the existing final entry so the first 24 board indexes remain unchanged.

**Step 2: Run the preset test to verify it passes**

Run: `npm run test -- src/game/constants/stations.test.ts`
Expected: PASS with 25 unique stations.

**Step 3: Run the UI count test to verify it passes**

Run: `npm run test -- src/features/game/GameScreen.test.tsx -t "updated 25-station board count"`
Expected: PASS with `25 stations` rendered in the board header.

**Step 4: Commit the implementation**

```bash
git add src/game/constants/stations.ts src/game/constants/stations.test.ts src/features/game/GameScreen.test.tsx
git commit -m "feat: add dhoby ghaut as 25th station"
```

### Task 3: Run focused regression coverage

**Files:**
- Verify only: `src/features/game/GameScreen.test.tsx`
- Verify only: `src/game/rules/movement.test.ts`
- Verify only: `src/game/state/reducer.test.ts`

**Step 1: Run focused board and movement coverage**

Run: `npm run test -- src/features/game/GameScreen.test.tsx src/game/rules/movement.test.ts src/game/state/reducer.test.ts`
Expected: PASS with no new failures from the 25-tile board size.

**Step 2: Run the full test suite**

Run: `npm run test -- --run`
Expected: PASS for the full Vitest suite.

**Step 3: Commit verification state**

```bash
git add src/game/constants/stations.ts src/game/constants/stations.test.ts src/features/game/GameScreen.test.tsx
git commit -m "test: verify 25-station board coverage"
```
