# Player Background Colors Navy Revision Design

## Summary

Replace the current Teal player token background with Navy.

## Problem

Teal is better than Orange, but it still reads as too close to the cool transit/map palette. The player token set needs a darker, more neutral cool tone that stays separate from Purple, Pink, and Cyan.

## Decision

Keep Purple, Pink, and Cyan unchanged, and replace:
- Teal -> Navy

The final player background options will be:
- Navy
- Purple
- Pink
- Cyan

Because defaults derive from the ordered shared color option list, Player 1 and Player 2 will default to Navy and Purple.

## Architecture

`PLAYER_COLOR_OPTIONS` remains the single source of truth for token colour ids, labels, and swatches. Updating the first entry automatically updates setup defaults, previews, in-game badges, and any tests that derive from the shared option ordering.

## Edge Cases

- White icon strokes must remain legible on the new Navy background.
- Setup tests that assert `Teal` and `teal` need to move to `Navy` and `navy`.
- Default color assertions must continue to track the ordered shared list.

## Testing

Update setup-screen tests to expect Navy in the default and validation flows.

Update initial-state coverage to expect the revised ordered ids `navy`, `purple`, `pink`, `cyan`.
