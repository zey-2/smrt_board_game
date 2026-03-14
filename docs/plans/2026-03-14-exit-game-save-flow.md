# Exit Game Save Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add explicit `Exit Game With Save` and `Exit Game Without Save` actions that return players to setup while preserving or removing resumable state as intended.

**Architecture:** `App` owns the setup/game navigation and passes exit callbacks into `GameScreen`. `GameScreen` renders the exit actions inside the existing control panel and reports its current reducer state upward. Persistence logic stays in `src/game/persistence/localSave.ts`, including a new helper to clear saved state.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, browser localStorage

---

### Task 1: Add app-level regression tests for exit actions

**Files:**
- Modify: `src/App.test.tsx`
- Read for context: `src/App.tsx`

**Step 1: Write the failing test**

Add one test that starts a game, performs an in-game action so state is saved, clicks `Exit Game With Save`, and expects the setup screen to show `Saved Game Found`.

Add one test that starts a game, performs an in-game action so state exists, clicks `Exit Game Without Save`, and expects the setup screen to hide `Saved Game Found`.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/App.test.tsx`
Expected: FAIL because the game screen does not render the exit buttons yet.

**Step 3: Write minimal implementation**

Implement only the code needed to surface the buttons and wire them through `App`.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/App.test.tsx`
Expected: PASS

### Task 2: Add persistence support for clearing saved state

**Files:**
- Modify: `src/game/persistence/localSave.ts`
- Modify: `src/game/persistence/localSave.test.ts`

**Step 1: Write the failing test**

Add a test that saves game state, clears it through a new helper, and verifies `loadGameState()` returns `null`.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/game/persistence/localSave.test.ts`
Expected: FAIL because the clear helper does not exist yet.

**Step 3: Write minimal implementation**

Add `clearSavedGameState()` that removes the storage key.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/game/persistence/localSave.test.ts`
Expected: PASS

### Task 3: Wire exit callbacks through the app and game screen

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/features/game/GameScreen.tsx`
- Modify: `src/features/game/TurnControls.tsx`
- Test: `src/App.test.tsx`

**Step 1: Write the failing test**

Use the app-level tests from Task 1 as the active regression coverage.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/App.test.tsx`
Expected: FAIL until the props and buttons are connected.

**Step 3: Write minimal implementation**

In `App`, keep the current game state synchronized, save on explicit exit-with-save, clear saved state on explicit exit-without-save, and return to setup in both cases.

In `GameScreen`, expose the reducer state to exit handlers.

In `TurnControls`, render the two new buttons alongside the turn controls.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/App.test.tsx`
Expected: PASS

### Task 4: Verify the changed areas together

**Files:**
- Test: `src/App.test.tsx`
- Test: `src/game/persistence/localSave.test.ts`
- Optional smoke check: `src/features/game/GameScreen.test.tsx`

**Step 1: Run targeted verification**

Run: `npm test -- src/App.test.tsx src/game/persistence/localSave.test.ts src/features/game/GameScreen.test.tsx`

**Step 2: Confirm expected outcome**

Expected: all targeted tests pass with no new failures in the touched areas.
