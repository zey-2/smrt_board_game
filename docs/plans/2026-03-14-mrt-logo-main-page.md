# MRT Logo Main Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current landing-page header logo with a downloaded local MRT station logo asset.

**Architecture:** Keep the existing `App` header structure and swap only the imported logo asset and related presentation details. Validate the behavior through a focused app test first, then make the minimal component and CSS change needed to satisfy it.

**Tech Stack:** React 18, Vite, TypeScript, Vitest, Testing Library

---

### Task 1: Capture the new logo requirement in a test

**Files:**
- Modify: `src/App.test.tsx`
- Test: `src/App.test.tsx`

**Step 1: Write the failing test**

Add a test asserting the main page renders an image with alt text `MRT Station`.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/App.test.tsx`
Expected: FAIL because the app still renders the old `SMRT` alt text.

**Step 3: Write minimal implementation**

No production change in this task.

**Step 4: Run test to verify it still fails correctly**

Run: `npm test -- src/App.test.tsx`
Expected: FAIL with the missing `MRT Station` image assertion.

### Task 2: Replace the header logo asset

**Files:**
- Create: `src/assets/smrt/mrt-station-logo.png`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Test: `src/App.test.tsx`

**Step 1: Download the asset into the repository**

Fetch the provided logo URL and save it to `src/assets/smrt/mrt-station-logo.png`.

**Step 2: Write minimal implementation**

- Update `src/App.tsx` to import the new asset.
- Replace the current header image alt text with `MRT Station`.
- Adjust `.smrt-logo` and banner responsive styling in `src/styles.css` only if needed for clean rendering.

**Step 3: Run the focused test**

Run: `npm test -- src/App.test.tsx`
Expected: PASS

### Task 3: Verify the change

**Files:**
- Modify: none
- Test: `src/App.test.tsx`

**Step 1: Run the full unit suite**

Run: `npm test`
Expected: PASS

**Step 2: Run the build**

Run: `npm run build`
Expected: PASS
