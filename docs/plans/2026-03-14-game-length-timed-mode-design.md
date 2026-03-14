# Game Length Timed Mode Design

**Goal:** Let players choose a target session length for 2-player games and map that choice to a calibrated round limit that keeps the game exciting while landing near the chosen duration.

## Decision

Add a setup-level `Game Length` selector with options `10 / 15 / 20 / 30 minutes`. When a player chooses one of these options, the game internally uses `FIXED_ROUNDS` with a calibrated round cap and decides the winner by highest net worth when that cap is reached.

Keep `LAST_PLAYER_STANDING` as a separate longer-session mode rather than trying to force it into a 20-minute target.

## Why This Approach

- The simulator shows that even the baseline 2-player rules already run too long for a 20-minute target, so pacing needs a direct control, not a softer economy tweak.
- A round-cap mapping is easier to balance and simulate than a real-time wall clock in a pass-and-play game, where turn speed varies a lot across groups.
- The current game model already supports `FIXED_ROUNDS`, so this feature can reuse the existing end-condition machinery instead of creating a second completion path.

## Current Evidence

The simulator output on March 14, 2026 shows:

- baseline 2-player games average about `236` rounds
- the repeatable `$500` cash tile pushes average length to over `1800` rounds
- even a much smaller reward tile still increases average game length instead of tightening it

That means the cash-tile idea is the wrong primary pacing lever for a 20-minute target.

## UX

The setup screen should lead with plain language instead of raw rule-engine terms:

- a `Game Length` selector with `10 / 15 / 20 / 30 minutes`
- a `Classic mode` or equivalent option that preserves `LAST_PLAYER_STANDING`

When a time-bound option is selected:

- the configuration uses `FIXED_ROUNDS`
- the corresponding calibrated round limit is stored in `fixedRoundLimit`
- the setup UI does not expose round numbers directly

This keeps the product language player-friendly while still reusing the existing config structure.

## Calibration Model

Add a small calibration table in the game domain that maps each time option to a round limit for the current player-count target.

For the first implementation:

- calibrate for 2-player games only
- keep the table explicit and local rather than deriving it from formulas
- let the simulator compare candidate caps so the `20 minute` option can be tuned empirically

The first pass should focus on approximate pacing and a more exciting finish, not on a perfect real-minute guarantee.

## Simulation Changes

The simulator should expand from comparing board variants to comparing timed presets:

- baseline long-form mode
- `10 minute` timed mode
- `15 minute` timed mode
- `20 minute` timed mode
- `30 minute` timed mode

For timed-mode analysis, the report should emphasize:

- average rounds played
- station purchases before game end
- lead changes
- winning-margin spread
- how often the lead changes in the final portion of the game

These metrics help identify a 20-minute mode that still has tension near the end instead of producing a predictable winner too early.

## Rule Behavior

Timed mode ends when the calibrated round cap is reached. The winner is the player with the highest net worth, using the same net-worth calculation already used in the result ranking.

Classic elimination mode stays available for groups that want a longer session.

## Risks

- A cap that is too low can make the game feel underdeveloped, with too few purchases before scoring.
- A cap that is too high misses the 20-minute goal even if the label says otherwise.
- Calibrating only for 2-player games means 3-player and 4-player timed modes will still need a follow-up balancing pass.

## Recommendation

Ship timed mode as the default recommendation for 2-player games, keep classic mode available, and remove the `$500` cash-tile idea from the default pacing strategy.
