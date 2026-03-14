import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
});

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

  await user.selectOptions(screen.getByLabelText("End condition"), "LAST_PLAYER_STANDING");
  await user.click(screen.getByRole("button", { name: "Start Game" }));

  expect(container.querySelector(".title-banner")).toBeNull();
  expect(container.querySelector(".game-page-shell")).toBeTruthy();
});

test("exits to setup and keeps a saved game available", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.selectOptions(screen.getByLabelText("End condition"), "LAST_PLAYER_STANDING");
  await user.click(screen.getByRole("button", { name: "Start Game" }));
  await user.click(screen.getByRole("button", { name: "Save" }));

  expect(screen.getByText("Game Setup")).toBeInTheDocument();
  expect(screen.getByText("Saved Game Found")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Resume Saved Game" })).toBeInTheDocument();
});

test("exits to setup and clears the saved game when requested", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.selectOptions(screen.getByLabelText("End condition"), "LAST_PLAYER_STANDING");
  await user.click(screen.getByRole("button", { name: "Start Game" }));
  await user.click(screen.getByRole("button", { name: "Abort" }));

  expect(screen.getByText("Game Setup")).toBeInTheDocument();
  expect(screen.queryByText("Saved Game Found")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Resume Saved Game" })).not.toBeInTheDocument();
});
