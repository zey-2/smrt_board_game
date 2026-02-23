import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { SetupScreen } from "./SetupScreen";

describe("SetupScreen", () => {
  test("requires majority-voted end condition before start", async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();
    render(<SetupScreen onStart={onStart} />);

    const startButton = screen.getByRole("button", { name: "Start Game" });
    expect(startButton).toBeDisabled();

    const voteSelects = screen.getAllByLabelText(/Vote end condition for/i);
    await user.selectOptions(voteSelects[0], "FIXED_ROUNDS");
    await user.selectOptions(voteSelects[1], "TARGET_WEALTH");
    expect(startButton).toBeDisabled();

    await user.selectOptions(voteSelects[1], "FIXED_ROUNDS");
    expect(startButton).toBeEnabled();

    await user.click(startButton);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart.mock.calls[0][0].config.endCondition).toBe("FIXED_ROUNDS");
  });
});
