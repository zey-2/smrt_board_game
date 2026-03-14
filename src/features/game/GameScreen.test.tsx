import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { createGameState, initialState } from "../../game/state/initialState";
import { GameScreen } from "./GameScreen";
import "../../styles.css";

afterEach(() => {
  vi.useRealTimers();
});


function setViewportSize(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
    writable: true
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: height,
    writable: true
  });
  window.dispatchEvent(new Event("resize"));
}

async function advancePlaybackFrames(frameCount: number, frameDuration = 300) {
  for (let index = 0; index < frameCount; index += 1) {
    await act(async () => {
      vi.advanceTimersByTime(frameDuration);
    });
  }
}

function createTimedState() {
  return createGameState(initialState.players, {
    ...initialState.config,
    mode: "TIMED",
    timeLimitSeconds: 600,
    endCondition: "LAST_PLAYER_STANDING"
  });
}

describe("GameScreen", () => {
  test("allows current player to roll and updates phase", async () => {
    const user = userEvent.setup();
    render(<GameScreen initial={initialState} diceValueProvider={() => 4} />);

    expect(screen.getByText("Phase: roll")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Roll Dice" }));
    expect(screen.getByText("Phase: resolve_tile")).toBeInTheDocument();
  });

  test("shows a live time-left countdown in timed mode", () => {
    vi.useFakeTimers();

    render(<GameScreen initial={createTimedState()} />);

    expect(screen.getByText("Time left: 10:00")).toBeInTheDocument();
  });

  test("ticks the countdown while the live game screen is mounted", async () => {
    vi.useFakeTimers();

    render(<GameScreen initial={createTimedState()} />);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText("Time left: 09:57")).toBeInTheDocument();
  });

  test("does not show the countdown in classic mode", () => {
    render(<GameScreen initial={initialState} />);

    expect(screen.queryByText(/Time left:/i)).not.toBeInTheDocument();
  });

  test("renders line badges on station tiles", () => {
    render(<GameScreen initial={initialState} />);
    expect(screen.getAllByAltText(/line badge/i).length).toBeGreaterThan(0);
  });

  test("renders a compact desktop layout shell with a board sidebar split", () => {
    const { container } = render(<GameScreen initial={initialState} />);

    expect(container.querySelector(".game-viewport")).toBeTruthy();
    expect(container.querySelector(".game-sidebar")).toBeTruthy();
    expect(container.querySelector(".game-board-panel")).toBeTruthy();
  });

  test("renders the board before the sidebar so the sidebar sits on the right and below on smaller screens", () => {
    const { container } = render(<GameScreen initial={initialState} />);
    const boardPanel = container.querySelector(".game-board-panel");
    const sidebar = container.querySelector(".game-sidebar");

    expect(boardPanel).toBeTruthy();
    expect(sidebar).toBeTruthy();
    expect(boardPanel?.compareDocumentPosition(sidebar as Element)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  test("uses a wide first desktop column for the board and a narrow second column for the sidebar", () => {
    const { container } = render(<GameScreen initial={initialState} />);
    const viewport = container.querySelector(".game-viewport");

    expect(viewport).toBeTruthy();
    expect(getComputedStyle(viewport as Element).gridTemplateColumns).toContain("minmax(0, 1fr) minmax(260px, 300px)");
  });

  test("shows compact station labels while keeping board data visible", () => {
    const { container } = render(<GameScreen initial={initialState} />);
    const boardPanel = container.querySelector(".game-board-panel");
    expect(boardPanel).toBeTruthy();

    const jurongEastName = within(boardPanel as HTMLElement).getAllByText("Jurong East")[0];
    const priceLabel = screen.getAllByText("$280")[0];
    const ownerLabel = screen.getAllByText(/Owner none/i)[0];
    const fareRateLabel = within(boardPanel as HTMLElement).getByText(
      `Fare rate $${initialState.config.transportFareRate}/stop`
    );

    expect(screen.getAllByText("$280").length).toBeGreaterThan(0);
    expect(screen.queryByText("Rent 28")).not.toBeInTheDocument();
    expect(screen.getAllByText(/Owner none/i).length).toBeGreaterThan(0);
    expect(screen.queryAllByText("East West Line")).toHaveLength(0);
    expect(screen.queryAllByText("Circle Line")).toHaveLength(0);
    expect(getComputedStyle(jurongEastName).fontSize).toBe("15px");
    expect(getComputedStyle(priceLabel).fontSize).toBe("12px");
    expect(getComputedStyle(ownerLabel).fontSize).toBe("12px");
    expect(getComputedStyle(fareRateLabel).fontSize).toBe("12px");
  });

  test("shows the updated 25-station board count", () => {
    setViewportSize(1000, 900);
    render(<GameScreen initial={initialState} />);

    expect(screen.getByText("25 stations")).toBeInTheDocument();
  });

  test("trims to 24 stations on wide 6x4 display ratios", () => {
    setViewportSize(1800, 900);
    render(<GameScreen initial={initialState} />);

    expect(screen.getByText("24 stations")).toBeInTheDocument();
  });

  test("does not render interchange badges on station tiles", () => {
    render(<GameScreen initial={initialState} />);

    expect(screen.queryByText("Interchange")).not.toBeInTheDocument();
  });

  test("highlights active player with service indicator class", () => {
    const { container } = render(<GameScreen initial={initialState} />);
    const activeCard = container.querySelector(".player-card.active-player");
    expect(activeCard).toHaveClass("service-running");
  });

  test("renders player token badges in the player panel", () => {
    render(<GameScreen initial={initialState} />);

    expect(
      screen.getByLabelText(`${initialState.players[0].name} player token`)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(`${initialState.players[1].name} player token`)
    ).toBeInTheDocument();
  });

  test("renders player token badges on occupied station tiles", () => {
    const { container } = render(<GameScreen initial={initialState} />);
    const boardPanel = container.querySelector(".game-board-panel");

    expect(boardPanel).toBeTruthy();
    expect(
      within(boardPanel as HTMLElement).getByLabelText(
        `${initialState.players[0].name} token on Jurong East`
      )
    ).toBeInTheDocument();
  });

  test("renders save and abort inside the status card instead of turn controls", () => {
    const { container } = render(<GameScreen initial={initialState} />);

    const statusCard = container.querySelector(".map-status");
    const controlPanel = container.querySelector(".control-panel");

    expect(statusCard).toBeTruthy();
    expect(controlPanel).toBeTruthy();
    expect(within(statusCard as HTMLElement).getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(within(statusCard as HTMLElement).getByRole("button", { name: "Abort" })).toBeInTheDocument();
    expect(within(controlPanel as HTMLElement).queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
    expect(within(controlPanel as HTMLElement).queryByRole("button", { name: "Abort" })).not.toBeInTheDocument();
  });

  test("shows the active player on an intermediate station before the destination", async () => {
    vi.useFakeTimers();
    const { container } = render(<GameScreen initial={initialState} diceValueProvider={() => 3} />);
    const activePlayerName = initialState.players[0].name;

    fireEvent.click(screen.getByRole("button", { name: "Roll Dice" }));

    const boardPanel = container.querySelector(".game-board-panel");

    expect(boardPanel).toBeTruthy();
    const queenstownTile = within(boardPanel as HTMLElement).getByText("Queenstown").closest("li");
    expect(queenstownTile).toBeTruthy();
    expect(
      within(boardPanel as HTMLElement).getAllByLabelText(new RegExp(`${activePlayerName} token on`))
    ).toHaveLength(1);
    expect(
      within(queenstownTile as HTMLElement).queryByLabelText(`${activePlayerName} token on Queenstown`)
    ).not.toBeInTheDocument();

    await advancePlaybackFrames(4);

    expect(
      within(queenstownTile as HTMLElement).getByLabelText(`${activePlayerName} token on Queenstown`)
    ).toBeInTheDocument();
  });

  test("waits for movement playback before showing tile resolution actions", async () => {
    vi.useFakeTimers();
    render(<GameScreen initial={initialState} diceValueProvider={() => 2} />);

    fireEvent.click(screen.getByRole("button", { name: "Roll Dice" }));

    expect(screen.queryByRole("button", { name: "Buy Station" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Skip Purchase" })).not.toBeInTheDocument();

    await advancePlaybackFrames(3);

    expect(screen.getByRole("button", { name: "Buy Station" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skip Purchase" })).toBeInTheDocument();
  });

  test("waits for movement playback before showing end turn on an owned-station arrival", async () => {
    vi.useFakeTimers();
    const ownedDestinationState = createGameState(
      [
        { ...initialState.players[0], id: "p1", position: 0, cash: 500 },
        { ...initialState.players[1], id: "p2", position: 0, cash: 700, ownedStationIds: ["queenstown"] }
      ],
      initialState.config
    );
    ownedDestinationState.board = ownedDestinationState.board.map((tile) =>
      tile.id === "queenstown" ? { ...tile, ownerId: "p2" } : tile
    );

    render(<GameScreen initial={ownedDestinationState} diceValueProvider={() => 3} />);

    fireEvent.click(screen.getByRole("button", { name: "Roll Dice" }));

    expect(screen.queryByRole("button", { name: "End Turn" })).not.toBeInTheDocument();

    await advancePlaybackFrames(4);

    expect(screen.getByRole("button", { name: "End Turn" })).toBeInTheDocument();
  });

  test("shows skip purchase before buy station visually while preserving DOM order", () => {
    const resolveTileState = {
      ...initialState,
      phase: "resolve_tile" as const
    };

    const { container } = render(<GameScreen initial={resolveTileState} />);
    const controlPanel = container.querySelector(".control-panel");
    expect(controlPanel).toBeTruthy();

    const buttons = within(controlPanel as HTMLElement).getAllByRole("button");

    expect(buttons.map((button) => button.textContent?.trim())).toEqual([
      "Buy Station",
      "Skip Purchase"
    ]);
    expect(getComputedStyle(buttons[0]).order).toBe("2");
    expect(getComputedStyle(buttons[1]).order).toBe("1");
  });

  test("shows an inline handoff card after ending a turn and hides normal turn actions", async () => {
    const user = userEvent.setup();
    const turnEndState = {
      ...initialState,
      phase: "turn_end" as const
    };

    render(<GameScreen initial={turnEndState} />);

    await user.click(screen.getByRole("button", { name: "End Turn" }));

    expect(screen.getByText(`${initialState.players[1].name}'s Turn`)).toBeInTheDocument();
    expect(
      screen.queryByText("Hide your strategy and hand the device to the next player.")
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Turn" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Roll Dice" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("reveals the next player's turn controls after start turn is clicked", async () => {
    const user = userEvent.setup();
    const turnEndState = {
      ...initialState,
      phase: "turn_end" as const
    };

    render(<GameScreen initial={turnEndState} />);

    await user.click(screen.getByRole("button", { name: "End Turn" }));
    await user.click(screen.getByRole("button", { name: "Start Turn" }));

    expect(screen.queryByText(/'s Turn$/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Roll Dice" })).toBeInTheDocument();
  });

  test("renders a draw banner for completed games without a winner", () => {
    const drawState = {
      ...initialState,
      phase: "completed" as const,
      winnerId: null
    };

    render(<GameScreen initial={drawState} />);

    expect(screen.getByText("Draw")).toBeInTheDocument();
    expect(screen.queryByText("Winner: Draw")).not.toBeInTheDocument();
  });

  test("treats a player named Draw as a winner when winnerId points at that player", () => {
    const winnerState = {
      ...initialState,
      phase: "completed" as const,
      winnerId: initialState.players[0].id,
      players: [
        { ...initialState.players[0], name: "Draw" },
        initialState.players[1]
      ]
    };

    render(<GameScreen initial={winnerState} />);

    expect(screen.getByText("Winner: Draw")).toBeInTheDocument();
  });
});
