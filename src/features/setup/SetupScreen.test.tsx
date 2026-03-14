import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { SetupScreen } from "./SetupScreen";

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
});
