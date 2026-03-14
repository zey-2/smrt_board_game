import { useEffect, useState } from "react";
import type { GameState, StationTile } from "../../game/types";
import { PlayerTokenBadge } from "../players/playerAppearance";
import {
  getLineBadge,
  getLineThemeClass
} from "./lineBranding";

interface BoardViewProps {
  state: GameState;
  animatedMovement?: {
    playerId: string;
    position: number;
  } | null;
}

function getBoardColumns() {
  if (typeof window === "undefined") {
    return 5;
  }

  const ratio = window.innerWidth / Math.max(window.innerHeight, 1);
  return ratio >= 1.5 ? 6 : 5;
}

function getVisibleBoard(board: StationTile[], columns: number) {
  if (columns === 6 && board.length >= 25) {
    return board.slice(0, 24);
  }

  return board;
}

export function BoardView({ state, animatedMovement = null }: BoardViewProps) {
  const [columns, setColumns] = useState(getBoardColumns);

  useEffect(() => {
    const handleResize = () => {
      setColumns(getBoardColumns());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const visibleBoard = getVisibleBoard(state.board, columns);
  const visibleBoardIds = new Set(visibleBoard.map((tile) => tile.id));

  return (
    <section className="card game-board-panel">
      <div className="board-panel-header">
        <h3>MRT STATIONS</h3>
        <span>{visibleBoard.length} stations</span>
        <span
          style={{ color: "#4b6079", fontSize: "12px", fontWeight: 700, textTransform: "none" }}
        >{`Fare rate $${state.config.transportFareRate}/stop`}</span>
      </div>
      <ol className={`board-grid compact-board-grid ${columns === 6 ? "compact-board-grid--six-columns" : ""}`.trim()}>
        {visibleBoard.map((tile, index) => {
          const playersHere = state.players.filter((player) => {
            if (animatedMovement?.playerId === player.id) {
              return animatedMovement.position === index;
            }

            const playerTile = state.board[player.position];
            return playerTile ? playerTile.id === tile.id : false;
          });
          const lineThemeClass = getLineThemeClass(tile.line);
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
                </div>
              </div>
              <div className="station-metrics">
                <span>${tile.price}</span>
              </div>
              <div className="station-owner">Owner {tile.ownerId ?? "none"}</div>
              {playersHere.length > 0 ? (
                <div className="token-row">
                  {playersHere.map((player) => (
                    <PlayerTokenBadge
                      key={player.id}
                      iconId={player.iconId}
                      colorId={player.colorId}
                      label={`${player.name} token on ${tile.name}`}
                      className="player-token-badge"
                    />
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
      {!visibleBoardIds.has(state.board[state.players[state.turnIndex]?.position ?? 0]?.id ?? "") ? (
        <p className="info-text">Board was trimmed to 24 stations to keep a complete 6×4 grid on this display ratio.</p>
      ) : null}
    </section>
  );
}
