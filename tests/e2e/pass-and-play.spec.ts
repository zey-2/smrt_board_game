import { expect, test } from "@playwright/test";

test("setup to winner flow works for 2 players", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("SMRT Monopoly")).toBeVisible();

  const startButton = page.getByRole("button", { name: "Start Game" });
  await expect(startButton).toBeEnabled();
  await page.getByLabel("End condition").selectOption("FIXED_ROUNDS");
  await startButton.click();

  await expect(page.getByText("Game Setup")).toHaveCount(0);
  await expect(page.getByText("Phase: roll")).toBeVisible();

  await page.getByRole("button", { name: "Roll Dice" }).click();
  await expect(page.getByText("Phase: resolve_tile")).toBeVisible();

  await page.getByRole("button", { name: "Skip Purchase" }).click();
  await expect(page.getByRole("button", { name: "End Turn" })).toBeVisible();

  await page.getByRole("button", { name: "End Turn" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("Samoyed's Turn")).toBeVisible();
});
