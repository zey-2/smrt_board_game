import { useMemo, useState } from "react";
import { END_CONDITION_OPTIONS } from "../../game/constants/endConditions";
import type { EndConditionMode, GameConfig, Player } from "../../game/types";
import { getMajorityVote, validateAndBuildSetup } from "./setupValidation";

export interface SetupPayload {
  players: Player[];
  config: GameConfig;
}

interface SetupScreenProps {
  onStart: (payload: SetupPayload) => void;
}

const DEFAULT_NAMES = ["Player 1", "Player 2"];

export function SetupScreen({ onStart }: SetupScreenProps) {
  const [names, setNames] = useState<string[]>(DEFAULT_NAMES);
  const [votes, setVotes] = useState<Array<EndConditionMode | "">>(["", ""]);
  const [error, setError] = useState<string | null>(null);

  const majorityVote = useMemo(() => getMajorityVote(votes), [votes]);

  const canAddPlayer = names.length < 4;
  const canRemovePlayer = names.length > 2;

  const handlePlayerCountChange = (nextCount: number) => {
    const nextNames = [...names];
    const nextVotes = [...votes];
    if (nextCount > names.length) {
      while (nextNames.length < nextCount) {
        nextNames.push(`Player ${nextNames.length + 1}`);
        nextVotes.push("");
      }
    } else if (nextCount < names.length) {
      nextNames.length = nextCount;
      nextVotes.length = nextCount;
    }
    setNames(nextNames);
    setVotes(nextVotes);
  };

  const handleNameChange = (index: number, value: string) => {
    const next = [...names];
    next[index] = value;
    setNames(next);
  };

  const handleVoteChange = (index: number, value: EndConditionMode | "") => {
    const next = [...votes];
    next[index] = value;
    setVotes(next);
  };

  const handleStart = () => {
    const result = validateAndBuildSetup({
      names,
      votes,
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
          <label>
            Vote end condition for Player {index + 1}
            <select
              value={votes[index]}
              onChange={(event) => handleVoteChange(index, event.target.value as EndConditionMode | "")}
            >
              <option value="">Select one</option>
              {END_CONDITION_OPTIONS.map((option) => (
                <option key={option.mode} value={option.mode}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ))}

      <p>Majority: {majorityVote ? END_CONDITION_OPTIONS.find((item) => item.mode === majorityVote)?.label : "None"}</p>
      {error ? <p className="error-text">{error}</p> : null}
      <button type="button" onClick={handleStart} disabled={!majorityVote}>
        Start Game
      </button>
    </section>
  );
}
