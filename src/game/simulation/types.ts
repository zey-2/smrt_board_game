export interface SimulationStationTile {
  type: "station";
  id: string;
  name: string;
  price: number;
  baseRent: number;
  ownerId: string | null;
}

export interface SimulationCashTile {
  type: "cash";
  id: string;
  name: string;
  reward: number;
}

export type SimulationTile = SimulationStationTile | SimulationCashTile;

export interface SimulationPreset {
  id: string;
  label: string;
  board: SimulationTile[];
}

export interface SimulationPlayer {
  id: string;
  cash: number;
  position: number;
  status: "active" | "bankrupt";
  ownedStationIds: string[];
}

export interface SimulationMetricDelta {
  stationPurchases: number;
  rentPayments: number;
  bankruptcies: number;
  cashTileAwards: number;
}
