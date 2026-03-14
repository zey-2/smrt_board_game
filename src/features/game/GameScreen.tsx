import { useEffect, useReducer, useState } from "react";
import { calculateNetWorth } from "../../game/rules/economy";
import { getMovementPath } from "../../game/rules/movement";
import { saveGameState } from "../../game/persistence/localSave";
import type { GameState } from "../../game/types";
import type { GameAction } from "../../game/state/actions";
import { reducer } from "../../game/state/reducer";
import { BoardView } from "./BoardView";
import { PassDeviceOverlay } from "./PassDeviceOverlay";
import { PlayerPanel } from "./PlayerPanel";
import { WinnerScreen } from "../results/WinnerScreen";
import { TurnControls } from "./TurnControls";

interface GameScreenProps {
  initial: GameState;
  diceValueProvider?: () => number;
  onExitWithSave?: (state: GameState) => void;
  onExitWithoutSave?: () => void;
}

export function GameScreen({
  initial,
  diceValueProvider = () => Math.floor(Math.random() * 6) + 1,
  onExitWithSave = () => {},
  onExitWithoutSave = () => {}
}: GameScreenProps) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [showPassOverlay, setShowPassOverlay] = useState(false);
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
      setShowPassOverlay(true);
    }
  };

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

  const winnerName = state.players.find((player) => player.id === state.winnerId)?.name ?? "No winner";
  const isCompleted = state.phase === "completed";

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
            <h2>SMRT Monopoly</h2>
            <div className="status-pills">
              <span>Round: {state.round}</span>
              <span>Phase: {state.phase}</span>
            </div>
          </header>
          <TurnControls
            state={state}
            onDispatch={handleDispatch}
            diceValueProvider={diceValueProvider}
            isMovementInProgress={isMovementInProgress}
            onExitWithSave={() => onExitWithSave(state)}
            onExitWithoutSave={onExitWithoutSave}
          />
          <PlayerPanel state={state} />
        </aside>
      </div>
      {isCompleted ? (
        <WinnerScreen winnerName={winnerName} ranking={ranking} />
      ) : null}
      {showPassOverlay ? (
        <PassDeviceOverlay nextPlayerName={nextPlayerName} onContinue={() => setShowPassOverlay(false)} />
      ) : null}
    </section>
  );
}
