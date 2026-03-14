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

type PurchasedPlayer<TPlayer extends EconomyPlayer> = Omit<
  TPlayer,
  "cash" | "ownedStationIds"
> & {
  cash: number;
  ownedStationIds: string[];
};

type OwnedTile<TTile extends EconomyTile> = Omit<TTile, "ownerId"> & {
  ownerId: string;
};

type SettledPlayer<TPlayer extends EconomyPlayer> = Omit<
  TPlayer,
  "cash" | "status"
> & {
  cash: number;
  status: "active" | "bankrupt";
};

export function buyStation<TPlayer extends EconomyPlayer, TTile extends EconomyTile>(
  player: TPlayer,
  tile: TTile
):
  | { ok: false; reason: string }
  | { ok: true; player: PurchasedPlayer<TPlayer>; tile: OwnedTile<TTile> } {
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
    } as PurchasedPlayer<TPlayer>,
    tile: {
      ...tile,
      ownerId: player.id
    } as OwnedTile<TTile>
  };
}

export function payRent<TPayer extends EconomyPlayer, TOwner extends EconomyPlayer>(
  payer: TPayer,
  owner: TOwner,
  rent: number
): {
  payer: SettledPlayer<TPayer>;
  owner: SettledPlayer<TOwner>;
} {
  const payment = Math.min(payer.cash, rent);
  const payerCash = payer.cash - payment;

  return {
    payer: {
      ...payer,
      cash: payerCash,
      status: payerCash === 0 && payment < rent ? "bankrupt" : "active"
    } as SettledPlayer<TPayer>,
    owner: {
      ...owner,
      cash: owner.cash + payment,
      status: owner.status ?? "active"
    } as SettledPlayer<TOwner>
  };
}

export function calculateTransportFare(steps: number, rate: number): number {
  return steps * rate;
}

export function payTransportFare<TPayer extends EconomyPlayer, TOwner extends EconomyPlayer>(
  payer: TPayer,
  owner: TOwner,
  fare: number
) {
  return payRent(payer, owner, fare);
}

export function calculateNetWorth(cash: number, assetValues: number[]): number {
  return cash + assetValues.reduce((sum, value) => sum + value, 0);
}
