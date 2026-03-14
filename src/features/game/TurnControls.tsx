import type { GameAction } from "../../game/state/actions";
import type { GameState } from "../../game/types";

interface TurnControlsProps {
  state: GameState;
  onDispatch: (action: GameAction) => void;
  diceValueProvider: () => number;
  onExitWithSave: () => void;
  onExitWithoutSave: () => void;
}

export function TurnControls({
  state,
  onDispatch,
  diceValueProvider,
  onExitWithSave,
  onExitWithoutSave
}: TurnControlsProps) {
  const player = state.players[state.turnIndex];
  const tile = state.board[player.position];
  const canAfford = player.cash >= tile.price;
  const canBuy = state.phase === "resolve_tile" && tile.ownerId === null && canAfford;

  return (
    <section className="card control-panel">
      <h3>Turn Controls</h3>
      <div className="control-summary">
        <p>
          <span>Now</span>
          <strong>{player.name}</strong>
        </p>
        <p>
          <span>Tile</span>
          <strong>{tile.name}</strong>
        </p>
      </div>
      <div className="inline-actions">
        {state.phase === "roll" ? (
          <button
            className="primary-button"
            type="button"
            onClick={() =>
              onDispatch({
                type: "ROLL_DICE",
                payload: { value: diceValueProvider() }
              })
            }
          >
            Roll Dice
          </button>
        ) : null}

        {state.phase === "resolve_tile" ? (
          <>
            <button type="button" onClick={() => onDispatch({ type: "BUY_STATION" })} disabled={!canBuy}>
              Buy Station
            </button>
            <button className="accent-button" type="button" onClick={() => onDispatch({ type: "SKIP_PURCHASE" })}>
              Skip Purchase
            </button>
          </>
        ) : null}

        {state.phase === "turn_end" ? (
          <button className="primary-button" type="button" onClick={() => onDispatch({ type: "END_TURN" })}>
            End Turn
          </button>
        ) : null}
      </div>
      <div className="inline-actions exit-actions">
        <button type="button" onClick={onExitWithSave}>
          Save
        </button>
        <button type="button" onClick={onExitWithoutSave}>
          Abort
        </button>
      </div>
      {state.pendingMessage ? <p className="info-text">{state.pendingMessage}</p> : null}
    </section>
  );
}
