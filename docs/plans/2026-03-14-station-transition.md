# Station Transition Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Animate the active player's label through each station after a dice roll so movement is visible before tile resolution begins.

**Architecture:** Keep reducer state authoritative and synchronous. Add a pure movement-path helper for station playback, store short-lived animation state in `GameScreen`, and let `BoardView` render an optional animated player marker while controls stay locked until playback completes.

**Tech Stack:** React, TypeScript, Vitest, React Testing Library

---

**Skill references for implementation:** `@superpowers/test-driven-development`, `@superpowers/verification-before-completion`

### Task 1: Add movement-path rule coverage

**Files:**
- Modify: `src/game/rules/movement.ts`
- Modify: `src/game/rules/movement.test.ts`

**Step 1: Write the failing test**

Add tests for a new helper that returns every board index visited after a roll, including:
- a normal forward move such as `2 -> 5` on a 10-tile board producing `[3, 4, 5]`
- a wrap-around move such as `8 -> 2` on a 10-tile board producing `[9, 0, 1, 2]`

**Step 2: Run test to verify it fails**

Run: `npm test -- src/game/rules/movement.test.ts`
Expected: FAIL because the path helper does not exist yet.

**Step 3: Write minimal implementation**

Add a pure helper alongside `movePosition` that returns the ordered list of visited tile indexes for a given start position, step count, and board size.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/game/rules/movement.test.ts`
Expected: PASS

### Task 2: Add game-screen regression tests for movement playback

**Files:**
- Modify: `src/features/game/GameScreen.test.tsx`
- Read for context: `src/features/game/GameScreen.tsx`
- Read for context: `src/features/game/BoardView.tsx`

**Step 1: Write the failing test**

Add a test that:
- renders `GameScreen`
- rolls a deterministic dice value
- verifies the active player's label appears on at least one intermediate station before the final station
- verifies the destination station shows the player label after the animation completes

Use fake timers or timer control so the playback can be advanced deterministically.

Add a second test that verifies tile-resolution actions are not available until the playback completes.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/game/GameScreen.test.tsx`
Expected: FAIL because there is no animated transition state yet.

**Step 3: Write minimal implementation**

Implement only enough UI state and rendering hooks to satisfy the tests.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/game/GameScreen.test.tsx`
Expected: PASS

### Task 3: Implement animated station-to-station playback in the game UI

**Files:**
- Modify: `src/features/game/GameScreen.tsx`
- Modify: `src/features/game/BoardView.tsx`
- Modify: `src/features/game/TurnControls.tsx`
- Modify: `src/game/rules/movement.ts`
- Test: `src/features/game/GameScreen.test.tsx`

**Step 1: Use the failing tests from Tasks 1 and 2**

Keep the movement and game-screen regressions active while implementing.

**Step 2: Write minimal implementation**

In `GameScreen`, detect a new dice roll, derive the playback path for the current player, and advance a step index on a timer until the destination is reached.

In `BoardView`, merge the animated marker override with the persisted board state so the active player's label appears on the current playback tile.

In `TurnControls`, hide or disable resolve-tile actions while playback is in progress so the user cannot buy or skip purchase early.

**Step 3: Run targeted verification**

Run: `npm test -- src/game/rules/movement.test.ts src/features/game/GameScreen.test.tsx`
Expected: PASS

### Task 4: Verify the touched gameplay surface together

**Files:**
- Test: `src/features/game/GameScreen.test.tsx`
- Test: `src/game/rules/movement.test.ts`
- Test: `src/features/game/BoardView.tsx` via `GameScreen` coverage

**Step 1: Run final targeted verification**

Run: `npm test -- src/features/game/GameScreen.test.tsx src/game/rules/movement.test.ts`
Expected: PASS

**Step 2: Optional smoke check**

Run: `npm test -- src/features/game/TurnControls.tsx`
Expected: no direct test file exists; rely on `GameScreen` interaction coverage unless a new dedicated control test is added.
