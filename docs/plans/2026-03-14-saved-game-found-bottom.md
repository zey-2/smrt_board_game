# Saved Game Found Bottom Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the saved-game resume card below the main setup section on the setup page.

**Architecture:** Keep saved-game persistence behavior in `App` and change only the order of the setup-mode sections. Add a regression test that checks DOM order so the placement stays explicit.

**Tech Stack:** React 18, TypeScript, Vitest, Testing Library, Vite

---

### Task 1: Add a regression test for setup-page section order

**Files:**
- Modify: `src/App.test.tsx`
- Test: `src/App.test.tsx`

**Step 1: Write the failing test**

Add a test that starts a game, saves it, returns to setup, and asserts the `Game Setup` heading appears before `Saved Game Found` in the rendered DOM.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/App.test.tsx`
Expected: FAIL in the new setup-order test because the saved-game card currently renders before the setup card.

**Step 3: Write minimal implementation**

Update `src/App.tsx` so `SetupScreen` renders before the conditional saved-game card in setup mode.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/App.test.tsx`
Expected: PASS with the new regression test and the existing app tests.

**Step 5: Commit**

```bash
git add docs/plans/2026-03-14-saved-game-found-bottom-design.md docs/plans/2026-03-14-saved-game-found-bottom.md src/App.tsx src/App.test.tsx
git commit -m "fix: move saved game prompt below setup"
```
