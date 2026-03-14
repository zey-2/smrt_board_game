# Player Picker Icon And Swatch Only Design

## Summary

Revise the setup appearance selectors so the icon picker shows only icon glyphs, and the background colour picker shows only colour swatches. Remove the visible option text from both selectors while keeping the existing radio input accessibility labels.

## Decision

Keep the current setup structure and radio groups in `src/features/setup/SetupScreen.tsx`. Only the visible option previews change:

- icon options render the selected glyph without the token badge background
- background colour options render a plain colour swatch without an icon
- option names are removed from the visible UI

## Accessibility

The current `aria-label` values on the radio inputs remain in place so keyboard and screen-reader navigation stay unchanged.

## Testing

Update the setup screen tests to assert:

- icon choices do not render visible option text
- icon choices still render an icon glyph
- icon choices no longer render the badge-style image wrapper
- background colour choices do not render visible option text
- background colour choices no longer render an icon
