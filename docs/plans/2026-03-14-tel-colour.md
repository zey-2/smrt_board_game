# Thomson-East Coast Line Colour Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the incorrect Thomson-East Coast Line purple branding with the brown used by current public TEL materials.

**Architecture:** Keep the change local to the shared TEL style token and the TEL badge asset. Add a regression test that reads the real source files so a future colour drift fails fast.

**Tech Stack:** React, TypeScript, Vitest, Vite asset pipeline

---

### Task 1: Lock the TEL colour with a regression test

**Files:**
- Modify: `src/features/game/lineBranding.test.ts`
- Test: `src/features/game/lineBranding.test.ts`

**Step 1: Write the failing test**

Add a test that reads `src/styles.css` and `src/assets/smrt/line-tel.svg` and expects both files to contain `#9D5B25`.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/game/lineBranding.test.ts`
Expected: FAIL because the files still contain the old purple value.

**Step 3: Write minimal implementation**

No production code in this task.

**Step 4: Run test to verify it still reflects the current failure**

Run: `npm test -- src/features/game/lineBranding.test.ts`
Expected: FAIL with assertions that the TEL brown token is missing.

**Step 5: Commit**

```bash
git add src/features/game/lineBranding.test.ts
git commit -m "test: lock Thomson-East Coast Line colour"
```

### Task 2: Update the TEL token and badge asset

**Files:**
- Modify: `src/styles.css`
- Modify: `src/assets/smrt/line-tel.svg`
- Test: `src/features/game/lineBranding.test.ts`

**Step 1: Write the minimal implementation**

- Change `--line-tel` in `src/styles.css` to `#9D5B25`.
- Change the badge fill colour in `src/assets/smrt/line-tel.svg` to `#9D5B25`.

**Step 2: Run the targeted test to verify it passes**

Run: `npm test -- src/features/game/lineBranding.test.ts`
Expected: PASS

**Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS

**Step 4: Commit**

```bash
git add src/styles.css src/assets/smrt/line-tel.svg src/features/game/lineBranding.test.ts
git commit -m "fix: correct Thomson-East Coast Line colour"
```
