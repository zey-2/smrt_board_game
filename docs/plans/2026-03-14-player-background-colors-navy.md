# Player Background Colors Navy Revision Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Teal player background option with Navy while keeping Purple, Pink, and Cyan.

**Architecture:** Keep `PLAYER_COLOR_OPTIONS` as the shared source of truth and update only the first color entry, its id, label, and swatch. Let setup defaults and token rendering continue deriving from that list, and update the tests that assert the current palette directly.

**Tech Stack:** React, TypeScript, Vitest, React Testing Library

---

**Skill references for implementation:** `@superpowers/test-driven-development`, `@superpowers/verification-before-completion`

### Task 1: Update tests to expect Navy

**Files:**
- Modify: `src/features/setup/SetupScreen.test.tsx`
- Modify: `src/game/state/initialState.test.ts`
- Read for context: `src/features/players/playerAppearance.tsx`

**Step 1: Write the failing test**

Update the setup tests to expect:
- Player 1 default colour label `Navy`
- duplicate validation scenarios using `navy`
- selected token appearance using `navy`

Update the initial-state test to expect the ordered color ids `navy`, `purple`, `pink`, `cyan`.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx src/game/state/initialState.test.ts`
Expected: FAIL because the source palette still exposes Teal.

**Step 3: Write minimal implementation**

Implement only enough source changes to satisfy the updated color expectations.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx src/game/state/initialState.test.ts`
Expected: PASS

### Task 2: Replace the shared color entry

**Files:**
- Modify: `src/features/players/playerAppearance.tsx`
- Test: `src/features/setup/SetupScreen.test.tsx`
- Test: `src/game/state/initialState.test.ts`

**Step 1: Use the failing tests from Task 1**

Keep the updated regressions active while changing the shared player color list.

**Step 2: Write minimal implementation**

Replace:
- `teal` with `navy`

Use a dark navy swatch that keeps the token icons legible with a white foreground.

**Step 3: Run targeted verification**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx src/game/state/initialState.test.ts`
Expected: PASS

### Task 3: Verify the revised palette surface

**Files:**
- Test: `src/features/setup/SetupScreen.test.tsx`
- Test: `src/game/state/initialState.test.ts`

**Step 1: Run final targeted verification**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx src/game/state/initialState.test.ts`
Expected: PASS
