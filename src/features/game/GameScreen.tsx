import { useEffect, useReducer, useState } from "react";
import { calculateNetWorth } from "../../game/rules/economy";
import { getMovementPath } from "../../game/rules/movement";
import { saveGameState } from "../../game/persistence/localSave";
import type { GameState } from "../../game/types";
import type { GameAction } from "../../game/state/actions";
import { reducer } from "../../game/state/reducer";
import { BoardView } from "./BoardView";
import { PlayerPanel } from "./PlayerPanel";
import { WinnerScreen } from "../results/WinnerScreen";
import { TurnControls } from "./TurnControls";

interface GameScreenProps {
  initial: GameState;
  diceValueProvider?: () => number;
  onExitWithSave?: (state: GameState) => void;
  onExitWithoutSave?: () => void;
}

function formatRemainingTime(remainingTimeMs: number | null) {
  if (remainingTimeMs === null) {
    return null;
  }

  const totalSeconds = Math.max(0, Math.floor(remainingTimeMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function GameScreen({
  initial,
  diceValueProvider = () => Math.floor(Math.random() * 6) + 1,
  onExitWithSave = () => {},
  onExitWithoutSave = () => {}
}: GameScreenProps) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [showTurnHandoff, setShowTurnHandoff] = useState(false);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(false);
  const reserveCashTarget = Math.max(100, Math.round(state.config.initialCash * 0.2));
  const [movementPlayback, setMovementPlayback] = useState<{
    playerId: string;
    path: number[];
    stepIndex: number;
  } | null>(null);

  const isMovementInProgress = movementPlayback !== null;

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  useEffect(() => {
    if (state.config.mode !== "TIMED" || state.phase === "completed") {
      return undefined;
    }

    let lastTickAt = Date.now();
    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - lastTickAt;
      lastTickAt = now;
      dispatch({ type: "TICK_TIMER", payload: { elapsedMs } });
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [state.config.mode, state.phase]);

  useEffect(() => {
    if (!movementPlayback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setMovementPlayback((currentPlayback) => {
        if (!currentPlayback) {
          return null;
        }

        if (currentPlayback.stepIndex >= currentPlayback.path.length - 1) {
          return null;
        }

        return {
          ...currentPlayback,
          stepIndex: currentPlayback.stepIndex + 1
        };
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [movementPlayback]);

  const handleDispatch = (action: GameAction) => {
    if (action.type === "ROLL_DICE") {
      const currentPlayer = state.players[state.turnIndex];

      if (state.phase === "roll" && currentPlayer && currentPlayer.status === "active") {
        const path = getMovementPath(
          currentPlayer.position,
          action.payload.value,
          state.board.length
        );

        setMovementPlayback(
          path.length > 0
            ? {
                playerId: currentPlayer.id,
                path,
                stepIndex: 0
              }
            : null
        );
      }
    }

    dispatch(action);
    if (action.type === "END_TURN") {
      setShowTurnHandoff(true);
    }
  };

  useEffect(() => {
    if (!isAutoPlayEnabled || state.phase === "completed") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      if (showTurnHandoff) {
        setShowTurnHandoff(false);
        return;
      }

      if (isMovementInProgress) {
        return;
      }

      if (state.phase === "roll") {
        handleDispatch({
          type: "ROLL_DICE",
          payload: { value: diceValueProvider() }
        });
        return;
      }

      if (state.phase === "resolve_tile") {
        const currentPlayer = state.players[state.turnIndex];
        const tile = state.board[currentPlayer.position];
        const shouldConserveMoney = currentPlayer.cash - tile.price < reserveCashTarget;

        handleDispatch({ type: shouldConserveMoney ? "SKIP_PURCHASE" : "BUY_STATION" });
        return;
      }

      if (state.phase === "turn_end") {
        handleDispatch({ type: "END_TURN" });
      }
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [
    diceValueProvider,
    handleDispatch,
    isAutoPlayEnabled,
    isMovementInProgress,
    reserveCashTarget,
    showTurnHandoff,
    state
  ]);

  const nextPlayerName = state.players[state.turnIndex]?.name ?? "Next player";
  const ranking = [...state.players]
    .map((player) => {
      const assetValues = player.ownedStationIds.map(
        (stationId) => state.board.find((tile) => tile.id === stationId)?.price ?? 0
      );
      return {
        playerId: player.id,
        playerName: player.name,
        netWorth: calculateNetWorth(player.cash, assetValues)
      };
    })
    .sort((a, b) => b.netWorth - a.netWorth);

  const isCompleted = state.phase === "completed";
  const isDraw = isCompleted && state.winnerId === null;
  const winnerName = state.players.find((player) => player.id === state.winnerId)?.name ?? null;
  const remainingTimeLabel =
    state.config.mode === "TIMED" ? formatRemainingTime(state.remainingTimeMs) : null;

  return (
    <section className="game-layout">
      <div className="game-viewport">
        <BoardView
          state={state}
          animatedMovement={
            movementPlayback
              ? {
                  playerId: movementPlayback.playerId,
                  position: movementPlayback.path[movementPlayback.stepIndex]
                }
              : null
          }
        />
        <aside className="game-sidebar">
          <header className="card map-status map-status-compact">
            <div className="map-status-main">
              <h2>SMRT Monopoly</h2>
              <div className="status-pills">
                <span>Round: {state.round}</span>
                <span>Phase: {state.phase}</span>
                {remainingTimeLabel ? <span>Time left: {remainingTimeLabel}</span> : null}
              </div>
            </div>
            <div className="inline-actions map-status-actions">
              <button type="button" onClick={() => onExitWithSave(state)}>
                Save
              </button>
              <button type="button" onClick={onExitWithoutSave}>
                Abort
              </button>
            </div>
          </header>
          <TurnControls
            state={state}
            onDispatch={handleDispatch}
            diceValueProvider={diceValueProvider}
            isMovementInProgress={isMovementInProgress}
            showTurnHandoff={showTurnHandoff}
            nextPlayerName={nextPlayerName}
            onStartTurn={() => setShowTurnHandoff(false)}
            isAutoPlayEnabled={isAutoPlayEnabled}
            onToggleAutoPlay={() => setIsAutoPlayEnabled((current) => !current)}
            reserveCashTarget={reserveCashTarget}
          />
          <PlayerPanel state={state} />
        </aside>
      </div>
      {isCompleted ? (
        <WinnerScreen winnerName={winnerName} isDraw={isDraw} ranking={ranking} />
      ) : null}
    </section>
  );
}
