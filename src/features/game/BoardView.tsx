import type { GameState } from "../../game/types";
import {
  getLineBadge,
  getLineLabel,
  getLineThemeClass
} from "./lineBranding";

interface BoardViewProps {
  state: GameState;
}

const INTERCHANGE_STATIONS = new Set([
  "Jurong East",
  "Bishan",
  "City Hall",
  "Raffles Place",
  "Serangoon",
  "HarbourFront",
  "Stevens",
  "Woodlands"
]);

export function BoardView({ state }: BoardViewProps) {
  return (
    <section className="card">
      <h3>Board</h3>
      <ol className="board-grid">
        {state.board.map((tile, index) => {
          const playersHere = state.players.filter((player) => player.position === index);
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
                <div>
                  <strong>{tile.name}</strong>
                  <div className="station-sub">{lineLabel}</div>
                </div>
              </div>
              {INTERCHANGE_STATIONS.has(tile.name) ? (
                <div className="station-sub">Interchange Hub</div>
              ) : null}
              <div>Price: ${tile.price}</div>
              <div>Rent: ${tile.baseRent}</div>
              <div>Owner: {tile.ownerId ?? "None"}</div>
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
