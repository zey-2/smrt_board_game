# Inline Player Handoff Design

## Summary

Replace the blocking pass-device modal with an inline handoff card inside the turn controls.

## Problem

The current turn handoff uses a full-screen modal dialog after `End Turn`. It interrupts the board view and forces the player through a popup before the next turn can begin.

## Decision

Keep the explicit handoff step, but move it into the existing controls panel.

After `End Turn`, the controls panel will switch into a handoff state that shows:
- `Pass device to <next player>`
- a short privacy reminder
- a single `Start Turn` button

While the handoff state is active, normal turn controls remain hidden so the next player must explicitly reveal their turn.

## Architecture

`GameScreen` will keep local UI state that tracks whether the handoff gate is active. It will set that state after `END_TURN` and clear it when the next player clicks `Start Turn`.

`TurnControls` will receive the handoff state and render either the inline handoff card or the normal turn controls. No reducer changes are required because this is presentation-only flow control.

The standalone overlay component becomes unnecessary and can be removed.

## Edge Cases

- The next player's name must reflect the updated `turnIndex` after `END_TURN`.
- Exit actions should stay available during the handoff state.
- Roll, buy, skip, and end-turn actions must remain hidden until `Start Turn` is clicked.

## Testing

Add UI coverage that verifies the inline handoff card appears after `End Turn`.

Add coverage that verifies normal turn actions are hidden during handoff and become available after `Start Turn`.

Remove the obsolete overlay-specific test coverage.
