# Initial Cash Calibration Design

**Goal:** Tune the default starting cash for the baseline 2-player classic game so the simulator lands near an average of 20 rounds.

## Decision

Add a narrow calibration workflow on top of the existing simulation runner, use it to evaluate a range of starting-cash candidates for the default 2-player classic setup, and then update the shared default `initialCash` value to the candidate closest to a 20-round average.

## Why This Approach

- The existing simulator already supports deterministic seeds, custom player counts, and custom `initialCash`, so the shortest reliable path is to reuse that engine rather than introduce a separate balancing model.
- A repeatable calibration workflow is less error-prone than manual edits and ad-hoc reruns because it can compare candidates under the same seed and game-count settings.
- The requested product change is narrow: only the default starting cash should change, while the rest of the game rules stay intact.

## Scope

The calibration target is the current default baseline scenario:

- `2` players
- classic mode
- baseline board preset
- `LAST_PLAYER_STANDING` end condition

The output of this work is:

- a developer-facing calibration command or mode that reports candidate cash values against the 20-round target
- an updated default `initialCash` shared by setup, initial state, and simulation defaults

## Calibration Flow

The calibration workflow should accept a compact range of candidate cash values plus deterministic run settings:

- minimum cash
- maximum cash
- step size
- game count
- seed

For each candidate, the workflow should call the existing simulation batch runner with:

- `playerCount: 2`
- `endCondition: "LAST_PLAYER_STANDING"`
- candidate `initialCash`

For each run, it should collect:

- `averageRounds`
- absolute distance from the target value `20`

The report should print the closest candidate first and also show the surrounding results so balancing decisions are based on the broader curve instead of a single isolated number.

## Product Update

After the simulation identifies the best candidate, update the shared default starting cash value in the central game-config and initial-state paths so:

- new games use the calibrated default
- the simulator uses the same default when no override is provided

This keeps balancing logic consistent across setup, runtime state, and simulation tooling.

## Verification

Verification should stay focused and deterministic:

- add tests for the calibration helper or CLI parsing/reporting logic
- verify that candidate cash values are passed into the existing simulation runner
- verify that the closest candidate is ranked correctly by distance to the 20-round target
- run the targeted simulation test suite
- run the calibration command with a fixed seed and sufficient game count to produce a credible recommendation

If two candidates are effectively tied, the tool should make that ambiguity visible instead of pretending there is a single exact answer.

## Risks

- Too few simulated games can make the recommendation noisy and lead to a poor default value.
- A coarse cash step size can miss the best nearby value.
- Reducing starting cash too aggressively can shorten games at the cost of making early bankruptcies feel abrupt.

## Recommendation

Implement the calibration workflow as a small extension of the current simulator, use it to choose a data-backed default cash value for the baseline 2-player classic game, and keep the product change limited to that default once the simulation evidence is in hand.
