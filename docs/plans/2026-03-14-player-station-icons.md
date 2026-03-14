# Player Station Icons Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let each player pick a setup-only icon and background colour pair, enforce uniqueness on that pair, and render the chosen badge on station cards and in the player panel.

**Architecture:** Add appearance metadata directly to `Player`, because setup already creates the player objects and all runtime surfaces read from player state. Centralize the fixed icon and colour options in one shared module, then reuse one badge renderer across setup and gameplay so the visuals and identifiers stay consistent.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, CSS

---

### Task 1: Define player appearance data and fixed options

**Files:**
- Create: `src/features/players/playerAppearance.tsx`
- Modify: `src/game/types.ts`
- Test: `src/game/state/initialState.test.ts`

**Step 1: Write the failing test**

Update `src/game/state/initialState.test.ts` to assert that default players include valid `iconId` and `colorId` values from the shared appearance option lists.

```ts
expect(state.players[0].iconId).toBe(PLAYER_ICON_OPTIONS[0].id);
expect(state.players[0].colorId).toBe(PLAYER_COLOR_OPTIONS[0].id);
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/game/state/initialState.test.ts`
Expected: FAIL because `iconId` and `colorId` do not exist yet.

**Step 3: Write minimal implementation**

Create `src/features/players/playerAppearance.tsx` with:

- a small fixed `PLAYER_ICON_OPTIONS` list
- a small fixed `PLAYER_COLOR_OPTIONS` list
- a `PlayerTokenBadge` component that accepts `iconId`, `colorId`, and an accessible label
- helpers to look up labels and tokens by id

Extend `Player` in `src/game/types.ts` with:

- `iconId`
- `colorId`

**Step 4: Run test to verify it passes**

Run: `npm test -- src/game/state/initialState.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/players/playerAppearance.tsx src/game/types.ts src/game/state/initialState.test.ts
git commit -m "feat: define player appearance options"
```

### Task 2: Add default player appearance values in state creation

**Files:**
- Modify: `src/game/state/initialState.ts`
- Test: `src/game/state/initialState.test.ts`

**Step 1: Write the failing test**

Extend `src/game/state/initialState.test.ts` so both default players are expected to receive distinct icon and colour combinations.

```ts
expect(state.players.map((player) => [player.iconId, player.colorId])).toEqual([
  [PLAYER_ICON_OPTIONS[0].id, PLAYER_COLOR_OPTIONS[0].id],
  [PLAYER_ICON_OPTIONS[1].id, PLAYER_COLOR_OPTIONS[1].id]
]);
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/game/state/initialState.test.ts`
Expected: FAIL because `createDefaultPlayers` still returns players without appearance values.

**Step 3: Write minimal implementation**

Update `src/game/state/initialState.ts` so `createDefaultPlayers()` assigns deterministic default icon and colour ids from the shared option lists.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/game/state/initialState.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/game/state/initialState.ts src/game/state/initialState.test.ts
git commit -m "feat: add default player token selections"
```

### Task 3: Extend setup validation for appearance selection

**Files:**
- Modify: `src/features/setup/setupValidation.ts`
- Test: `src/features/setup/SetupScreen.test.tsx`

**Step 1: Write the failing test**

Add tests that:

- starting the game includes the chosen `iconId` and `colorId` in `onStart`
- duplicate icon and colour combinations are rejected with a visible error

Example assertion:

```ts
expect(onStart.mock.calls[0][0].players[0]).toMatchObject({
  iconId: "circle",
  colorId: "blue"
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx`
Expected: FAIL because setup only tracks names today.

**Step 3: Write minimal implementation**

Update `setupValidation.ts` so the draft includes per-player appearance selections and validation rejects duplicate `iconId` + `colorId` pairs before returning players.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx`
Expected: PASS for the new validation behavior.

**Step 5: Commit**

```bash
git add src/features/setup/setupValidation.ts src/features/setup/SetupScreen.test.tsx
git commit -m "feat: validate player token selections"
```

### Task 4: Add appearance pickers to the setup screen

**Files:**
- Modify: `src/features/setup/SetupScreen.tsx`
- Modify: `src/styles.css`
- Test: `src/features/setup/SetupScreen.test.tsx`

**Step 1: Write the failing test**

Add setup-screen tests that expect each player row to expose:

- an icon selector
- a colour selector

Add interaction coverage that changes both controls before pressing `Start Game`.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx`
Expected: FAIL because the controls do not exist.

**Step 3: Write minimal implementation**

Update `SetupScreen.tsx` to:

- keep per-player setup rows instead of names only
- render compact icon and colour controls using the shared option lists
- preserve deterministic defaults when adding players
- pass selected values into `validateAndBuildSetup`

Update `src/styles.css` with layout and selected-state styling for the setup token pickers.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/setup/SetupScreen.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/setup/SetupScreen.tsx src/styles.css src/features/setup/SetupScreen.test.tsx
git commit -m "feat: add player token pickers to setup"
```

### Task 5: Render player token badges in gameplay surfaces

**Files:**
- Modify: `src/features/game/BoardView.tsx`
- Modify: `src/features/game/PlayerPanel.tsx`
- Test: `src/features/game/GameScreen.test.tsx`

**Step 1: Write the failing test**

Add gameplay tests that:

- expect station tiles to render token badges for players on a station
- expect the player panel to render each player token badge next to the player name
- stop asserting that station occupancy is shown by name-only pills

**Step 2: Run test to verify it fails**

Run: `npm test -- src/features/game/GameScreen.test.tsx`
Expected: FAIL because the current UI renders text names instead of token badges.

**Step 3: Write minimal implementation**

Update `BoardView.tsx` and `PlayerPanel.tsx` to render `PlayerTokenBadge` using the player’s stored `iconId` and `colorId`. Keep accessible labels so tests and assistive technology can identify which player each badge represents.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/features/game/GameScreen.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/game/BoardView.tsx src/features/game/PlayerPanel.tsx src/features/game/GameScreen.test.tsx
git commit -m "feat: show player token badges on the board"
```

### Task 6: Run focused regression coverage

**Files:**
- Test: `src/game/state/initialState.test.ts`
- Test: `src/features/setup/SetupScreen.test.tsx`
- Test: `src/features/game/GameScreen.test.tsx`

**Step 1: Run the targeted suite**

Run:

```bash
npm test -- src/game/state/initialState.test.ts src/features/setup/SetupScreen.test.tsx src/features/game/GameScreen.test.tsx
```

Expected: PASS for all player appearance and token rendering coverage.

**Step 2: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS with no regressions.

**Step 3: Commit**

```bash
git add -A
git commit -m "test: verify player token customization flow"
```
