import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { WinnerScreen } from "./WinnerScreen";

describe("WinnerScreen", () => {
  test("renders winner and sorted net worth ranking", () => {
    render(
      <WinnerScreen
        winnerName="Player 2"
        isDraw={false}
        ranking={[
          { playerId: "p2", playerName: "Player 2", netWorth: 4200 },
          { playerId: "p1", playerName: "Player 1", netWorth: 2800 }
        ]}
      />
    );

    expect(screen.getByText("Winner: Player 2")).toBeInTheDocument();
    expect(screen.getByText("Service Summary")).toBeInTheDocument();
    const rankingItems = screen.getAllByRole("listitem");
    expect(rankingItems[0]).toHaveTextContent("Player 2");
    expect(rankingItems[1]).toHaveTextContent("Player 1");
  });

  test("renders a draw banner when the game ends without a winner", () => {
    render(
      <WinnerScreen
        winnerName="Player 1"
        isDraw
        ranking={[
          { playerId: "p1", playerName: "Player 1", netWorth: 3000 },
          { playerId: "p2", playerName: "Player 2", netWorth: 3000 }
        ]}
      />
    );

    expect(screen.getByText("Draw")).toBeInTheDocument();
    expect(screen.queryByText("Winner: Player 1")).not.toBeInTheDocument();
  });

  test("treats a player named Draw as a real winner when draw mode is off", () => {
    render(
      <WinnerScreen
        winnerName="Draw"
        isDraw={false}
        ranking={[
          { playerId: "p1", playerName: "Draw", netWorth: 4200 },
          { playerId: "p2", playerName: "Player 2", netWorth: 2800 }
        ]}
      />
    );

    expect(screen.getByText("Winner: Draw")).toBeInTheDocument();
  });
});
