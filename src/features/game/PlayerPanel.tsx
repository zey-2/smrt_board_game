import type { GameState } from "../../game/types";
import { PlayerTokenBadge } from "../players/playerAppearance";

interface PlayerPanelProps {
  state: GameState;
}

export function PlayerPanel({ state }: PlayerPanelProps) {
  return (
    <section className="card player-panel">
      <h3>Players</h3>
      <ul className="player-list">
        {state.players.map((player, index) => (
          <li
            key={player.id}
            className={
              index === state.turnIndex
                ? "player-card active-player service-running"
                : "player-card"
            }
          >
            <div className="player-card-header">
              <PlayerTokenBadge
                iconId={player.iconId}
                colorId={player.colorId}
                label={`${player.name} player token`}
                className="player-token-badge"
              />
              <strong>{player.name}</strong>
            </div>
            <div>Cash ${player.cash}</div>
            <div>Status {player.status}</div>
            <div>Stations {player.ownedStationIds.length}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
