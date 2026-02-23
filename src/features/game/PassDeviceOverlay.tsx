interface PassDeviceOverlayProps {
  nextPlayerName: string;
  onContinue: () => void;
}

export function PassDeviceOverlay({
  nextPlayerName,
  onContinue
}: PassDeviceOverlayProps) {
  return (
    <div className="overlay-backdrop" role="dialog" aria-modal="true">
      <div className="overlay-card">
        <h3>Pass device to {nextPlayerName}</h3>
        <p>Hide your strategy and hand the device to the next player.</p>
        <button type="button" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}
