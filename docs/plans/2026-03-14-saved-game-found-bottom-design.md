# Saved Game Found Bottom Design

## Goal

Render the `Saved Game Found` panel below the `Game Setup` section on the setup page.

## Current Context

`App` renders the saved-game resume card before `SetupScreen`, so the saved-game prompt appears above the setup form. `SetupScreen` owns only the new-game form and does not know about persisted game state.

## Options

### Recommended: Reorder the setup-page sections in `App`

Keep the saved-game prompt as a separate card and render it after `SetupScreen`.

Trade-offs:
- Minimal change surface
- Keeps saved-game state handling in `App`
- Aligns DOM order with visual order

### Alternative: Move the saved-game prompt into `SetupScreen`

Pass saved-game state and handlers into `SetupScreen` and render the prompt there.

Trade-offs:
- Tighter coupling between setup UI and top-level persistence logic
- More props for no functional gain

### Alternative: Reorder with CSS only

Keep JSX order unchanged and use layout styling to place the saved-game card last.

Trade-offs:
- Visual order would not match DOM order
- Less explicit than changing the render sequence directly

## Design

Keep `SetupScreen` unchanged. In `App`, render `<SetupScreen onStart={handleStart} />` before the conditional saved-game card so the setup card appears first and the resume card appears beneath it.

## Testing

Add a regression test in `src/App.test.tsx` that saves a game, returns to setup, and asserts the `Game Setup` heading appears before the `Saved Game Found` heading in DOM order.
