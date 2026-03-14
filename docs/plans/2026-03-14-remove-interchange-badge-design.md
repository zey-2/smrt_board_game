# Remove Interchange Badge Design

**Goal:** Remove the in-game `Interchange` badge from station tiles because it does not affect gameplay.

## Decision

- Treat interchange as non-essential board decoration and remove it from the game board UI.
- Keep the station data model unchanged because interchange is not stored in game state.
- Limit the change to the board presentation layer and its UI tests.

## Impact

- Station tiles continue to show the line badge, station name, line label, pricing, rent, owner, and tokens.
- The board no longer highlights specific stations with an `Interchange` chip.
- No gameplay, save data, or rules logic changes.

## Testing

- Add a board UI test that asserts `Interchange` is not rendered.
- Remove the badge render path and its unused style/constant, then rerun the relevant UI test file.
