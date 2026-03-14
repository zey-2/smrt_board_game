# Dog Breed Player Names Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `Player 1` / `Player 2` default player names with random dog breeds across setup defaults and shared fallback game state.

**Architecture:** Add a small shared helper that returns unique dog-breed names from a curated list. Use that helper in the setup screen for initial names and added players, and in game-state creation for default players so fallback state no longer uses hardcoded generic labels.

**Tech Stack:** React, TypeScript, Vitest, Testing Library

---

### Task 1: Lock the new naming behavior with tests

**Files:**
- Modify: `src/features/setup/SetupScreen.test.tsx`
- Create: `src/game/state/initialState.test.ts`

**Step 1: Write the failing test**

Add tests that verify:
- setup pre-fills player names with dog breeds instead of `Player 1` / `Player 2`
- adding a player uses another dog breed
- `createGameState()` defaults to dog-breed names

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx src/game/state/initialState.test.ts`
Expected: FAIL because the app still uses hardcoded `Player N` defaults.

### Task 2: Implement shared dog-breed default name generation

**Files:**
- Create: `src/game/defaultPlayerNames.ts`
- Modify: `src/features/setup/SetupScreen.tsx`
- Modify: `src/game/state/initialState.ts`

**Step 1: Write minimal implementation**

Create a helper that returns unique dog-breed names using `Math.random`, and reuse it for:
- initial setup names
- names appended by `Add Player`
- fallback default players in `createGameState()`

**Step 2: Run tests to verify they pass**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx src/game/state/initialState.test.ts`
Expected: PASS.

### Task 3: Verify related behavior stays intact

**Files:**
- Modify: `src/features/game/GameScreen.test.tsx`
- Modify: `src/game/persistence/localSave.test.ts`

**Step 1: Update assertions that depend on literal `Player 1` text**

Use the actual default player name from the state fixture rather than hardcoded legacy labels.

**Step 2: Run targeted regression tests**

Run: `npm test -- src/features/game/GameScreen.test.tsx src/game/persistence/localSave.test.ts src/App.test.tsx`
Expected: PASS.
