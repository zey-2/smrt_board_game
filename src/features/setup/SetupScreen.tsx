import { useState } from "react";
import { END_CONDITION_OPTIONS } from "../../game/constants/endConditions";
import { getRandomDogBreedNames } from "../../game/defaultPlayerNames";
import type { EndConditionMode, GameConfig, Player } from "../../game/types";
import {
  PLAYER_COLOR_OPTIONS,
  PLAYER_ICON_OPTIONS,
  PlayerColorSwatch,
  PlayerIconGlyph,
  PlayerTokenBadge
} from "../players/playerAppearance";
import { validateAndBuildSetup, type SetupPlayerDraft } from "./setupValidation";

export interface SetupPayload {
  players: Player[];
  config: GameConfig;
}

interface SetupScreenProps {
  onStart: (payload: SetupPayload) => void;
}

const DEFAULT_END_CONDITION: EndConditionMode = "LAST_PLAYER_STANDING";

function createSetupPlayer(name: string, index: number): SetupPlayerDraft {
  return {
    name,
    iconId: PLAYER_ICON_OPTIONS[index % PLAYER_ICON_OPTIONS.length].id,
    colorId: PLAYER_COLOR_OPTIONS[index % PLAYER_COLOR_OPTIONS.length].id
  };
}

export function SetupScreen({ onStart }: SetupScreenProps) {
  const [players, setPlayers] = useState<SetupPlayerDraft[]>(() =>
    getRandomDogBreedNames(2).map((name, index) => createSetupPlayer(name, index))
  );
  const [endCondition, setEndCondition] = useState<EndConditionMode>(DEFAULT_END_CONDITION);
  const [error, setError] = useState<string | null>(null);

  const canAddPlayer = players.length < 4;
  const canRemovePlayer = players.length > 2;

  const handlePlayerCountChange = (nextCount: number) => {
    const nextPlayers = [...players];
    if (nextCount > players.length) {
      while (nextPlayers.length < nextCount) {
        const nextName = getRandomDogBreedNames(1, {
          excludeNames: nextPlayers.map((player) => player.name)
        })[0];
        nextPlayers.push(createSetupPlayer(nextName, nextPlayers.length));
      }
    } else if (nextCount < players.length) {
      nextPlayers.length = nextCount;
    }
    setPlayers(nextPlayers);
    setError(null);
  };

  const handleNameChange = (index: number, value: string) => {
    const nextPlayers = [...players];
    nextPlayers[index] = {
      ...nextPlayers[index],
      name: value
    };
    setPlayers(nextPlayers);
    setError(null);
  };

  const handleAppearanceChange = (
    index: number,
    key: "iconId" | "colorId",
    value: string
  ) => {
    const nextPlayers = [...players];
    nextPlayers[index] = {
      ...nextPlayers[index],
      [key]: value
    };
    setPlayers(nextPlayers);
    setError(null);
  };

  const handleStart = () => {
    const result = validateAndBuildSetup({
      players,
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
      <div className="inline-actions">
        <button
          type="button"
          onClick={() => handlePlayerCountChange(players.length + 1)}
          disabled={!canAddPlayer}
        >
          Add Player
        </button>
        <button
          type="button"
          onClick={() => handlePlayerCountChange(players.length - 1)}
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

      {players.map((player, index) => (
        <div className="player-row" key={`setup-player-${index}`}>
          <div className="player-name-column">
            <label>
              Player {index + 1} name
              <input
                value={player.name}
                onChange={(event) => handleNameChange(index, event.target.value)}
                maxLength={20}
              />
            </label>
            <div className="player-token-preview">
              <PlayerTokenBadge
                iconId={player.iconId}
                colorId={player.colorId}
                label={`Player ${index + 1} token preview`}
                className="player-token-badge setup-token-preview"
              />
              <span>Station marker preview</span>
            </div>
          </div>

          <fieldset className="player-picker-group">
            <legend>Icon</legend>
            <div className="token-picker">
              {PLAYER_ICON_OPTIONS.map((option) => (
                <label key={option.id} className="token-option">
                  <input
                    checked={player.iconId === option.id}
                    className="visually-hidden-input"
                    name={`player-${index + 1}-icon`}
                    onChange={() => handleAppearanceChange(index, "iconId", option.id)}
                    type="radio"
                    aria-label={`Player ${index + 1} icon ${option.label}`}
                  />
                  <span className="token-option-body">
                    <PlayerIconGlyph iconId={option.id} className="token-option-icon" />
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="player-picker-group">
            <legend>Background colour</legend>
            <div className="token-picker">
              {PLAYER_COLOR_OPTIONS.map((option) => (
                <label key={option.id} className="token-option">
                  <input
                    checked={player.colorId === option.id}
                    className="visually-hidden-input"
                    name={`player-${index + 1}-color`}
                    onChange={() => handleAppearanceChange(index, "colorId", option.id)}
                    type="radio"
                    aria-label={`Player ${index + 1} background colour ${option.label}`}
                  />
                  <span className="token-option-body">
                    <PlayerColorSwatch colorId={option.id} className="token-option-swatch" />
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      ))}

      {error ? <p className="error-text">{error}</p> : null}
      <button type="button" onClick={handleStart}>
        Start Game
      </button>
    </section>
  );
}
