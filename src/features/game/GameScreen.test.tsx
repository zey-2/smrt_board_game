import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { initialState } from "../../game/state/initialState";
import { GameScreen } from "./GameScreen";

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

  test("shows compact station labels while keeping board data visible", () => {
    render(<GameScreen initial={initialState} />);

    expect(screen.getAllByText("$280").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Rent 28").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Owner none/i).length).toBeGreaterThan(0);
  });

  test("highlights active player with service indicator class", () => {
    const { container } = render(<GameScreen initial={initialState} />);
    const activeCard = container.querySelector(".player-card.active-player");
    expect(activeCard).toHaveClass("service-running");
  });

  test("renders exit actions in a separate control row", () => {
    const { container } = render(<GameScreen initial={initialState} />);

    const exitActions = container.querySelector(".control-panel .exit-actions");

    expect(exitActions).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abort" })).toBeInTheDocument();
  });
});
