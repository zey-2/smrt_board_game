# SMRT Monopoly-Like Digital Game Design

**Date:** 2026-02-23  
**Status:** Approved  
**Product:** Desktop-first web game (local pass-and-play)

## 1. Scope and Product Goals

Build a Monopoly-like board game themed on the Singapore SMRT network for 2-4 players, playable on one device in local pass-and-play mode, with a target game duration of 45-60 minutes.

### Confirmed Decisions
- Use SMRT map as board reference.
- Focus on key stations (not full line-by-line station coverage).
- Let players choose the end condition at setup via table vote.
- Digital game first.
- Platform: desktop-first web browser.
- Local pass-and-play first.
- Preferred stack: React + TypeScript + Vite.

## 2. Architecture

### Game Setup Layer
- Collect player names (2-4).
- Select key-station board preset (SMRT key stations).
- Run table vote to choose end condition.
- Validate setup before game start.

### Rules Engine (Pure TS)
- Contains all turn and rules logic with no UI dependencies.
- Handles dice movement, purchases, rent transfer, bankruptcy, and win checks.
- Rejects invalid actions with explicit reasons.

### State Management
- Centralized immutable `GameState` managed with reducer actions.
- Deterministic updates from action dispatches.
- Action log retained for traceability and replay/debug support.

### UI Layer
- Board rendering for station tiles and token positions.
- Panels for player cash, ownership, and turn phase.
- Action prompts for buy/skip/end turn.

### Session/Handoff Layer
- Pass-device screen between turns.
- Prevents next player from seeing prior player details before confirmation.

## 3. Core Data Model

### `StationTile`
- `id`
- `name`
- `line`
- `price`
- `baseRent`
- `group`
- `ownerId` (nullable)

### `Player`
- `id`
- `name`
- `cash`
- `position`
- `ownedStations`
- `status` (`active` or `bankrupt`)

### `GameConfig`
- `stationPresetId`
- `endCondition`
- `initialCash`
- `fixedRoundLimit` (if applicable)
- `targetWealth` (if applicable)

### `GameState`
- `players`
- `board`
- `turnIndex`
- `round`
- `phase`
- `lastDiceRoll`
- `pendingMessage`
- `actionLog`
- `winner` (nullable)

## 4. Gameplay Flow

1. Setup is completed and validated.
2. Current player rolls dice.
3. Token advances on board loop.
4. Landed tile resolves:
- Unowned station: buy or skip.
- Opponent-owned station: pay rent.
- Neutral/event tile: apply defined effect.
5. End-turn summary is shown.
6. Pass-device handoff screen appears.
7. Next player continues.
8. End condition is checked each turn cycle and after major wealth changes.

## 5. End Conditions (Player-Voted)

At setup, players vote and majority decides one mode:
- Last player not bankrupt.
- Fixed rounds, highest net worth wins.
- Target wealth reached first.

## 6. Error Handling and Recovery

- All rule validation is serverless local logic in rules engine.
- Invalid actions do not mutate state and return user-facing errors.
- Setup cannot start if required fields are incomplete.
- State auto-saves after every action in `localStorage`.
- On refresh, players can restore latest snapshot.

## 7. Testing Strategy

### Unit Tests (Rules Engine)
- Dice movement and board wrap behavior.
- Purchase success/failure.
- Rent payment and transfer.
- Bankruptcy transitions.
- Each end condition trigger logic.

### Reducer Tests
- Invalid action rejection.
- Deterministic action processing and no accidental mutation.

### Integration Tests
- End-to-end 2-player run for each end condition.
- Setup-to-win flow with pass-and-play handoff checkpoints.

### Regression Scenarios
- Near-bankruptcy edge case.
- Final round net-worth tie handling.
- Exact target wealth reached.

## 8. Non-Goals for V1

- Online multiplayer.
- Mobile-first layout.
- Full SMRT station coverage.
- AI opponents.
- Advanced animations and effects.

