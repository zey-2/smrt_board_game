# Increase Board Metric Labels Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Increase board tile metric labels like price, rent, and owner to `12px`.

**Architecture:** Keep the change entirely in presentation styling. Extend the existing board UI test so it checks the metric label typography, then make a minimal CSS update affecting only `.station-metrics span` and `.station-owner`.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, CSS

---

### Task 1: Lock the new metric typography with a failing test

**Files:**
- Modify: `src/features/game/GameScreen.test.tsx`
- Test: `src/features/game/GameScreen.test.tsx`

**Step 1: Write the failing test**

Extend the compact-station-label test to capture representative board labels and assert:

```tsx
const priceLabel = screen.getAllByText("$280")[0];
const rentLabel = screen.getAllByText("Rent 28")[0];
const ownerLabel = screen.getAllByText(/Owner none/i)[0];

expect(getComputedStyle(priceLabel).fontSize).toBe("12px");
expect(getComputedStyle(rentLabel).fontSize).toBe("12px");
expect(getComputedStyle(ownerLabel).fontSize).toBe("12px");
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/game/GameScreen.test.tsx -t "shows compact station labels while keeping board data visible"`
Expected: FAIL because the metric and owner labels still render at `11px`.

**Step 3: Commit**

```bash
git add src/features/game/GameScreen.test.tsx
git commit -m "test: cover larger board metric labels"
```

### Task 2: Increase the board metric label font size

**Files:**
- Modify: `src/styles.css`
- Test: `src/features/game/GameScreen.test.tsx`

**Step 1: Write minimal implementation**

Update `src/styles.css`:

```css
.station-metrics span,
.station-owner {
  font-size: 12px;
}
```

Keep the rest of the board tile styling unchanged.

**Step 2: Run test to verify it passes**

Run: `npm run test -- src/features/game/GameScreen.test.tsx -t "shows compact station labels while keeping board data visible"`
Expected: PASS

**Step 3: Run broader verification**

Run: `npm run test -- src/features/game/GameScreen.test.tsx`
Expected: PASS

**Step 4: Commit**

```bash
git add src/styles.css src/features/game/GameScreen.test.tsx
git commit -m "feat: enlarge board metric labels"
```
