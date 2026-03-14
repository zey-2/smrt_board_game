# Turn Handoff Copy Design

## Goal

Rename the inline handoff heading from `Pass device to <name>` to `<name>'s Turn` and remove the helper sentence under that heading.

## Current State

`TurnControls` renders the handoff card with a heading, a descriptive helper sentence, and a `Start Turn` button. Tests in the game screen, handoff regression, and end-to-end flow assert the old heading text.

## Approaches Considered

1. Update the handoff heading string and remove the helper paragraph, then refresh affected tests.
2. Introduce a dedicated formatter for handoff copy.
3. Redesign the full handoff card layout and wording set.

## Recommended Approach

Use the smallest possible change: update the heading string in `TurnControls`, delete the helper paragraph, and adjust the tests that explicitly expect the old copy.

This keeps the existing handoff flow, button label, and layout structure intact. It directly matches the requested wording change without introducing abstraction that the current UI does not need.

## Component Changes

- `src/features/game/TurnControls.tsx`
  Replace the handoff heading with `{nextPlayerName}'s Turn` and remove the helper paragraph.
- `src/features/game/GameScreen.test.tsx`
  Update the inline handoff-card assertions to expect the new heading and confirm the helper sentence is absent.
- `src/features/game/PassDeviceOverlay.test.tsx`
  Update the handoff regression to expect the new heading text.
- `tests/e2e/pass-and-play.spec.ts`
  Update the end-to-end check to look for the new handoff heading.

## Testing

Add and update assertions so coverage proves:
- the handoff card shows `<name>'s Turn`
- the `Start Turn` button is unchanged
- the removed helper sentence is no longer rendered
