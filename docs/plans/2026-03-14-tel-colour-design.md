# Thomson-East Coast Line Colour Design

**Goal:** Correct the Thomson-East Coast Line visual branding from purple to brown in the game UI.

## Scope

- Update the shared TEL colour token in `src/styles.css`.
- Update the TEL badge asset in `src/assets/smrt/line-tel.svg`.
- Add a regression test that verifies both files use the same TEL brown value.

## Source

- LTA public MRT system map shows the Thomson-East Coast Line in brown.
- Public TEL logo artwork uses `#9D5B25`, which is a close match for the current official map rendering.

## Approach

- Keep the change narrow: no unrelated background or decorative palette adjustments.
- Store the TEL colour in CSS as `#9D5B25`.
- Use the same hex value in the TEL badge SVG so the theme token and badge do not drift.

## Testing

- Add a test that reads `src/styles.css` and `src/assets/smrt/line-tel.svg` and asserts both contain `#9D5B25`.
- Run the targeted test first, then the full test suite.
