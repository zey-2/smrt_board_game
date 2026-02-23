export function movePosition(
  currentPosition: number,
  steps: number,
  boardSize: number
): number {
  return (currentPosition + steps) % boardSize;
}
