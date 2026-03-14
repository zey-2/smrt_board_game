# Exit Buttons Status Card Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the `Save` and `Abort` buttons into the `SMRT Monopoly` status card on all layouts so they are separated from turn controls.

**Architecture:** Keep game-level exit actions owned by `GameScreen`, where the status card already lives. Simplify `TurnControls` so it only renders turn-flow UI, then add responsive status-card styling that holds both status pills and exit buttons without crowding the turn buttons.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, CSS

---

### Task 1: Add the regression test

**Files:**
- Modify: `src/features/game/GameScreen.test.tsx`
- Test: `src/features/game/GameScreen.test.tsx`

**Step 1: Write the failing test**

```tsx
test("renders save and abort inside the status card instead of turn controls", () => {
  const { container } = render(<GameScreen initial={initialState} />);

  const statusCard = container.querySelector(".map-status");
  const controlPanel = container.querySelector(".control-panel");

  expect(statusCard).toBeTruthy();
  expect(within(statusCard as HTMLElement).getByRole("button", { name: "Save" })).toBeInTheDocument();
  expect(within(statusCard as HTMLElement).getByRole("button", { name: "Abort" })).toBeInTheDocument();
  expect(within(controlPanel as HTMLElement).queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
  expect(within(controlPanel as HTMLElement).queryByRole("button", { name: "Abort" })).not.toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/game/GameScreen.test.tsx`
Expected: FAIL because `Save` and `Abort` are still rendered inside `.control-panel`.

**Step 3: Write minimal implementation**

```tsx
<header className="card map-status map-status-compact">
  <div>
    <h2>SMRT Monopoly</h2>
    <div className="status-pills">...</div>
  </div>
  <div className="inline-actions map-status-actions">
    <button type="button" onClick={() => onExitWithSave(state)}>Save</button>
    <button type="button" onClick={onExitWithoutSave}>Abort</button>
  </div>
</header>
```

Remove the exit-action row and unused props from `TurnControls`.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/game/GameScreen.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/game/GameScreen.tsx src/features/game/TurnControls.tsx src/features/game/GameScreen.test.tsx src/styles.css
git commit -m "fix: move exit buttons into status card"
```

### Task 2: Make the status card layout work across screen sizes

**Files:**
- Modify: `src/styles.css`
- Test: `src/features/game/GameScreen.test.tsx`

**Step 1: Write the failing test**

```tsx
test("keeps the status card exit buttons rendered in the status card", () => {
  const { container } = render(<GameScreen initial={initialState} />);
  const statusCard = container.querySelector(".map-status");
  expect(statusCard).toHaveTextContent("SMRT Monopoly");
  expect(within(statusCard as HTMLElement).getByRole("button", { name: "Save" })).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/game/GameScreen.test.tsx`
Expected: FAIL until the status card layout includes the exit buttons.

**Step 3: Write minimal implementation**

```css
.map-status {
  align-items: flex-start;
  flex-wrap: wrap;
}

.map-status-main {
  display: grid;
  gap: 8px;
}

.map-status-actions {
  margin-left: auto;
}
```

Add a narrow-layout rule if the buttons need to stretch to full width under the status pills.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/game/GameScreen.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/styles.css src/features/game/GameScreen.test.tsx
git commit -m "style: align exit buttons with status card"
```
