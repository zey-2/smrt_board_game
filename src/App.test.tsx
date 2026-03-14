import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, test, vi } from "vitest";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
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

  await user.selectOptions(screen.getByLabelText("Mode"), "CLASSIC");
  await user.click(screen.getByRole("button", { name: "Start Game" }));

  expect(container.querySelector(".title-banner")).toBeNull();
  expect(container.querySelector(".game-page-shell")).toBeTruthy();
});

test("exits to setup and keeps a saved game available", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.selectOptions(screen.getByLabelText("Mode"), "CLASSIC");
  await user.click(screen.getByRole("button", { name: "Start Game" }));
  await user.click(screen.getByRole("button", { name: "Save" }));

  expect(screen.getByText("Game Setup")).toBeInTheDocument();
  expect(screen.getByText("Saved Game Found")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Resume Saved Game" })).toBeInTheDocument();
});

test("renders the saved game section below game setup", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.selectOptions(screen.getByLabelText("Mode"), "CLASSIC");
  await user.click(screen.getByRole("button", { name: "Start Game" }));
  await user.click(screen.getByRole("button", { name: "Save" }));

  const setupHeading = screen.getByRole("heading", { level: 2, name: "Game Setup" });
  const savedGameHeading = screen.getByRole("heading", { level: 2, name: "Saved Game Found" });

  expect(setupHeading.compareDocumentPosition(savedGameHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

test("exits to setup and clears the saved game when requested", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.selectOptions(screen.getByLabelText("Mode"), "CLASSIC");
  await user.click(screen.getByRole("button", { name: "Start Game" }));
  await user.click(screen.getByRole("button", { name: "Abort" }));

  expect(screen.getByText("Game Setup")).toBeInTheDocument();
  expect(screen.queryByText("Saved Game Found")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Resume Saved Game" })).not.toBeInTheDocument();
});

test("pauses timed countdown outside the live game screen", async () => {
  vi.useFakeTimers();
  render(<App />);

  fireEvent.change(screen.getByLabelText("Mode"), {
    target: { value: "TIMED" }
  });
  fireEvent.change(screen.getByLabelText("Time limit"), {
    target: { value: "MINUTES_10" }
  });
  fireEvent.click(screen.getByRole("button", { name: "Start Game" }));

  await act(async () => {
    vi.advanceTimersByTime(3000);
  });

  expect(screen.getByText("Time left: 09:57")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Save" }));

  await act(async () => {
    vi.advanceTimersByTime(5000);
  });

  fireEvent.click(screen.getByRole("button", { name: "Resume Saved Game" }));

  expect(screen.getByText("Time left: 09:57")).toBeInTheDocument();
});


test("shows a desktop/tablet advisory banner on narrow mobile widths", async () => {
  const originalWidth = window.innerWidth;
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: 500,
    writable: true
  });

  render(<App />);

  expect(
    screen.getByText(/please use a desktop or tablet/i)
  ).toBeInTheDocument();

  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: originalWidth,
    writable: true
  });
});
