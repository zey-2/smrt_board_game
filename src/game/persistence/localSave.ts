import type { GameState } from "../types";

const STORAGE_KEY = "smrt-monopoly-state";

export function saveGameState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearSavedGameState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function loadGameState(): GameState | null {
  const serialized = localStorage.getItem(STORAGE_KEY);
  if (!serialized) return null;

  try {
    const parsed = JSON.parse(serialized) as Partial<GameState>;
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.players) || !Array.isArray(parsed.board)) return null;
    if (typeof parsed.turnIndex !== "number" || typeof parsed.round !== "number") return null;
    if (
      typeof parsed.remainingTimeMs !== "undefined" &&
      parsed.remainingTimeMs !== null &&
      typeof parsed.remainingTimeMs !== "number"
    ) {
      return null;
    }
    return parsed as GameState;
  } catch {
    return null;
  }
}
