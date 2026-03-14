# Setup Header Spacing Design

## Summary

Remove the setup-page preset copy and make the vertical spacing around the setup controls explicit. The target areas are the gap above the `End condition` field and the gap above the first `Player 1 name` row.

## Decision

Keep the existing setup structure and only adjust the setup card layout:

- remove `Board preset: SMRT key stations` from the setup screen
- make the setup card use explicit vertical spacing between direct child sections
- reset the setup heading margin so spacing is not driven by browser defaults
- keep button sizing unchanged by preventing the grid layout from stretching the `Start Game` button

## Testing

Add a setup test that verifies the board preset copy is no longer rendered. The spacing revision remains a CSS-only change scoped to the setup screen.
