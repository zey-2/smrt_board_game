# Decoupled Timed And Fixed-Round Modes Design

**Goal:** Decouple timed mode from fixed-round mode so players can explicitly choose `Classic`, `Timed`, or `Fixed rounds`, with timed games ending by live wall-clock time and pausing whenever the live game screen is not active.

## Decision

Replace the current overloaded `Game length` model with three explicit setup modes:

- `Classic`
- `Timed`
- `Fixed rounds`

`Classic` keeps the existing last-player-standing rule.

`Timed` becomes a real wall-clock mode with user-selectable time limits like `10 / 15 / 20 / 30 minutes`. The countdown only runs while the live game screen is mounted. Leaving the game screen or saving the game pauses the timer.

`Fixed rounds` becomes a separate setup choice with a direct round-limit selector. It remains the simulation-friendly pacing mode.

## Why This Approach

- The current timed presets are not truly timed. They are fixed-round caps with time-flavored labels, which is misleading once the product language starts promising a countdown timer.
- Wall-clock timing and fixed-round pacing solve different player needs. Timed mode is a live-session pacing tool. Fixed rounds is a deterministic rules mode that is easier to test and simulate.
- Keeping `Classic` separate preserves the long-form elimination game without forcing timer logic into every path.

## Mode Model

The game configuration should express the player-facing rule choice directly instead of inferring it from labels.

Recommended shape:

- `mode: "CLASSIC" | "TIMED" | "FIXED_ROUNDS"`
- `timeLimitSeconds?: number`
- `fixedRoundLimit?: number`
- `targetWealth`
- `initialCash`

`remainingTimeMs` belongs in runtime game state, not setup config, because it changes only while a live timed game is in progress.

## Setup UX

The setup screen should stop using a single overloaded `Game length` selector.

Recommended flow:

- `Mode` selector with `Classic`, `Timed`, and `Fixed rounds`
- a conditional secondary selector:
  - `Time limit` for timed mode
  - `Round limit` for fixed-round mode
  - nothing extra for classic mode

This keeps the setup language honest:

- `Classic` means survival
- `Timed` means live countdown
- `Fixed rounds` means exact round cap

## Live Timer Behavior

Timed mode should use a real countdown that is visible during play.

Recommended behavior:

- show `Time left` as `MM:SS` in the game status area
- decrement while the live game screen is mounted
- stop decrementing when the game screen unmounts
- persist the latest `remainingTimeMs` value in saved game state
- resume from the saved remaining time when the player resumes the game

This makes pause/resume behavior predictable and avoids background wall-clock drift while the game is not actively being played.

## End Conditions

Each mode should end differently:

- `Classic`: last active player wins
- `Timed`: when `remainingTimeMs` reaches zero, the winner is the player with the highest net worth
- `Fixed rounds`: when the configured round limit is completed, the winner is the player with the highest net worth

If top net worth is tied in timed or fixed-round mode, the game ends in a draw.

Timed-mode expiry should complete the game from the current board state after any in-flight movement animation settles, rather than waiting for another round boundary.

## State And Persistence

`remainingTimeMs` should be part of persisted `GameState`, not reconstructed from timestamps.

Why:

- pausing outside the live game screen becomes trivial
- save/resume remains deterministic
- tests can assert exact remaining-time values without dealing with clock math
- local persistence stays compatible with the existing JSON-save model

## Simulation Scope

The simulator should remain focused on rules modes that can be evaluated deterministically:

- `Classic`
- `Fixed rounds`

Real timed mode should not be treated as a primary simulation mode for balance analysis, because meaningful timed-mode simulation would require modeling real human turn duration, which is not currently part of the simulation engine.

This means the current `10 / 15 / 20 / 30 minutes` simulation report should be renamed or restructured around fixed-round presets instead of pretending to simulate real elapsed time.

## Risks

- Adding a live countdown introduces more moving parts than the current fixed-round-only model: state updates, unmount pause semantics, save/resume correctness, and timeout completion.
- If timer completion is handled partly in component code and partly in reducer code, subtle edge cases can appear around animation and save timing.
- The current simulator and setup presets share naming. Decoupling them cleanly requires untangling that shared vocabulary.

## Recommendation

Ship three explicit player-facing modes:

- `Classic` for elimination play
- `Timed` for real wall-clock sessions
- `Fixed rounds` for deterministic capped games

Persist `remainingTimeMs`, pause the timer whenever the live game screen is not active, and keep the simulator tied to classic and fixed-round analysis only.
