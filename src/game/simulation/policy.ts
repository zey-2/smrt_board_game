export interface PurchasePolicy {
  safetyThreshold: number;
}

export function shouldBuyStation(
  currentCash: number,
  price: number,
  policy: PurchasePolicy
): boolean {
  return currentCash - price >= policy.safetyThreshold;
}
