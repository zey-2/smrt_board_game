# Landscape Board Gate Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Gate the playable board behind a supported landscape viewport while preserving the existing 25-station board data and gameplay behavior.

**Architecture:** Add a UI-only viewport evaluator shared by `App` and `GameScreen`. `App` shows advisory notices during setup, while `GameScreen` stays mounted and conditionally renders either the existing playable layout or a notice card so live reducer state is preserved across resize and rotation changes. The evaluator is based on the current board layout breakpoints instead of introducing a compact board mode.

**Tech Stack:** React 18, TypeScript, Vitest, Testing Library, CSS

---

### Task 1: Add app-level tests for viewport support messaging

**Files:**
- Modify: `src/App.test.tsx`
- Reference: `src/App.tsx`
- Reference: `src/features/game/GameScreen.tsx`

**Step 1: Write the failing tests**

Add tests for:
- phone messaging appears regardless of orientation
- portrait messaging appears before the board
- supported landscape renders the playable board
- unsupported small landscape shows the larger-screen guidance
- supported board still reports 25 stations and never auto-reduces

**Step 2: Run tests to verify they fail**

Run: `vitest src/App.test.tsx`
Expected: FAIL because the viewport gate and notice UI do not exist yet.

**Step 3: Write minimal implementation**

Add viewport support detection, show setup-time notices from `App`, and gate the playable board inside `GameScreen`.

**Step 4: Run tests to verify they pass**

Run: `vitest src/App.test.tsx`
Expected: PASS

### Task 2: Add viewport gating UI and styles

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/features/game/GameScreen.tsx`
- Modify: `src/styles.css`
- Create: `src/features/game/ViewportGate.tsx`

**Step 1: Write the failing test**

Use the tests from Task 1 to drive the UI content and conditional rendering.

**Step 2: Run test to verify it fails**

Run: `vitest src/App.test.tsx`
Expected: FAIL with missing text or unexpected board rendering.

**Step 3: Write minimal implementation**

- Add a live viewport evaluator based on width, height, orientation, and phone-sized screens.
- Render a notice card when unsupported.
- Keep `GameScreen` mounted in live play so game state survives viewport changes.
- Add styling for the notice without changing the board layout itself.

**Step 4: Run tests to verify it passes**

Run: `vitest src/App.test.tsx`
Expected: PASS

### Task 3: Protect the 25-station source of truth

**Files:**
- Modify: `src/game/constants/stations.test.ts`
- Reference: `src/game/constants/stations.ts`
- Reference: `src/game/state/initialState.ts`

**Step 1: Write the failing test**

Add a test that asserts the preset remains 25 stations and that viewport changes do not create an alternate 24-station preset path.

**Step 2: Run test to verify it fails**

Run: `vitest src/game/constants/stations.test.ts`
Expected: FAIL only if the source-of-truth assumptions are not explicit enough.

**Step 3: Write minimal implementation**

Strengthen the source-of-truth assertion in tests only. Do not change production board data.

**Step 4: Run tests to verify it passes**

Run: `vitest src/game/constants/stations.test.ts`
Expected: PASS

### Task 4: Final verification

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/features/game/GameScreen.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/styles.css`
- Modify: `src/game/constants/stations.test.ts`
- Create: `src/features/game/ViewportGate.tsx`

**Step 1: Run focused verification**

Run: `vitest src/App.test.tsx src/game/constants/stations.test.ts src/features/game/GameScreen.test.tsx`
Expected: PASS

**Step 2: Run static verification**

Run: `tsc --noEmit`
Expected: PASS

**Step 3: Commit**

```bash
git add docs/plans/2026-03-15-landscape-board-gate-design.md docs/plans/2026-03-15-landscape-board-gate.md src/App.tsx src/App.test.tsx src/styles.css src/features/game/ViewportGate.tsx src/game/constants/stations.test.ts
git commit -m "feat: gate board to supported landscape screens"
```
