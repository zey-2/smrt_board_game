import { useState } from "react";
import { END_CONDITION_OPTIONS } from "../../game/constants/endConditions";
import { getRandomDogBreedNames } from "../../game/defaultPlayerNames";
import type { EndConditionMode, GameConfig, Player } from "../../game/types";
import { validateAndBuildSetup } from "./setupValidation";

export interface SetupPayload {
  players: Player[];
  config: GameConfig;
}

interface SetupScreenProps {
  onStart: (payload: SetupPayload) => void;
}

const DEFAULT_END_CONDITION: EndConditionMode = "LAST_PLAYER_STANDING";

export function SetupScreen({ onStart }: SetupScreenProps) {
  const [names, setNames] = useState<string[]>(() => getRandomDogBreedNames(2));
  const [endCondition, setEndCondition] = useState<EndConditionMode>(DEFAULT_END_CONDITION);
  const [error, setError] = useState<string | null>(null);

  const canAddPlayer = names.length < 4;
  const canRemovePlayer = names.length > 2;

  const handlePlayerCountChange = (nextCount: number) => {
    const nextNames = [...names];
    if (nextCount > names.length) {
      while (nextNames.length < nextCount) {
        nextNames.push(...getRandomDogBreedNames(1, { excludeNames: nextNames }));
      }
    } else if (nextCount < names.length) {
      nextNames.length = nextCount;
    }
    setNames(nextNames);
  };

  const handleNameChange = (index: number, value: string) => {
    const next = [...names];
    next[index] = value;
    setNames(next);
  };

  const handleStart = () => {
    const result = validateAndBuildSetup({
      names,
      endCondition,
      initialCash: 1500,
      fixedRoundLimit: 12,
      targetWealth: 8000
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    setError(null);
    onStart({ players: result.players, config: result.config });
  };

  return (
    <section className="card setup-card">
      <h2>Game Setup</h2>
      <p>Board preset: SMRT key stations</p>
      <div className="inline-actions">
        <button type="button" onClick={() => handlePlayerCountChange(names.length + 1)} disabled={!canAddPlayer}>
          Add Player
        </button>
        <button
          type="button"
          onClick={() => handlePlayerCountChange(names.length - 1)}
          disabled={!canRemovePlayer}
        >
          Remove Player
        </button>
      </div>

      <label>
        End condition
        <select
          value={endCondition}
          onChange={(event) => setEndCondition(event.target.value as EndConditionMode)}
        >
          {END_CONDITION_OPTIONS.map((option) => (
            <option key={option.mode} value={option.mode}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {names.map((name, index) => (
        <div className="player-row" key={`setup-player-${index}`}>
          <label>
            Player {index + 1} name
            <input
              value={name}
              onChange={(event) => handleNameChange(index, event.target.value)}
              maxLength={20}
            />
          </label>
        </div>
      ))}

      {error ? <p className="error-text">{error}</p> : null}
      <button type="button" onClick={handleStart}>
        Start Game
      </button>
    </section>
  );
}
