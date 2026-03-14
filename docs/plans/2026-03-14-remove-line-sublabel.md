# Remove Line Sublabel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove line-name sublabels from board station tiles and increase station-name font size.

**Architecture:** Keep the change entirely in the game board presentation layer. Update the station tile header markup to remove the line-name text, then adjust the existing station-name CSS so the tile still reads clearly without changing gameplay data or board structure.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, CSS

---

### Task 1: Lock the visual behavior with a failing board UI test

**Files:**
- Modify: `src/features/game/GameScreen.test.tsx`
- Test: `src/features/game/GameScreen.test.tsx`

**Step 1: Write the failing test**

Add assertions to the existing compact-station-label test so it verifies:

```tsx
const jurongEastName = screen.getByText("Jurong East");

expect(screen.queryByText("East West Line")).not.toBeInTheDocument();
expect(screen.queryByText("Circle Line")).not.toBeInTheDocument();
expect(getComputedStyle(jurongEastName).fontSize).toBe("15px");
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/game/GameScreen.test.tsx -t "shows compact station labels while keeping board data visible"`
Expected: FAIL because the board still renders line-name sublabels and the station name font size is still smaller than `15px`.

**Step 3: Commit**

```bash
git add src/features/game/GameScreen.test.tsx
git commit -m "test: cover board station header simplification"
```

### Task 2: Remove the sublabel and enlarge the station name

**Files:**
- Modify: `src/features/game/BoardView.tsx`
- Modify: `src/styles.css`
- Test: `src/features/game/GameScreen.test.tsx`

**Step 1: Write minimal implementation**

In `src/features/game/BoardView.tsx`, remove the line-label lookup and sublabel markup so the station header only renders the badge and the `<strong>` station name.

In `src/styles.css`, update:

```css
.station-heading strong {
  display: block;
  font-size: 15px;
  line-height: 1.15;
}
```

Remove the unused `.station-sub` rule once the markup is gone.

**Step 2: Run test to verify it passes**

Run: `npm run test -- src/features/game/GameScreen.test.tsx -t "shows compact station labels while keeping board data visible"`
Expected: PASS

**Step 3: Run broader verification**

Run: `npm run test -- src/features/game/GameScreen.test.tsx`
Expected: PASS

**Step 4: Commit**

```bash
git add src/features/game/BoardView.tsx src/styles.css src/features/game/GameScreen.test.tsx
git commit -m "feat: simplify station tile headers"
```
