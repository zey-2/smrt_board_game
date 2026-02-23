# SMRT Monopoly V1 Rules

## Visual Theme

- Interface follows a faithful SMRT map-inspired visual style.
- Station tiles use line-specific color rails and local line badges.
- Setup, status, and results panels use transit-signage style treatment.

## Setup

1. Choose 2-4 players and enter names.
2. Board preset uses SMRT key stations.
3. Each player votes for one end condition.
4. The game starts only when one end condition has a strict majority.
5. Players begin with equal starting cash.

## Turn Flow

1. Current player rolls dice.
2. Token moves forward by dice value and wraps around the board.
3. Resolve landed station:
   - Unowned station: buy or skip.
   - Owned station: rent logic is applied by the rules engine.
4. End turn.
5. Pass-device overlay appears before next player continues.

## Economy

- Buying a station deducts station price from player cash.
- A station can only be purchased if unowned and affordable.
- Rent payment transfers cash from payer to owner.
- If payer cannot fully cover rent, they pay remaining cash and are marked bankrupt.
- Net worth = cash + owned station values.

## End Conditions

### Last Player Not Bankrupt

Winner is the only player with `active` status.

### Fixed Rounds

When configured round limit is reached, highest net worth wins.

### Target Wealth

First player to reach or exceed configured target net worth wins.

## Persistence

- Game state auto-saves to browser `localStorage` after each state change.
- On app load, players can resume the saved game.
