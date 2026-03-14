# Player Background Colors Design

## Summary

Replace the existing player background colour choices with Orange, Purple, Pink, and Yellow everywhere in the app.

## Problem

The current player token background options are Blue, Red, Green, and Gold. The requested palette is Orange, Purple, Pink, and Yellow, and the defaults should also follow that new set.

## Decision

Update the shared player color option source so all setup controls, token previews, in-game badges, and default player appearances inherit the new palette automatically.

The four available choices will be:
- Orange
- Purple
- Pink
- Yellow

Because default player colors are selected from the ordered shared option array, Player 1 and Player 2 will default to Orange and Purple.

## Architecture

`PLAYER_COLOR_OPTIONS` in `src/features/players/playerAppearance.tsx` remains the single source of truth for the background colour ids, labels, and visual values.

`SetupScreen`, setup validation, and `initialState` already consume that shared option list, so changing the option definitions updates the behaviour without any reducer or persistence changes.

## Edge Cases

- Token foreground color must stay legible against each new background.
- Setup tests that assert color labels and ids must be updated to the new palette.
- Validation logic must continue to enforce unique icon-and-colour combinations without any behavioral change.

## Testing

Update setup-screen tests to assert the new labels and the new selected/default colors.

Update initial-state coverage to keep checking that defaults are derived from the shared color option array.
