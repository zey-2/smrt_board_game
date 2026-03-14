# Exit Game Save Flow Design

## Summary

Add two explicit in-game exit actions so players can leave a running game without relying on hidden autosave behavior.

## Problem

The app already persists game state to local storage during play, and the setup screen can resume a saved game. However, the game screen does not expose any exit controls, so players have no clear way to return to setup while choosing whether the current session should remain resumable.

## Decision

Add two buttons to the in-game controls:

- `Exit Game With Save`
- `Exit Game Without Save`

`Exit Game With Save` will explicitly save the current game state and return the player to setup. The saved-game prompt remains available on the setup screen.

`Exit Game Without Save` will clear saved game data and return the player to setup. The saved-game prompt will not appear after exit.

## Architecture

`App` remains the owner of top-level navigation between setup and gameplay. It will pass exit handlers into `GameScreen`, because the decision to return to setup and whether a saved game should remain available is application-level behavior rather than turn-control logic.

`GameScreen` will keep its existing gameplay reducer and autosave behavior, but expose the two exit buttons in the visible control area. The buttons call app-provided handlers with the current reducer state.

Persistence stays centralized in `src/game/persistence/localSave.ts`, which will gain a helper to remove the saved state.

## Testing

Add app-level tests for:

- exiting with save returns to setup and keeps the saved-game resume affordance visible
- exiting without save returns to setup and removes the saved-game resume affordance

These tests cover the real user-facing outcome instead of only unit-testing storage helpers.
