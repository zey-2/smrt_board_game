# Transport Fare Revamp Design

**Goal:** Revamp the core economy so moving between stations costs money, longer journeys cost more, and owned destination stations collect that transport fare instead of using fixed rent.

## Decision

Replace the current fixed landed-station rent with an automatic distance-based transport fare:

- every turn still starts with a dice roll and normal movement
- fare is computed as `steps × baseRate`
- if the destination station is owned by another player, that owner collects the fare
- if the destination station is owned by the mover, no fare is paid
- if the destination station is unowned, no fare is paid
- unowned stations can still be purchased after arrival

## Why This Approach

- The current economy makes ownership matter too slowly because rent is fixed and relatively low compared with station prices.
- A distance-based fare ties payment pressure directly to movement, which creates stronger mid-game and late-game swings without adding more player decisions to each turn.
- Routing fare only to the destination owner keeps the rule simple enough to explain in one sentence and avoids the bookkeeping overhead of charging for every station passed.
- Removing bank collection keeps money circulating between players, which should make the game more volatile and more exciting once ownership coverage expands.

## Core Rule

On each roll:

1. move by the dice value as usual
2. calculate transport fare as `rolledSteps × baseRate`
3. resolve destination station ownership

Ownership outcomes:

- `owned by another player`: mover pays the destination owner the computed fare
- `owned by the mover`: no fare is charged
- `unowned`: no fare is charged, and the mover may still buy the station

Bankruptcy behavior stays the same:

- if a player cannot fully cover a fare, they pay what they have and become bankrupt

## Economy and Progression

This design makes station ownership valuable for traffic capture rather than a flat rent table.

For the first implementation:

- keep existing station purchase prices
- keep the current buy-or-skip flow for unowned stations
- replace fixed rent with one shared `baseRate`
- use the simulator to calibrate that `baseRate`

Expected pacing shape:

- early game: light pressure because many stations are still unowned
- mid game: more owned destinations mean more frequent fare transfers
- late game: long rolls into owned stations create decisive knockouts faster than the current system

## Data and Rule Impact

The current board already stores `price` and `baseRent`. Under this revamp:

- `price` remains relevant for purchase decisions and net-worth scoring
- `baseRent` is no longer the active landed-on payment rule
- a new shared fare-rate value becomes the main tuning parameter

The reducer, economy helpers, and simulation engine all need to know the rolled distance for fare resolution, because payment now depends on how far the player just travelled rather than only on the destination tile.

## Simulation and Calibration

The simulator should be updated to model transport fare as the new primary payment mechanic and compare candidate `baseRate` values against the current baseline.

Simulation goals:

- find a fare rate that sharply reduces average rounds from the current classic baseline
- observe bankruptcy frequency, lead changes, and ownership pressure
- confirm the new rule is actually capable of approaching the desired pacing target

The simulator should support sweeping `baseRate` values in the same way the cash-calibration workflow sweeps `initialCash`.

## UX and Messaging

The player-facing flow should remain familiar:

- roll dice
- move
- resolve the destination station
- optionally buy if unowned

What changes is the language:

- action log and turn messages should say `transport fare` instead of `rent`
- messages should mention the journey distance when fare is charged
- unowned destination messages should remain simple and not mention any bank payment

## Risks

- If `baseRate` is too low, the new system will look different but still fail to shorten the game enough.
- If `baseRate` is too high, long rolls can feel arbitrarily fatal.
- Because unowned stations do not charge, the early game may still be too gentle unless ownership spreads quickly enough.
- Leaving `baseRent` in the data model during transition can create confusion if the code mixes old and new rules.

## Recommendation

Implement the transport-fare rule with one shared `baseRate`, replace fixed rent entirely, use simulation to calibrate the rate, and keep the first version intentionally narrow before adding premium lines, banded fares, or other complexity.
