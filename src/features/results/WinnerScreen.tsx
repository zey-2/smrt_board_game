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
  const bannerText = winnerName === "Draw" ? "Draw" : `Winner: ${winnerName}`;

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
