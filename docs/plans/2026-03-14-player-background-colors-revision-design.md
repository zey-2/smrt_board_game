# Player Background Colors Revision Design

## Summary

Replace the recently added Orange and Yellow player token backgrounds with Teal and Cyan.

## Problem

Orange and Yellow sit too close to existing board and line-adjacent tones. The player token palette needs cooler colors that feel more distinct from the rest of the game surface.

## Decision

Keep Purple and Pink unchanged, and replace:
- Orange -> Teal
- Yellow -> Cyan

The final player background options will be:
- Teal
- Purple
- Pink
- Cyan

Because defaults derive from the shared color option ordering, Player 1 and Player 2 will default to Teal and Purple.

## Architecture

`PLAYER_COLOR_OPTIONS` remains the single source of truth for ids, labels, and swatches. Updating the shared option list automatically updates setup choices, previews, in-game badges, and default player creation.

## Edge Cases

- Token foreground color must remain readable against Teal and Cyan.
- Setup tests that assert labels and ids need to move from Orange/Yellow to Teal/Cyan.
- Default color assertions must keep tracking the ordered shared option list.

## Testing

Update setup-screen tests to expect Teal and Cyan labels and ids.

Update initial-state coverage to expect the revised color option ordering.
