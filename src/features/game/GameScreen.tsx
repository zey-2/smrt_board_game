import { useEffect, useReducer, useState } from "react";
import { calculateNetWorth } from "../../game/rules/economy";
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
}

export function GameScreen({
  initial,
  diceValueProvider = () => Math.floor(Math.random() * 6) + 1
}: GameScreenProps) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [showPassOverlay, setShowPassOverlay] = useState(false);

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  const handleDispatch = (action: GameAction) => {
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
        <aside className="game-sidebar">
          <header className="card map-status map-status-compact">
            <h2>SMRT Monopoly</h2>
            <div className="status-pills">
              <span>Round: {state.round}</span>
              <span>Phase: {state.phase}</span>
            </div>
          </header>
          <TurnControls state={state} onDispatch={handleDispatch} diceValueProvider={diceValueProvider} />
          <PlayerPanel state={state} />
        </aside>
        <BoardView state={state} />
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
