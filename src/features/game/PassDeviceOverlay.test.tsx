import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { initialState } from "../../game/state/initialState";
import { GameScreen } from "./GameScreen";

describe("player handoff flow", () => {
  test("shows start turn instead of the old continue overlay action", async () => {
    const user = userEvent.setup();
    const turnEndState = {
      ...initialState,
      phase: "turn_end" as const
    };

    render(<GameScreen initial={turnEndState} />);
    await user.click(screen.getByRole("button", { name: "End Turn" }));

    expect(screen.getByText(/Pass device to/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Turn" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continue" })).not.toBeInTheDocument();
  });
});
