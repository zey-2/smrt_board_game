import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { initialState } from "../../game/state/initialState";
import { GameScreen } from "./GameScreen";
import { PassDeviceOverlay } from "./PassDeviceOverlay";

describe("PassDeviceOverlay", () => {
  test("renders handoff message", () => {
    render(<PassDeviceOverlay nextPlayerName="Player 2" onContinue={() => undefined} />);
    expect(screen.getByText("Pass device to Player 2")).toBeInTheDocument();
  });

  test("shows handoff overlay before next player turn", async () => {
    const user = userEvent.setup();
    const turnEndState = {
      ...initialState,
      phase: "turn_end" as const
    };

    render(<GameScreen initial={turnEndState} />);
    await user.click(screen.getByRole("button", { name: "End Turn" }));
    expect(screen.getByText(/Pass device to/i)).toBeInTheDocument();
  });
});
