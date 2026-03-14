import { useState } from "react";
import {
  DEFAULT_GAME_LENGTH_PRESET_ID,
  GAME_LENGTH_PRESETS,
  buildGameConfigFromGameLengthPreset,
  type GameLengthPresetId
} from "../../game/constants/gameLengthPresets";
import { getRandomDogBreedNames } from "../../game/defaultPlayerNames";
import type { GameConfig, Player } from "../../game/types";
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
  const [selectedGameLength, setSelectedGameLength] = useState<GameLengthPresetId>(
    DEFAULT_GAME_LENGTH_PRESET_ID
  );
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
    const config = buildGameConfigFromGameLengthPreset(selectedGameLength);
    const result = validateAndBuildSetup({
      players,
      mode: config.mode,
      endCondition: config.endCondition,
      initialCash: config.initialCash,
      timeLimitSeconds: config.timeLimitSeconds,
      fixedRoundLimit: config.fixedRoundLimit,
      targetWealth: config.targetWealth
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
        Game length
        <select
          value={selectedGameLength}
          onChange={(event) => setSelectedGameLength(event.target.value as GameLengthPresetId)}
        >
          {GAME_LENGTH_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>
      {players.length > 2 ? (
        <p className="info-text">
          Timed presets are calibrated for 2-player games. Larger games may run longer.
        </p>
      ) : null}

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
