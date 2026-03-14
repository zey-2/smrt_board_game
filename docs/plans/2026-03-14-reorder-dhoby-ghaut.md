# Reorder Dhoby Ghaut Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move `Dhoby Ghaut` into the North South line block so the preset order reads more coherently.

**Architecture:** Keep the board data model unchanged and adjust only the station ordering within `KEY_STATIONS_PRESET`. Protect the intended order with one focused preset test, then run the existing board checks to verify the 25-station setup still behaves correctly.

**Tech Stack:** TypeScript, Vitest, React Testing Library

---

### Task 1: Add a failing preset-order test

**Files:**
- Modify: `src/game/constants/stations.test.ts`

**Step 1: Write the failing test**

Add a test that extracts the preset ids and asserts this sequence:

```ts
expect(ids.slice(7, 14)).toEqual([
  "woodlands",
  "yishun",
  "bishan",
  "orchard",
  "dhoby-ghaut",
  "city-hall",
  "marina-south-pier"
]);
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/game/constants/stations.test.ts`
Expected: FAIL because `dhoby-ghaut` is still appended at the end.

**Step 3: Commit**

```bash
git add src/game/constants/stations.test.ts
git commit -m "test: lock dhoby ghaut nsl placement"
```

### Task 2: Reorder the station preset

**Files:**
- Modify: `src/game/constants/stations.ts`

**Step 1: Write minimal implementation**

Move the existing `Dhoby Ghaut` entry so it sits between `Orchard` and `City Hall`.

**Step 2: Run the preset test to verify it passes**

Run: `npm run test -- src/game/constants/stations.test.ts`
Expected: PASS with the intended NSL order and 25 unique stations.

**Step 3: Commit**

```bash
git add src/game/constants/stations.ts src/game/constants/stations.test.ts
git commit -m "refactor: reorder dhoby ghaut into nsl block"
```

### Task 3: Run regression coverage

**Files:**
- Verify only: `src/features/game/GameScreen.test.tsx`
- Verify only: `src/game/constants/stations.test.ts`

**Step 1: Run focused board verification**

Run: `npm run test -- src/game/constants/stations.test.ts src/features/game/GameScreen.test.tsx`
Expected: PASS.

**Step 2: Run the full suite**

Run: `npm run test -- --run`
Expected: PASS.
