import { useEffect, useState } from "react";
import { clearSavedGameState, loadGameState, saveGameState } from "./game/persistence/localSave";
import { createGameState } from "./game/state/initialState";
import type { GameState } from "./game/types";
import { GameScreen } from "./features/game/GameScreen";
import { SetupScreen, type SetupPayload } from "./features/setup/SetupScreen";
import smrtCorporateLogo from "./assets/smrt/smrt-corporate-logo.jpg";

type AppMode = "setup" | "game";

export default function App() {
  const savedState = loadGameState();
  const [mode, setMode] = useState<AppMode>("setup");
  const [currentGameState, setCurrentGameState] = useState<GameState>(
    savedState ?? createGameState()
  );
  const [showMobileAdvice, setShowMobileAdvice] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setShowMobileAdvice(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const shellClassName =
    mode === "game"
      ? "app-shell map-theme-shell game-page-shell"
      : "app-shell map-theme-shell";

  const handleStart = (payload: SetupPayload) => {
    setCurrentGameState(createGameState(payload.players, payload.config));
    setMode("game");
  };

  const handleResume = () => {
    if (!savedState) return;
    setCurrentGameState(savedState);
    setMode("game");
  };

  const handleExitWithSave = (state: GameState) => {
    saveGameState(state);
    setCurrentGameState(state);
    setMode("setup");
  };

  const handleExitWithoutSave = () => {
    clearSavedGameState();
    setCurrentGameState(createGameState());
    setMode("setup");
  };

  return (
    <main className={shellClassName}>
      {showMobileAdvice ? (
        <section className="card mobile-advice-banner" role="status">
          Mobile display detected. For the best gameplay layout, please use a desktop or tablet.
        </section>
      ) : null}
      {mode === "setup" ? (

        <>
          <header className="title-banner card">
            <img src={smrtCorporateLogo} alt="SMRT" className="smrt-logo" />
            <div>
              <h1>SMRT Monopoly</h1>
              <p>Transit-map inspired board game</p>
            </div>
          </header>
          <SetupScreen onStart={handleStart} />
          {savedState ? (
            <section className="card setup-card">
              <h2>Saved Game Found</h2>
              <div className="inline-actions">
                <button type="button" onClick={handleResume}>
                  Resume Saved Game
                </button>
                <button type="button" onClick={() => setMode("setup")}>
                  New Game Setup
                </button>
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <GameScreen
          initial={currentGameState}
          onExitWithSave={handleExitWithSave}
          onExitWithoutSave={handleExitWithoutSave}
        />
      )}
    </main>
  );
}
