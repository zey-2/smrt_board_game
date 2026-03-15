# Landscape Board Gate Design

**Date:** 2026-03-15

**Objective:** Keep the playable game board available only on supported landscape screens so the standard 25-station layout remains readable, stable, and unchanged.

## Summary

The existing 25-station board remains the single source of truth. Instead of changing station data, station count, or gameplay rules for smaller screens, the app will gate entry into the playable game UI based on viewport support. Unsupported viewports will see a notice that explains what is needed to continue.

## Design Decisions

### 1. Preserve board data and gameplay

- Keep `KEY_STATIONS_PRESET` at 25 stations.
- Keep `createGameState()` and all gameplay reducers unchanged.
- Do not slice, trim, or remap stations for mobile, portrait, or narrow layouts.

### 2. Gate the UI without resetting live game state

- Evaluate viewport support outside the core gameplay components.
- Show setup-time guidance from `App` when the current screen is unsupported.
- Keep `GameScreen` mounted once play has started so its reducer state, timer, and movement playback are preserved through resize and rotation changes.
- Inside `GameScreen`, render a notice card instead of the playable board UI whenever the viewport is unsupported.

This keeps live gameplay state intact while still preventing the playable board from rendering on unsupported screens.

### 3. Use the existing layout as the support threshold

The current board layout already expresses the intended supported footprint:

- The game viewport uses a two-column board-plus-sidebar layout by default.
- It collapses to a stacked layout below `900px`.
- The compact board grid uses fixed four-column/five-column patterns intended for wider screens.

The gate will therefore treat the board as unsupported before that stacked layout becomes the playable experience. A landscape viewport must also meet a minimum width/height threshold that keeps the full 25-station grid from feeling clipped or cramped.

### 4. Messaging rules

- Phones always show guidance that the game works best on desktop or tablet.
- Portrait orientation also shows a rotate-to-landscape instruction.
- Landscape screens that are still too small show guidance to use a larger screen or enlarge the browser window.
- When the viewport becomes supported again after resize or rotation, the board appears automatically with no refresh.

## Implementation Outline

1. Add a small viewport support helper or hook that tracks window size and orientation.
2. Introduce a game access notice component/card for unsupported screens.
3. Show advisory notices in `App` during setup and gate the playable board inside `GameScreen` during live play.
4. Add tests that cover the notice reasons and confirm the board still renders 25 stations when supported.

## Risks and Mitigations

- **Risk:** Accidentally coupling screen support to board data.
  **Mitigation:** Keep viewport logic in UI-only code and leave game state creation untouched.

- **Risk:** Regressing existing desktop/tablet behavior.
  **Mitigation:** Use the current desktop breakpoint as the support baseline and keep `GameScreen` unchanged when supported.

- **Risk:** The board fails to return after rotate/resize.
  **Mitigation:** Drive support from live window measurements and re-render on `resize`.
