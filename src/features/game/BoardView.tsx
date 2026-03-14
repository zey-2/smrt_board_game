import type { GameState } from "../../game/types";
import {
  getLineBadge,
  getLineLabel,
  getLineThemeClass
} from "./lineBranding";

interface BoardViewProps {
  state: GameState;
  animatedMovement?: {
    playerId: string;
    position: number;
  } | null;
}

export function BoardView({ state, animatedMovement = null }: BoardViewProps) {
  return (
    <section className="card game-board-panel">
      <div className="board-panel-header">
        <h3>MRT STATIONS</h3>
        <span>{state.board.length} stations</span>
      </div>
      <ol className="board-grid compact-board-grid">
        {state.board.map((tile, index) => {
          const playersHere = state.players.filter((player) => {
            if (animatedMovement?.playerId === player.id) {
              return animatedMovement.position === index;
            }

            return player.position === index;
          });
          const lineThemeClass = getLineThemeClass(tile.line);
          const lineLabel = getLineLabel(tile.line);
          return (
            <li key={tile.id} className={`board-tile ${lineThemeClass}`}>
              <div className="station-head">
                <img
                  src={getLineBadge(tile.line)}
                  alt={`${tile.line} line badge`}
                  className="line-badge"
                />
                <div className="station-heading">
                  <strong>{tile.name}</strong>
                  <div className="station-sub">{lineLabel}</div>
                </div>
              </div>
              <div className="station-metrics">
                <span>${tile.price}</span>
                <span>Rent {tile.baseRent}</span>
              </div>
              <div className="station-owner">Owner {tile.ownerId ?? "none"}</div>
              {playersHere.length > 0 ? (
                <div className="token-row">
                  {playersHere.map((player) => (
                    <span key={player.id}>{player.name}</span>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
