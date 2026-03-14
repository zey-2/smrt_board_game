# Remove Line Sublabel Design

**Goal:** Remove line-name sublabels from board station tiles and make the station names more prominent.

## Context

The board tile header currently renders both the line badge icon and a text sublabel such as `East West Line` or `Circle Line`. The requested change keeps the compact line badge but removes the line-name text so each tile reads more cleanly. Because the line name disappears, the station name should scale up slightly to remain the dominant header element.

## Approach

Keep the change inside the board presentation layer.

- Update `src/features/game/BoardView.tsx` to stop rendering the line-name sublabel.
- Increase the station-name typography in `src/styles.css`.
- Add UI coverage in `src/features/game/GameScreen.test.tsx` to lock the sublabel removal and the larger station-name font size.

## Risks

- Larger station names could wrap more often on narrow tiles, so the size increase should stay modest.
- Tests should assert board-scoped behavior so they do not become brittle if the same line names appear elsewhere in future screens.
