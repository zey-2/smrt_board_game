import type { EndConditionMode } from "../types";

export interface EndConditionOption {
  mode: EndConditionMode;
  label: string;
  description: string;
}

export const END_CONDITION_OPTIONS: EndConditionOption[] = [
  {
    mode: "LAST_PLAYER_STANDING",
    label: "Last player not bankrupt",
    description: "Classic elimination mode."
  },
  {
    mode: "FIXED_ROUNDS",
    label: "Fixed rounds",
    description: "Highest net worth after final round wins."
  },
  {
    mode: "TARGET_WEALTH",
    label: "Target wealth",
    description: "First player to reach target net worth wins."
  }
];
