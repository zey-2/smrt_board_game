# Turn Handoff Copy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Change the inline handoff heading to `<name>'s Turn` and remove the helper sentence while keeping the `Start Turn` action unchanged.

**Architecture:** Keep the handoff UI in `TurnControls` and make this a copy-only change. Update the focused unit and end-to-end tests first so they fail on the old heading and helper text, then apply the minimal JSX change to satisfy those tests.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, Playwright

---

### Task 1: Update the unit tests first

**Files:**
- Modify: `src/features/game/GameScreen.test.tsx`
- Modify: `src/features/game/PassDeviceOverlay.test.tsx`
- Test: `src/features/game/GameScreen.test.tsx`
- Test: `src/features/game/PassDeviceOverlay.test.tsx`

**Step 1: Write the failing test changes**

```tsx
expect(screen.getByText(`${initialState.players[1].name}'s Turn`)).toBeInTheDocument();
expect(
  screen.queryByText("Hide your strategy and hand the device to the next player.")
).not.toBeInTheDocument();
```

```tsx
expect(screen.getByText(`${initialState.players[1].name}'s Turn`)).toBeInTheDocument();
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- src/features/game/GameScreen.test.tsx src/features/game/PassDeviceOverlay.test.tsx`
Expected: FAIL because the component still renders `Pass device to <name>` and the helper sentence.

**Step 3: Write minimal implementation**

```tsx
<div className="turn-handoff-card">
  <h4>{nextPlayerName}'s Turn</h4>
  <button className="primary-button" type="button" onClick={onStartTurn}>
    Start Turn
  </button>
</div>
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- src/features/game/GameScreen.test.tsx src/features/game/PassDeviceOverlay.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/game/TurnControls.tsx src/features/game/GameScreen.test.tsx src/features/game/PassDeviceOverlay.test.tsx
git commit -m "fix: update turn handoff copy"
```

### Task 2: Update the end-to-end expectation

**Files:**
- Modify: `tests/e2e/pass-and-play.spec.ts`
- Test: `tests/e2e/pass-and-play.spec.ts`

**Step 1: Write the failing spec change**

```ts
await expect(page.getByText(/'s Turn$/)).toBeVisible();
```

**Step 2: Run the end-to-end spec if needed**

Run: `npm run test:e2e -- tests/e2e/pass-and-play.spec.ts`
Expected: PASS after the JSX change is in place

**Step 3: Commit**

```bash
git add tests/e2e/pass-and-play.spec.ts
git commit -m "test: refresh turn handoff e2e copy"
```

### Task 3: Run final verification

**Files:**
- Test: `src/features/game/GameScreen.test.tsx`
- Test: `src/features/game/PassDeviceOverlay.test.tsx`

**Step 1: Run the focused test suites**

Run: `npm test -- src/features/game/GameScreen.test.tsx src/features/game/PassDeviceOverlay.test.tsx`
Expected: PASS

**Step 2: Run type-level verification**

Run: `npm run lint`
Expected: PASS
