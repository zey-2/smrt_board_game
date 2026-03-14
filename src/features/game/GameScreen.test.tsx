import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { initialState } from "../../game/state/initialState";
import { GameScreen } from "./GameScreen";
import "../../styles.css";

afterEach(() => {
  vi.useRealTimers();
});

async function advancePlaybackFrames(frameCount: number, frameDuration = 300) {
  for (let index = 0; index < frameCount; index += 1) {
    await act(async () => {
      vi.advanceTimersByTime(frameDuration);
    });
  }
}

describe("GameScreen", () => {
  test("allows current player to roll and updates phase", async () => {
    const user = userEvent.setup();
    render(<GameScreen initial={initialState} diceValueProvider={() => 4} />);

    expect(screen.getByText("Phase: roll")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Roll Dice" }));
    expect(screen.getByText("Phase: resolve_tile")).toBeInTheDocument();
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
    render(<GameScreen initial={initialState} />);

    expect(screen.getAllByText("$280").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Rent 28").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Owner none/i).length).toBeGreaterThan(0);
  });

  test("shows the updated 25-station board count", () => {
    render(<GameScreen initial={initialState} />);

    expect(screen.getByText("25 stations")).toBeInTheDocument();
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

  test("renders exit actions in a separate control row", () => {
    const { container } = render(<GameScreen initial={initialState} />);

    const exitActions = container.querySelector(".control-panel .exit-actions");

    expect(exitActions).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abort" })).toBeInTheDocument();
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
});
