import type { GameState } from "../../game/types";

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
            <strong>{player.name}</strong>
            <div>Cash ${player.cash}</div>
            <div>Status {player.status}</div>
            <div>Stations {player.ownedStationIds.length}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
