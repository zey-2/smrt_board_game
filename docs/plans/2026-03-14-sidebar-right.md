# Sidebar Right Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the in-game sidebar to the right of the board on desktop and below the board on mobile.

**Architecture:** Keep the existing CSS grid structure and change the order of the two children inside `.game-viewport`. Add a regression test that checks the rendered DOM order so the layout intent stays explicit.

**Tech Stack:** React 18, TypeScript, Vitest, Testing Library, Vite

---

### Task 1: Add a regression test for layout order

**Files:**
- Modify: `src/features/game/GameScreen.test.tsx`
- Test: `src/features/game/GameScreen.test.tsx`

**Step 1: Write the failing test**

Add a test that renders `GameScreen`, selects `.game-board-panel` and `.game-sidebar`, and asserts the board panel appears before the sidebar in the parent element.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/game/GameScreen.test.tsx`
Expected: FAIL in the new layout-order test because the sidebar currently renders first.

**Step 3: Write minimal implementation**

Update `src/features/game/GameScreen.tsx` so `BoardView` renders before the sidebar inside `.game-viewport`.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/game/GameScreen.test.tsx`
Expected: PASS with the new regression test and the existing game screen tests.

**Step 5: Commit**

```bash
git add docs/plans/2026-03-14-sidebar-right-design.md docs/plans/2026-03-14-sidebar-right.md src/features/game/GameScreen.tsx src/features/game/GameScreen.test.tsx
git commit -m "fix: move game sidebar to the right"
```
