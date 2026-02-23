# SMRT Map-Themed UI Refresh Design

**Date:** 2026-02-23  
**Status:** Approved  
**Scope:** Visual redesign only (no gameplay rule changes)

## 1. Goal

Make the interface more vibrant while staying faithful to the original SMRT map visual language.

## 2. Confirmed Direction

- Theme style: faithful to transit map aesthetics.
- Branding: include logos/line badges.
- Asset source: local files in repository.

## 3. Visual System

### Color Tokens

Define CSS variables for line identity and neutral surfaces:

- `--line-nsl`
- `--line-ewl`
- `--line-ccl`
- `--line-tel`
- `--line-bplrt`
- map background neutrals and panel tones

### Background + Atmosphere

- Keep light map-canvas presentation.
- Add subtle transit-grid/route-line pattern to background.
- Avoid arcade glow effects and dark-theme drift.

### Typography + Hierarchy

- Transit-signage inspired sans stack for titles and labels.
- Preserve high readability for body and controls.
- Improve information hierarchy for setup/game/status sections.

### Motion

- Small, purposeful animations only:
  - tile hover lift
  - active player emphasis
  - overlay transitions
- Respect reduced-motion preferences.

## 4. Component Changes

### `src/styles.css`

- Replace current neutral style block with SMRT-map tokenized theme.
- Add utility classes for line color accents and station rail color.
- Improve panel depth and spacing for more map-signage character.

### `src/features/game/BoardView.tsx`

- Add line badge/icon per station tile.
- Add top rail color per line.
- Add visual interchange marker for key hubs (visual-only enhancement).

### `src/features/game/PlayerPanel.tsx`

- Restyle player cards with transit-card visual language.
- Emphasize active player using line-like service highlight treatment.

### `src/features/game/TurnControls.tsx`

- Rework buttons into map-action styling with clearer primary/secondary states.
- Preserve disabled clarity and keyboard accessibility.

### `src/features/game/GameScreen.tsx`

- Convert top header into map-status bar treatment (phase/round/readability).
- Keep existing layout structure and responsive behavior.

### `src/App.tsx`

- Align setup/resume panels with transit signage style language.

### `src/features/results/WinnerScreen.tsx`

- Theme as service summary board with ranking accents.

## 5. Branding Asset Pipeline

Add local assets under:

- `src/assets/smrt/smrt-logo.svg`
- `src/assets/smrt/line-nsl.svg`
- `src/assets/smrt/line-ewl.svg`
- `src/assets/smrt/line-ccl.svg`
- `src/assets/smrt/line-tel.svg`
- `src/assets/smrt/line-bplrt.svg`

Add mapping helper:

- `src/features/game/lineBranding.ts`
  - line code -> badge asset
  - line code -> semantic label
  - line code -> css class/token

## 6. Accessibility and Responsiveness

- Maintain strong color contrast for text on tinted surfaces.
- Keep visible focus styles for keyboard navigation.
- Ensure desktop-first layout still behaves correctly on small screens.

## 7. Testing and Verification

- Existing gameplay/rules tests should remain unchanged and passing.
- Update UI tests only where selectors become stale from presentational edits.
- Run full quality gate:
  - `npm run lint`
  - `npm run test`
  - `npm run build`
  - `PLAYWRIGHT_BROWSERS_PATH=/tmp/pw-browsers npm run test:e2e -- tests/e2e/pass-and-play.spec.ts`

## 8. Non-Goals

- No gameplay rules changes.
- No new network dependencies for assets.
- No online multiplayer enhancements in this change set.
