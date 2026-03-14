interface EconomyPlayer {
  id: string;
  cash: number;
  status?: "active" | "bankrupt";
  ownedStationIds?: string[];
}

interface EconomyTile {
  id: string;
  ownerId: string | null;
  price: number;
}

export function buyStation(player: EconomyPlayer, tile: EconomyTile) {
  if (tile.ownerId !== null) {
    return { ok: false as const, reason: "Tile already owned" };
  }

  if (player.cash < tile.price) {
    return { ok: false as const, reason: "Insufficient cash" };
  }

  return {
    ok: true as const,
    player: {
      ...player,
      cash: player.cash - tile.price,
      ownedStationIds: [...(player.ownedStationIds ?? []), tile.id]
    },
    tile: {
      ...tile,
      ownerId: player.id
    }
  };
}

export function payRent(
  payer: EconomyPlayer,
  owner: EconomyPlayer,
  rent: number
) {
  const payment = Math.min(payer.cash, rent);
  const payerCash = payer.cash - payment;

  return {
    payer: {
      ...payer,
      cash: payerCash,
      status: payerCash === 0 && payment < rent ? "bankrupt" : "active"
    },
    owner: {
      ...owner,
      cash: owner.cash + payment,
      status: owner.status ?? "active"
    }
  };
}

export function calculateTransportFare(steps: number, rate: number): number {
  return steps * rate;
}

export function payTransportFare(
  payer: EconomyPlayer,
  owner: EconomyPlayer,
  fare: number
) {
  return payRent(payer, owner, fare);
}

export function calculateNetWorth(cash: number, assetValues: number[]): number {
  return cash + assetValues.reduce((sum, value) => sum + value, 0);
}
