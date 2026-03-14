# Increase Board Metric Labels Design

**Goal:** Increase the station metric and owner label font size on board tiles.

## Context

The board already uses a larger `15px` station name after the previous header cleanup. The remaining tile metadata, including price, rent, and owner labels, still renders at `11px`, which makes those values feel undersized relative to the station name.

## Approach

Keep the change limited to the existing board CSS and test coverage.

- Update `src/features/game/GameScreen.test.tsx` to assert the metric labels render at `12px`.
- Update `src/styles.css` so `.station-metrics span` and `.station-owner` use `12px`.

## Risks

- A larger metric font could slightly increase wrapping on narrow tiles, so the change should stay modest.
- The test should use existing visible labels to avoid coupling to any specific station beyond current fixture data.
