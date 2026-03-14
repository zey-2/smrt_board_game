# Player Background Colors Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the global player background colour options and defaults with Orange, Purple, Pink, and Yellow.

**Architecture:** Keep `PLAYER_COLOR_OPTIONS` as the single source of truth and update its ids, labels, and swatches. Let setup defaults and token rendering continue to derive from that shared list, and update the tests that assert the current palette directly.

**Tech Stack:** React, TypeScript, Vitest, React Testing Library

---

**Skill references for implementation:** `@superpowers/test-driven-development`, `@superpowers/verification-before-completion`

### Task 1: Update tests to expect the new palette

**Files:**
- Modify: `src/features/setup/SetupScreen.test.tsx`
- Modify: `src/game/state/initialState.test.ts`
- Read for context: `src/features/players/playerAppearance.tsx`
- Read for context: `src/game/state/initialState.ts`

**Step 1: Write the failing test**

Update the setup tests to expect:
- Player 1 default colour label `Orange`
- Player 2 default colour label `Purple`
- selectable label `Yellow` instead of the old `Gold`
- validation scenarios using the new colour ids

Keep the initial-state test asserting that player defaults come from the first two entries in `PLAYER_COLOR_OPTIONS`.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx src/game/state/initialState.test.ts`
Expected: FAIL because the source palette still uses the old colors.

**Step 3: Write minimal implementation**

Implement only enough source changes to satisfy the updated color expectations.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx src/game/state/initialState.test.ts`
Expected: PASS

### Task 2: Replace the shared player color option set

**Files:**
- Modify: `src/features/players/playerAppearance.tsx`
- Test: `src/features/setup/SetupScreen.test.tsx`
- Test: `src/game/state/initialState.test.ts`

**Step 1: Use the failing tests from Task 1**

Keep the updated color regression tests active while changing the source palette.

**Step 2: Write minimal implementation**

Replace the old color ids, labels, and swatches with:
- `orange`
- `purple`
- `pink`
- `yellow`

Choose foreground colors that keep the token icons legible.

**Step 3: Run targeted verification**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx src/game/state/initialState.test.ts`
Expected: PASS

### Task 3: Verify the touched appearance surface

**Files:**
- Test: `src/features/setup/SetupScreen.test.tsx`
- Test: `src/game/state/initialState.test.ts`

**Step 1: Run final targeted verification**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx src/game/state/initialState.test.ts`
Expected: PASS
