export function movePosition(
  currentPosition: number,
  steps: number,
  boardSize: number
): number {
  return (currentPosition + steps) % boardSize;
}

export function getMovementPath(
  currentPosition: number,
  steps: number,
  boardSize: number
): number[] {
  return Array.from({ length: steps }, (_, index) =>
    movePosition(currentPosition, index + 1, boardSize)
  );
}
