# Purchase Buttons Visual Order Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show `Skip Purchase` before `Buy Station` visually while keeping the existing DOM and accessibility order unchanged.

**Architecture:** Keep `TurnControls` as the owner of the purchase buttons and avoid structural changes. Add button-specific classes in the component and let `src/styles.css` control only the visual order through flex item `order`.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, CSS

---

### Task 1: Add the regression test

**Files:**
- Modify: `src/features/game/GameScreen.test.tsx`
- Test: `src/features/game/GameScreen.test.tsx`

**Step 1: Write the failing test**

```tsx
test("shows skip purchase before buy station visually while preserving DOM order", () => {
  const resolveTileState = {
    ...initialState,
    phase: "resolve_tile" as const
  };

  const { container } = render(<GameScreen initial={resolveTileState} />);
  const controlPanel = container.querySelector(".control-panel");
  const buttons = within(controlPanel as HTMLElement).getAllByRole("button");

  expect(buttons.map((button) => button.textContent?.trim())).toEqual([
    "Buy Station",
    "Skip Purchase"
  ]);
  expect(getComputedStyle(buttons[0]).order).toBe("2");
  expect(getComputedStyle(buttons[1]).order).toBe("1");
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/game/GameScreen.test.tsx`
Expected: FAIL because both buttons still have the default flex order.

**Step 3: Write minimal implementation**

```tsx
<button className="purchase-action-buy" type="button">Buy Station</button>
<button className="accent-button purchase-action-skip" type="button">Skip Purchase</button>
```

```css
.control-panel .purchase-action-buy {
  order: 2;
}

.control-panel .purchase-action-skip {
  order: 1;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/game/GameScreen.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/game/TurnControls.tsx src/features/game/GameScreen.test.tsx src/styles.css
git commit -m "fix: swap purchase button visual order"
```

### Task 2: Verify the targeted change does not break the game screen

**Files:**
- Test: `src/features/game/GameScreen.test.tsx`

**Step 1: Run the focused suite**

Run: `npm test -- src/features/game/GameScreen.test.tsx`
Expected: PASS

**Step 2: Run type-level verification**

Run: `npm run lint`
Expected: PASS
