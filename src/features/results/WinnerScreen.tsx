interface RankingEntry {
  playerId: string;
  playerName: string;
  netWorth: number;
}

interface WinnerScreenProps {
  winnerName: string | null;
  isDraw: boolean;
  ranking: RankingEntry[];
}

export function WinnerScreen({ winnerName, isDraw, ranking }: WinnerScreenProps) {
  const bannerText = isDraw ? "Draw" : `Winner: ${winnerName ?? "Unknown winner"}`;

  return (
    <section className="card results-board">
      <h2 className="winner-banner">{bannerText}</h2>
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
