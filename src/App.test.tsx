import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, test, vi } from "vitest";
import App from "./App";

function setViewport(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: height
  });
}

function resizeViewport(width: number, height: number) {
  act(() => {
    setViewport(width, height);
    window.dispatchEvent(new Event("resize"));
  });
}

beforeEach(() => {
  localStorage.clear();
  setViewport(1280, 800);
});

afterEach(() => {
  vi.useRealTimers();
});

test("renders title", () => {
  render(<App />);
  expect(screen.getByText("SMRT Monopoly")).toBeInTheDocument();
});

test("shows desktop or tablet guidance on phone-sized screens regardless of orientation", async () => {
  const user = userEvent.setup();
  setViewport(844, 390);
  render(<App />);

  await user.click(screen.getByRole("button", { name: "Start Game" }));

  expect(screen.getByText("SMRT Monopoly works best on desktop or tablet.")).toBeInTheDocument();
  expect(
    screen.getByText("Use a larger screen or enlarge your browser window to view the full 25-station board cleanly.")
  ).toBeInTheDocument();
  expect(screen.queryByText("MRT STATIONS")).not.toBeInTheDocument();
});

test("shows rotate guidance on portrait screens before the playable board", async () => {
  const user = userEvent.setup();
  setViewport(768, 1024);
  render(<App />);

  await user.click(screen.getByRole("button", { name: "Start Game" }));

  expect(screen.getByText("Rotate to landscape before continuing.")).toBeInTheDocument();
  expect(screen.queryByText("MRT STATIONS")).not.toBeInTheDocument();
});

test("renders the playable board on supported landscape screens", async () => {
  const user = userEvent.setup();
  setViewport(1280, 800);
  render(<App />);

  await user.click(screen.getByRole("button", { name: "Start Game" }));

  expect(screen.getByText("MRT STATIONS")).toBeInTheDocument();
  expect(screen.getByText("25 stations")).toBeInTheDocument();
});

test("shows the larger-screen notice on unsupported small landscape and restores the full 25-station board after resize", async () => {
  const user = userEvent.setup();
  setViewport(860, 560);
  render(<App />);

  await user.click(screen.getByRole("button", { name: "Start Game" }));

  expect(
    screen.getByText("Use a larger screen or enlarge your browser window to view the full 25-station board cleanly.")
  ).toBeInTheDocument();
  expect(screen.queryByText("MRT STATIONS")).not.toBeInTheDocument();

  resizeViewport(1280, 800);

  expect(screen.getByText("MRT STATIONS")).toBeInTheDocument();
  expect(screen.getByText("25 stations")).toBeInTheDocument();
  expect(screen.queryByText("24 stations")).not.toBeInTheDocument();
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
