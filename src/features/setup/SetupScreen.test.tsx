import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { SetupScreen } from "./SetupScreen";
import { validateAndBuildSetup } from "./setupValidation";

describe("SetupScreen", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("defaults to timed mode with a 20-minute limit", async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();
    render(<SetupScreen onStart={onStart} />);

    expect(screen.getByLabelText("Mode")).toHaveValue("TIMED");
    expect(screen.getByLabelText("Time limit")).toHaveValue("MINUTES_20");
    expect(screen.queryByLabelText("Round limit")).not.toBeInTheDocument();

    const startButton = screen.getByRole("button", { name: "Start Game" });
    expect(startButton).toBeEnabled();

    await user.click(startButton);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart.mock.calls[0][0].config).toMatchObject({
      mode: "TIMED",
      endCondition: "LAST_PLAYER_STANDING",
      timeLimitSeconds: 1200,
      fixedRoundLimit: 12
    });
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

  test("switches to fixed-round controls and starts a fixed-round game", async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();
    render(<SetupScreen onStart={onStart} />);

    const startButton = screen.getByRole("button", { name: "Start Game" });
    expect(startButton).toBeEnabled();

    await user.selectOptions(screen.getByLabelText("Mode"), "FIXED_ROUNDS");
    expect(screen.getByLabelText("Round limit")).toHaveValue("ROUNDS_12");
    expect(screen.queryByLabelText("Time limit")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Round limit"), "ROUNDS_9");

    await user.click(startButton);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart.mock.calls[0][0].config).toMatchObject({
      mode: "FIXED_ROUNDS",
      endCondition: "FIXED_ROUNDS",
      timeLimitSeconds: null,
      fixedRoundLimit: 9
    });
  });

  test("hides secondary limit selectors in classic mode", async () => {
    const user = userEvent.setup();
    render(<SetupScreen onStart={() => undefined} />);

    await user.selectOptions(screen.getByLabelText("Mode"), "CLASSIC");

    expect(screen.queryByLabelText("Time limit")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Round limit")).not.toBeInTheDocument();
  });

  test("does not show the old timed-preset calibration message", async () => {
    const user = userEvent.setup();
    render(<SetupScreen onStart={() => undefined} />);

    await user.click(screen.getByRole("button", { name: "Add Player" }));

    expect(
      screen.queryByText("Timed presets are calibrated for 2-player games. Larger games may run longer.")
    ).not.toBeInTheDocument();
  });

  test("does not show the board preset text on the setup screen", () => {
    render(<SetupScreen onStart={() => undefined} />);

    expect(screen.queryByText("Board preset: SMRT key stations")).not.toBeInTheDocument();
  });

  test("renders icon and background colour controls for each player", () => {
    render(<SetupScreen onStart={() => undefined} />);

    expect(screen.getByLabelText("Player 1 icon Circle")).toBeChecked();
    expect(screen.getByLabelText("Player 1 background colour Navy")).toBeChecked();
    expect(screen.getByLabelText("Player 2 icon Square")).toBeChecked();
    expect(screen.getByLabelText("Player 2 background colour Purple")).toBeChecked();
  });

  test("shows icon choices without visible labels and colour choices as swatches only", () => {
    render(<SetupScreen onStart={() => undefined} />);

    const iconOption = screen.getByLabelText("Player 1 icon Circle").closest("label");
    const colorOption = screen.getByLabelText("Player 1 background colour Navy").closest("label");

    expect(iconOption).not.toBeNull();
    expect(iconOption).not.toHaveTextContent("Circle");
    expect(iconOption?.querySelector("svg")).not.toBeNull();
    expect(iconOption?.querySelector('[role="img"]')).toBeNull();

    expect(colorOption).not.toBeNull();
    expect(colorOption).not.toHaveTextContent("Navy");
    expect(colorOption?.querySelector("svg")).toBeNull();
  });

  test("uses the selected icon and background colour when starting the game", async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();
    render(<SetupScreen onStart={onStart} />);

    await user.click(screen.getByLabelText("Player 1 icon Triangle"));
    await user.click(screen.getByLabelText("Player 1 background colour Cyan"));
    await user.click(screen.getByRole("button", { name: "Start Game" }));

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart.mock.calls[0][0].players[0]).toMatchObject({
      iconId: "triangle",
      colorId: "cyan"
    });
  });

  test("shows a visible error when two players choose the same icon and background colour", async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();
    render(<SetupScreen onStart={onStart} />);

    await user.click(screen.getByLabelText("Player 2 icon Circle"));
    await user.click(screen.getByLabelText("Player 2 background colour Navy"));
    await user.click(screen.getByRole("button", { name: "Start Game" }));

    expect(onStart).not.toHaveBeenCalled();
    expect(
      screen.getByText("Each player needs a unique icon and background colour combination")
    ).toBeInTheDocument();
  });

  test("builds players with selected token appearance", () => {
    const result = validateAndBuildSetup({
      players: [
        { name: "Beagle", iconId: "circle", colorId: "navy" },
        { name: "Corgi", iconId: "square", colorId: "purple" }
      ],
      mode: "CLASSIC",
      endCondition: "LAST_PLAYER_STANDING",
      initialCash: 1500,
      timeLimitSeconds: null,
      fixedRoundLimit: 12,
      targetWealth: 8000
    });

    expect(result.error).toBeNull();
    expect(result.players[0]).toMatchObject({
      iconId: "circle",
      colorId: "navy"
    });
  });

  test("rejects duplicate token combinations", () => {
    const result = validateAndBuildSetup({
      players: [
        { name: "Beagle", iconId: "circle", colorId: "navy" },
        { name: "Corgi", iconId: "circle", colorId: "navy" }
      ],
      mode: "CLASSIC",
      endCondition: "LAST_PLAYER_STANDING",
      initialCash: 1500,
      timeLimitSeconds: null,
      fixedRoundLimit: 12,
      targetWealth: 8000
    });

    expect(result.error).toBe("Each player needs a unique icon and background colour combination");
  });
});
