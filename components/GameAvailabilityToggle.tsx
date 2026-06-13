import { updateGameAvailability } from "@/app/admin/actions";
import type { GameAvailability } from "@/lib/db";

export function GameAvailabilityToggle({
  availability
}: {
  availability: GameAvailability;
}) {
  const isEnabled = availability.enabled;
  const nextEnabled = !isEnabled;

  return (
    <section
      aria-label="Game availability"
      className="game-availability-toggle"
      data-state={isEnabled ? "on" : "off"}
    >
      <div>
        <p className="eyebrow">Game status</p>
        <h2>{isEnabled ? "Game is on" : "Game is off"}</h2>
        <p>
          {isEnabled
            ? "Players can open QR markers, quest progress, and save-progress flows."
            : "Players see the branded Famous Land contact page instead of the game."}
        </p>
      </div>
      <div className="game-availability-actions">
        <form action={updateGameAvailability}>
          <input name="enabled" type="hidden" value={String(nextEnabled)} />
          <button
            aria-pressed={isEnabled}
            className="game-power-switch"
            type="submit"
          >
            <span className="game-power-switch-track" aria-hidden="true">
              <span className="game-power-switch-knob" />
            </span>
            <span>{isEnabled ? "On" : "Off"}</span>
          </button>
        </form>
        {!isEnabled ? (
          <a className="button secondary game-off-preview-link" href="/">
            View off page
          </a>
        ) : null}
      </div>
    </section>
  );
}
