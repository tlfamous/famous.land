export function GameStatusPill({ isOn }: { isOn: boolean }) {
  return (
    <div
      aria-label={`Game ${isOn ? "On" : "Off"}`}
      aria-disabled="true"
      className="game-status-pill"
      data-state={isOn ? "on" : "off"}
      role="status"
    >
      <span className="game-status-pill-title">Game</span>
      <span className="game-status-pill-option off-option">Off</span>
      <span className="game-status-pill-option on-option">On</span>
    </div>
  );
}
