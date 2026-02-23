interface RankingEntry {
  playerId: string;
  playerName: string;
  netWorth: number;
}

interface WinnerScreenProps {
  winnerName: string;
  ranking: RankingEntry[];
}

export function WinnerScreen({ winnerName, ranking }: WinnerScreenProps) {
  return (
    <section className="card results-board">
      <h2 className="winner-banner">Winner: {winnerName}</h2>
      <h3>Service Summary</h3>
      <ol className="ranking-list">
        {ranking.map((entry) => (
          <li key={entry.playerId}>
            {entry.playerName} - ${entry.netWorth}
          </li>
        ))}
      </ol>
    </section>
  );
}
