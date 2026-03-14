# Cash Tile Simulation Design

**Goal:** Evaluate whether replacing `Choa Chu Kang LRT` with a repeatable `$500` cash tile makes the game more exciting.

## Decision

Build a developer-only Monte Carlo simulator that compares two presets:

- `baseline`: current 25-tile board with rent enabled inside the simulator
- `cash-tile-variant`: same board except `Choa Chu Kang LRT` is replaced with a repeatable `$500` cash tile, with rent enabled

No UI or live reducer changes are part of this first phase.

## Why This Approach

- The current shipped turn loop does not apply rent, so the simulator needs its own landing-resolution engine to produce meaningful interaction data.
- A terminal-first simulator is faster to build and easier to rerun than an in-app sandbox.
- Keeping the simulation engine separate from the React reducer lets us test rule variants without entangling batch logic with UI phase management.

## Simulation Architecture

- Add a `src/game/simulation/` module for simulation-only types, presets, policy, engine, metrics, and reporting.
- Represent simulation tiles as a union of:
  - station tiles derived from `KEY_STATIONS_PRESET`
  - a new cash tile that awards `$500` every time a player lands on it
- Reuse existing pure rule helpers where they still fit:
  - `movePosition`
  - `buyStation`
  - `payRent`
  - `calculateNetWorth`
  - `evaluateEndCondition`
- Keep simulator state independent from `GameState` so rent behavior and per-run metrics can evolve without forcing UI changes.

## Turn Resolution

Each simulated turn follows:

1. Roll a seeded die from 1 to 6.
2. Move the active player.
3. Resolve the landing tile:
   - unowned station: buy if the bot policy allows it
   - owned station by another player: pay base rent
   - owned station by self: no economic change
   - cash tile: award `$500`
4. Record per-turn metrics.
5. Advance the turn and evaluate the configured end condition.

## Bot Policy

Use a simple configurable heuristic for the first pass:

- buy an unowned station only if cash after purchase stays at or above a safety threshold
- skip the purchase otherwise
- pay rent automatically
- collect the cash-tile reward automatically

The initial safety threshold should be set near a medium rent band so we can rerun the simulation with more aggressive or conservative buyers without changing engine code.

## Metrics

The simulator should report metrics that map to excitement, not just completion speed:

- average rounds to finish
- win-rate spread by seat order
- average ending cash and ending net worth
- number of station purchases
- number of rent payments
- number of bankruptcies
- number of lead changes in net worth
- landing frequency by tile
- how often the `$500` tile directly enables a station purchase on that turn or the next turn

The output should show a side-by-side comparison for `baseline` and `cash-tile-variant`.

## Tooling

- Add a developer command `npm run simulate`
- Run the simulator from a small Node entrypoint with a fixed seed and configurable game count
- Keep the output terminal-readable and deterministic for the same seed

## Testing

- unit tests for preset construction and tile replacement
- unit tests for landing resolution, including purchase, rent, and cash awards
- deterministic runner tests using a fixed seed
- one regression test proving the variant produces a measurable difference from baseline

## Risks

- A very large `$500` payout may mainly inflate cash and delay tension instead of improving interaction.
- Simulator-only rent behavior can drift from the live reducer if the live game later adopts rent differently.
- Lead-change and purchase-enable metrics need careful definitions so the report stays trustworthy.
