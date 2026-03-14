# Add 25th Station Design

**Goal:** Add one more SMRT key station so the desktop board fills a 5 by 5 grid at wide widths.

## Decision

Add `Dhoby Ghaut` as the 25th station and append it to the existing preset order.

## Why This Approach

- The current preset has 24 stations, and the desktop board already renders five columns at large widths.
- Appending one station produces 25 total tiles, which naturally fills the 5 by 5 layout without changing board rendering code.
- Appending the new station keeps the first 24 tile indexes stable, which minimizes risk to movement behavior, saved games, and current tests.

## Data Model

- Update `src/game/constants/stations.ts` to add a new `Dhoby Ghaut` entry.
- Price and rent should place it in the upper-middle tier to reflect its importance as a major interchange while staying below the top-value CBD stations.
- Recommended values: `price: 320`, `baseRent: 32`, `line: "NSL"`, `group: "central-hub"`.

## UI Impact

- No `BoardView` or CSS layout changes are required for the 5 by 5 result on wide screens.
- The existing board header count will automatically update from 24 to 25 stations.

## Testing

- Extend station preset tests to assert the new total is 25 and that station ids remain unique.
- Add or update a game UI test so the board count reflects 25 stations.

## Risks

- Adding a tile changes board size from 24 to 25, so wrap-around destinations after crossing the previous final tile will differ from old saves.
- Keeping the new station appended avoids a larger positional reshuffle.
