# Exit Buttons Status Card Design

## Goal

Move the `Save` and `Abort` controls away from the turn-action area so players do not click them accidentally during turn flow.

## Current State

`TurnControls` renders gameplay actions and the `Save` / `Abort` row inside the same card. The `SMRT Monopoly` status card is rendered separately in `GameScreen` and only shows round and phase details.

## Recommended Approach

Render `Save` and `Abort` inside the `SMRT Monopoly` status card in `GameScreen` on every layout. Keep `TurnControls` focused on turn-specific actions only.

This is the smallest structural change that clearly separates game-level actions from turn-level actions. It matches user intent more directly than adding spacing inside the turn controls.

## Component Changes

- `src/features/game/GameScreen.tsx`
  Add a compact exit-action group inside the existing `map-status` card and wire it to the existing save/abort callbacks.
- `src/features/game/TurnControls.tsx`
  Remove the exit-action row and the now-unused save/abort callback props.
- `src/styles.css`
  Extend the `map-status` styling so the status card can hold title, pills, and exit buttons cleanly on both wide and narrow screens.

## Responsive Behavior

The status card will wrap its contents when space is limited. The exit buttons stay attached to the status card rather than appearing near turn controls on mobile layouts.

## Testing

Update the game-screen regression test so it checks that `Save` and `Abort` are rendered inside the status card instead of inside the control panel. No gameplay logic changes are expected.
