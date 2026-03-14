# Player Picker Icon And Swatch Only Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the setup appearance selectors so icon choices are icon-only, background colour choices are swatch-only, and neither selector shows visible option labels.

**Architecture:** Keep the existing setup radio groups and accessibility labels. Add small setup-only visual helpers in the shared appearance module so the screen can render an icon glyph without a badge background and a plain colour swatch without an icon. Update the setup test file first, then implement the minimal rendering and styling changes needed to satisfy it.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, CSS

---

### Task 1: Lock the setup picker behavior with a failing test

**Files:**
- Modify: `src/features/setup/SetupScreen.test.tsx`

**Step 1: Write the failing test**

Add a setup screen test that checks the first icon option has no visible `Circle` label, still renders an SVG glyph, and no longer uses the badge image wrapper. In the same test, check the first colour option has no visible `Navy` label and no SVG icon.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx`
Expected: FAIL because the current picker still renders visible option text and uses the existing badge preview in both selectors.

### Task 2: Implement icon-only and swatch-only picker visuals

**Files:**
- Modify: `src/features/players/playerAppearance.tsx`
- Modify: `src/features/setup/SetupScreen.tsx`
- Modify: `src/styles.css`

**Step 1: Add minimal setup-only preview helpers**

In `src/features/players/playerAppearance.tsx`, add one helper for icon-only rendering that uses the shared icon lookup and one helper for colour swatches that uses the shared colour lookup.

**Step 2: Replace setup picker option visuals**

In `src/features/setup/SetupScreen.tsx`, switch the icon picker to the icon-only helper and switch the colour picker to the swatch helper. Remove the visible `<span>` labels from both option bodies.

**Step 3: Adjust styling**

In `src/styles.css`, add only the styles needed so the icon glyph and swatch remain centered and sized consistently inside the existing option cards.

### Task 3: Verify the setup screen stays green

**Files:**
- Test: `src/features/setup/SetupScreen.test.tsx`

**Step 1: Run the targeted setup tests**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx`
Expected: PASS

**Step 2: Run a broader verification pass**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx src/features/game/GameScreen.test.tsx`
Expected: PASS
