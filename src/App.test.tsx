import { render, screen } from "@testing-library/react";
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
