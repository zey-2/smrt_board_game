# SMRT Corporate Logo Main Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current square header logo with a cropped wide SMRT logo that matches the user's attached image.

**Architecture:** Keep the existing `App` banner structure and swap only the logo asset plus the header-image presentation styles. Use a focused app test to capture the SMRT logo identity change before modifying the component and CSS.

**Tech Stack:** React 18, Vite, TypeScript, Vitest, Testing Library

---

### Task 1: Capture the new SMRT logo requirement in a test

**Files:**
- Modify: `src/App.test.tsx`
- Test: `src/App.test.tsx`

**Step 1: Write the failing test**

Update the logo assertion to expect alt text `SMRT`.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/App.test.tsx`
Expected: FAIL because the app still renders the previous `MRT Station` image.

**Step 3: Write minimal implementation**

No production change in this task.

**Step 4: Run test to verify it still fails correctly**

Run: `npm test -- src/App.test.tsx`
Expected: FAIL with the missing `SMRT` image assertion.

### Task 2: Replace the header logo asset and styling

**Files:**
- Create: `src/assets/smrt/smrt-corporate-logo.svg`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Test: `src/App.test.tsx`

**Step 1: Add the cropped local asset**

Store a local SMRT logo asset that matches the user-provided image without the outer white border.

**Step 2: Write minimal implementation**

- Update `src/App.tsx` to import the new SMRT logo asset.
- Replace the image alt text with `SMRT`.
- Adjust `.smrt-logo` styling so the logo uses a wide footprint with preserved aspect ratio instead of a fixed square.

**Step 3: Run the focused test**

Run: `npm test -- src/App.test.tsx`
Expected: PASS

### Task 3: Verify the change

**Files:**
- Modify: none
- Test: all

**Step 1: Run the full unit suite**

Run: `npm test`
Expected: PASS

**Step 2: Run the build**

Run: `npm run build`
Expected: PASS
