import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { SetupScreen } from "./SetupScreen";
import { validateAndBuildSetup } from "./setupValidation";

describe("SetupScreen", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("shows one shared end condition selector with last player standing as the default", async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();
    render(<SetupScreen onStart={onStart} />);

    const endConditionSelect = screen.getByLabelText("End condition");
    expect(endConditionSelect).toHaveValue("LAST_PLAYER_STANDING");
    expect(screen.getAllByLabelText("End condition")).toHaveLength(1);

    const startButton = screen.getByRole("button", { name: "Start Game" });
    expect(startButton).toBeEnabled();

    await user.click(startButton);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart.mock.calls[0][0].config.endCondition).toBe("LAST_PLAYER_STANDING");
  });

  test("prefills player names with dog breeds", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    render(<SetupScreen onStart={() => undefined} />);

    expect(screen.getByLabelText("Player 1 name")).toHaveValue("Beagle");
    expect(screen.getByLabelText("Player 2 name")).toHaveValue("Corgi");
  });

  test("adds another dog breed when increasing the player count", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const user = userEvent.setup();

    render(<SetupScreen onStart={() => undefined} />);

    await user.click(screen.getByRole("button", { name: "Add Player" }));

    expect(screen.getByLabelText("Player 3 name")).toHaveValue("Dachshund");
  });

  test("uses the shared end condition selector value when starting the game", async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();
    render(<SetupScreen onStart={onStart} />);

    const startButton = screen.getByRole("button", { name: "Start Game" });
    expect(startButton).toBeEnabled();

    await user.selectOptions(screen.getByLabelText("End condition"), "FIXED_ROUNDS");

    await user.click(startButton);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart.mock.calls[0][0].config.endCondition).toBe("FIXED_ROUNDS");
  });

  test("renders icon and background colour controls for each player", () => {
    render(<SetupScreen onStart={() => undefined} />);

    expect(screen.getByLabelText("Player 1 icon Circle")).toBeChecked();
    expect(screen.getByLabelText("Player 1 background colour Blue")).toBeChecked();
    expect(screen.getByLabelText("Player 2 icon Square")).toBeChecked();
    expect(screen.getByLabelText("Player 2 background colour Red")).toBeChecked();
  });

  test("uses the selected icon and background colour when starting the game", async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();
    render(<SetupScreen onStart={onStart} />);

    await user.click(screen.getByLabelText("Player 1 icon Triangle"));
    await user.click(screen.getByLabelText("Player 1 background colour Gold"));
    await user.click(screen.getByRole("button", { name: "Start Game" }));

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart.mock.calls[0][0].players[0]).toMatchObject({
      iconId: "triangle",
      colorId: "gold"
    });
  });

  test("shows a visible error when two players choose the same icon and background colour", async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();
    render(<SetupScreen onStart={onStart} />);

    await user.click(screen.getByLabelText("Player 2 icon Circle"));
    await user.click(screen.getByLabelText("Player 2 background colour Blue"));
    await user.click(screen.getByRole("button", { name: "Start Game" }));

    expect(onStart).not.toHaveBeenCalled();
    expect(
      screen.getByText("Each player needs a unique icon and background colour combination")
    ).toBeInTheDocument();
  });

  test("builds players with selected token appearance", () => {
    const result = validateAndBuildSetup({
      players: [
        { name: "Beagle", iconId: "circle", colorId: "blue" },
        { name: "Corgi", iconId: "square", colorId: "red" }
      ],
      endCondition: "LAST_PLAYER_STANDING",
      initialCash: 1500,
      fixedRoundLimit: 12,
      targetWealth: 8000
    });

    expect(result.error).toBeNull();
    expect(result.players[0]).toMatchObject({
      iconId: "circle",
      colorId: "blue"
    });
  });

  test("rejects duplicate token combinations", () => {
    const result = validateAndBuildSetup({
      players: [
        { name: "Beagle", iconId: "circle", colorId: "blue" },
        { name: "Corgi", iconId: "circle", colorId: "blue" }
      ],
      endCondition: "LAST_PLAYER_STANDING",
      initialCash: 1500,
      fixedRoundLimit: 12,
      targetWealth: 8000
    });

    expect(result.error).toBe("Each player needs a unique icon and background colour combination");
  });
});
