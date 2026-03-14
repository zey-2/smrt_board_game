# Remove Interchange Badge Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the in-game `Interchange` badge from station tiles while leaving all gameplay behavior unchanged.

**Architecture:** The change stays in the board presentation layer. `BoardView` will stop checking for hardcoded interchange stations, and the obsolete badge-specific CSS will be removed so the board markup and styles remain consistent.

**Tech Stack:** React, TypeScript, CSS, Vitest, Testing Library

---

### Task 1: Prove the badge should not render

**Files:**
- Modify: `src/features/game/GameScreen.test.tsx`

**Step 1: Write the failing test**

Add a test that renders the game screen and asserts no `Interchange` text is present anywhere on the board.

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/game/GameScreen.test.tsx`
Expected: FAIL because the board still renders the `Interchange` badge for selected stations.

**Step 3: Write minimal implementation**

Remove the board badge render path so station tiles only show gameplay-relevant information.

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/game/GameScreen.test.tsx`
Expected: PASS

### Task 2: Remove dead board badge code

**Files:**
- Modify: `src/features/game/BoardView.tsx`
- Modify: `src/styles.css`

**Step 1: Write the failing test**

Use the new missing-badge assertion from Task 1 as the regression test for cleanup.

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/game/GameScreen.test.tsx`
Expected: FAIL until the badge constant/render path is removed.

**Step 3: Write minimal implementation**

Delete the hardcoded interchange station set, remove the conditional badge markup, and remove the unused `.station-flag` style block.

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/game/GameScreen.test.tsx`
Expected: PASS

### Task 3: Verify the board still builds cleanly

**Files:**
- Modify: `src/features/game/GameScreen.test.tsx`
- Modify: `src/features/game/BoardView.tsx`
- Modify: `src/styles.css`

**Step 1: Run focused verification**

Run: `npm run test -- src/features/game/GameScreen.test.tsx`
Expected: PASS

**Step 2: Run build verification**

Run: `npm run build`
Expected: PASS
