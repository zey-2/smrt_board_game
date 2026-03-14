# Station Transition Design

## Summary

Show the active player's label moving station by station after a dice roll instead of jumping directly to the destination tile.

## Problem

The current game flow updates the player's board position immediately after `Roll Dice`. Players can see the destination tile, but they do not see the movement path across the board. That makes movement feel abrupt and hides which stations were passed through, especially when the path wraps from the end of the board back to the start.

## Decision

Use an in-place board animation on the existing compact station grid.

After a roll, the UI will derive the full movement path from the player's current position and dice value. The board will temporarily render that player's label on one station at a time along the path, including intermediate stations and the final destination. Each step remains visible briefly before advancing to the next station.

When the playback completes, the board remains at the reducer's persisted destination position and the normal tile-resolution controls appear.

## Architecture

The reducer remains responsible for authoritative game state. It will continue to compute the player's final position synchronously when handling `ROLL_DICE`.

`GameScreen` will own ephemeral movement playback state for the active roll. It will derive the ordered station path, advance the current step on a timer, and clear the animation once the final station is reached.

`BoardView` will accept an optional animated marker override so it can render the active player's label on the current playback tile even though the persisted player position has already been updated.

`TurnControls` will respect the playback state so roll and tile-resolution actions cannot be triggered while the movement animation is still running.

## Edge Cases

- Board wrap-around must animate through index `0` correctly.
- The animated player label must coexist with other players already on a tile.
- Tile-resolution actions must remain unavailable until playback completes.
- The final tile must keep the player label after playback because the reducer state already points there.

## Testing

Add movement-rule coverage for deriving the full station path from a start index and dice value, including wrap-around.

Add game-screen interaction coverage to verify the active player's label appears on intermediate stations before settling on the destination.

Add control-state coverage to verify tile-resolution actions remain unavailable until the animation finishes.
