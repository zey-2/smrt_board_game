# Setup Header Spacing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the setup preset copy and normalize the vertical spacing above `End condition` and `Player 1 name`.

**Architecture:** Keep the setup screen component structure intact except for removing the preset paragraph. Move spacing responsibility into `src/styles.css` by making the setup card manage its own vertical flow, instead of relying on mixed default margins from headings and block elements.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, CSS

---

### Task 1: Lock the removed preset copy in a failing test

**Files:**
- Modify: `src/features/setup/SetupScreen.test.tsx`

**Step 1: Write the failing test**

Add a test asserting `Board preset: SMRT key stations` is not present on the setup screen.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx`
Expected: FAIL because the paragraph is still rendered.

### Task 2: Remove the preset line and define local setup spacing

**Files:**
- Modify: `src/features/setup/SetupScreen.tsx`
- Modify: `src/styles.css`

**Step 1: Remove the preset paragraph**

Delete the preset `<p>` from the setup section.

**Step 2: Make spacing explicit**

Update `.setup-card` in `src/styles.css` to manage a consistent vertical gap between direct child sections, reset the heading margin, remove the old per-row bottom margin, and keep the bottom button from stretching in the grid layout.

### Task 3: Verify setup behavior

**Files:**
- Test: `src/features/setup/SetupScreen.test.tsx`

**Step 1: Run targeted setup tests**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx`
Expected: PASS

**Step 2: Run broader coverage for the touched area**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx src/features/game/GameScreen.test.tsx`
Expected: PASS
