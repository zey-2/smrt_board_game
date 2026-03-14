import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

test("renders title", () => {
  render(<App />);
  expect(screen.getByText("SMRT Monopoly")).toBeInTheDocument();
});

test("renders map-themed shell with SMRT logo", () => {
  const { container } = render(<App />);
  expect(container.querySelector(".map-theme-shell")).toBeTruthy();
  expect(screen.getByAltText("SMRT")).toBeInTheDocument();
});

test("hides the setup banner after starting a game", async () => {
  const user = userEvent.setup();
  const { container } = render(<App />);

  await user.selectOptions(
    screen.getByLabelText("Vote end condition for Player 1"),
    "LAST_PLAYER_STANDING"
  );
  await user.selectOptions(
    screen.getByLabelText("Vote end condition for Player 2"),
    "LAST_PLAYER_STANDING"
  );
  await user.click(screen.getByRole("button", { name: "Start Game" }));

  expect(container.querySelector(".title-banner")).toBeNull();
  expect(container.querySelector(".game-page-shell")).toBeTruthy();
});
