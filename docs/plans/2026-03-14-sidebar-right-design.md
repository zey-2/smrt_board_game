# Sidebar Right Design

## Goal

Move the in-game sidebar to the right side of the board on desktop and below the board on mobile.

## Current Context

`GameScreen` renders `.game-sidebar` before `BoardView` inside `.game-viewport`. The desktop grid in `src/styles.css` places the first child in the left column and the second child in the right column. On mobile, the same DOM order becomes the vertical stack order.

## Options

### Recommended: Swap render order in `GameScreen`

Render `BoardView` before the sidebar. This uses the existing grid and stacked layout behavior without adding new placement rules.

Trade-offs:
- Minimal change surface
- Keeps DOM order aligned with visual order
- No extra CSS complexity

### Alternative: Force placement with CSS grid coordinates

Keep JSX order unchanged and place the sidebar into the second desktop column and second mobile row with explicit grid rules.

Trade-offs:
- More CSS indirection
- Visual order would no longer match DOM order
- No practical advantage for this layout

## Design

Update `GameScreen` so `.game-board-panel` renders before `.game-sidebar` inside `.game-viewport`.

## Testing

Add a regression test in `src/features/game/GameScreen.test.tsx` that asserts `.game-board-panel` appears before `.game-sidebar` in the rendered DOM order.
