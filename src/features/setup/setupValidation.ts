import type { EndConditionMode, GameConfig, Player } from "../../game/types";

export interface SetupDraft {
  names: string[];
  votes: Array<EndConditionMode | "">;
  initialCash: number;
  fixedRoundLimit: number;
  targetWealth: number;
}

export interface SetupResult {
  players: Player[];
  config: GameConfig;
  error: string | null;
}

export function getMajorityVote(votes: Array<EndConditionMode | "">): EndConditionMode | null {
  if (votes.some((vote) => !vote)) return null;

  const counts = votes.reduce<Record<EndConditionMode, number>>(
    (acc, vote) => {
      if (!vote) return acc;
      acc[vote] += 1;
      return acc;
    },
    {
      LAST_PLAYER_STANDING: 0,
      FIXED_ROUNDS: 0,
      TARGET_WEALTH: 0
    }
  );

  const sorted = (Object.entries(counts) as Array<[EndConditionMode, number]>).sort(
    (a, b) => b[1] - a[1]
  );
  const [winner, winnerVotes] = sorted[0];
  const secondVotes = sorted[1][1];
  const hasMajority = winnerVotes > Math.floor(votes.length / 2);
  return hasMajority && winnerVotes > secondVotes ? winner : null;
}

export function validateAndBuildSetup(draft: SetupDraft): SetupResult {
  if (draft.names.length < 2 || draft.names.length > 4) {
    return { players: [], config: createDefaultConfig("FIXED_ROUNDS"), error: "Player count must be 2-4" };
  }

  if (draft.names.some((name) => name.trim().length === 0)) {
    return { players: [], config: createDefaultConfig("FIXED_ROUNDS"), error: "All players need a name" };
  }

  const selectedEndCondition = getMajorityVote(draft.votes);
  if (!selectedEndCondition) {
    return {
      players: [],
      config: createDefaultConfig("FIXED_ROUNDS"),
      error: "End condition requires a majority vote"
    };
  }

  const config: GameConfig = {
    endCondition: selectedEndCondition,
    fixedRoundLimit: draft.fixedRoundLimit,
    targetWealth: draft.targetWealth,
    initialCash: draft.initialCash
  };

  const players: Player[] = draft.names.map((name, index) => ({
    id: `p${index + 1}`,
    name: name.trim(),
    cash: draft.initialCash,
    position: 0,
    ownedStationIds: [],
    status: "active"
  }));

  return { players, config, error: null };
}

function createDefaultConfig(mode: EndConditionMode): GameConfig {
  return {
    endCondition: mode,
    fixedRoundLimit: 12,
    targetWealth: 8000,
    initialCash: 1500
  };
}
