# Purchase Buttons Visual Order Design

## Goal

Show `Skip Purchase` before `Buy Station` in the turn controls while preserving the current DOM order and keyboard navigation order.

## Current State

`TurnControls` renders the purchase actions in DOM order as `Buy Station` followed by `Skip Purchase` inside the existing `.inline-actions` flex row.

## Approaches Considered

1. Add button-specific classes and swap only the visual order with CSS `order`.
2. Reverse the whole action row with flexbox.
3. Swap the JSX order directly.

## Recommended Approach

Use button-specific classes and set flex `order` in CSS for just these two controls.

This is the narrowest change. It satisfies the visual request without changing DOM order, tab order, or screen reader reading order. It also avoids affecting other buttons that share the `.inline-actions` container.

## Component Changes

- `src/features/game/TurnControls.tsx`
  Add stable class names to the `Buy Station` and `Skip Purchase` buttons.
- `src/styles.css`
  Add `order` rules scoped to the purchase-action classes inside the control panel.

## Testing

Add a regression test in `src/features/game/GameScreen.test.tsx` that renders the resolve-tile state and checks:
- the DOM order remains `Buy Station` then `Skip Purchase`
- the computed flex order makes `Skip Purchase` sort before `Buy Station`
