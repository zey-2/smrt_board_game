# Reorder Dhoby Ghaut Design

**Goal:** Move `Dhoby Ghaut` into the existing North South line block instead of leaving it appended at the end of the board preset.

## Decision

Place `Dhoby Ghaut` between `Orchard` and `City Hall`.

## Why This Placement

- It keeps all NSL stations grouped together in one contiguous run.
- It is the most geographically sensible central NSL ordering among the current key stations.
- It limits the change to one local reorder instead of reshuffling multiple line blocks.

## Scope

- Reorder only `src/game/constants/stations.ts`.
- Keep the station count at 25.
- Keep `Dhoby Ghaut` pricing, rent, and metadata unchanged.

## Testing

- Add a focused preset-order test that asserts the NSL subsequence contains `Dhoby Ghaut` between `Orchard` and `City Hall`.
- Re-run the existing station and game tests to confirm the reorder does not break the board count or general rendering.
