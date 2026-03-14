import type { GameAction } from "../../game/state/actions";
import type { GameState } from "../../game/types";

interface TurnControlsProps {
  state: GameState;
  onDispatch: (action: GameAction) => void;
  diceValueProvider: () => number;
  isMovementInProgress: boolean;
  showTurnHandoff: boolean;
  nextPlayerName: string;
  onStartTurn: () => void;
  isAutoPlayEnabled: boolean;
  onToggleAutoPlay: () => void;
  reserveCashTarget: number;
}

export function TurnControls({
  state,
  onDispatch,
  diceValueProvider,
  isMovementInProgress,
  showTurnHandoff,
  nextPlayerName,
  onStartTurn,
  isAutoPlayEnabled,
  onToggleAutoPlay,
  reserveCashTarget
}: TurnControlsProps) {
  const player = state.players[state.turnIndex];
  const tile = state.board[player.position];
  const canAfford = player.cash >= tile.price;
  const showResolveActions =
    state.phase === "resolve_tile" && !isMovementInProgress && tile.ownerId === null;
  const canBuy = showResolveActions && tile.ownerId === null && canAfford;

  return (
    <section className="card control-panel">
      <h3>Turn Controls</h3>
      <div className="inline-actions">
        <button type="button" className="accent-button" onClick={onToggleAutoPlay}>
          {isAutoPlayEnabled ? "Disable Auto Play" : "Enable Auto Play"}
        </button>
      </div>
      <p className="info-text">
        Auto play keeps at least ${reserveCashTarget} before buying stations.
      </p>
      {showTurnHandoff ? (
        <div className="turn-handoff-card">
          <h4>{nextPlayerName}'s Turn</h4>
          <button className="primary-button" type="button" onClick={onStartTurn}>
            Start Turn
          </button>
        </div>
      ) : (
        <>
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

            {showResolveActions ? (
              <>
                <button
                  className="purchase-action-buy"
                  type="button"
                  onClick={() => onDispatch({ type: "BUY_STATION" })}
                  disabled={!canBuy}
                >
                  Buy Station
                </button>
                <button
                  className="accent-button purchase-action-skip"
                  type="button"
                  onClick={() => onDispatch({ type: "SKIP_PURCHASE" })}
                >
                  Skip Purchase
                </button>
              </>
            ) : null}

            {state.phase === "turn_end" && !isMovementInProgress ? (
              <button className="primary-button" type="button" onClick={() => onDispatch({ type: "END_TURN" })}>
                End Turn
              </button>
            ) : null}
          </div>
        </>
      )}
      {state.pendingMessage ? <p className="info-text">{state.pendingMessage}</p> : null}
    </section>
  );
}
