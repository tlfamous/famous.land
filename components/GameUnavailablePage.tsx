import { GameUnavailableScanLogger } from "@/components/GameUnavailableScanLogger";

const contactHref = "sms:+19784310135";

export function GameUnavailablePage({
  headline,
  markerId,
  markerNumber
}: {
  headline?: string;
  markerId?: string;
  markerNumber?: number;
}) {
  const tagLabel =
    markerNumber === undefined
      ? ""
      : ` Tag ${String(markerNumber).padStart(2, "0")}`;

  return (
    <div className="game-off-page" aria-label="Famous Land">
      {markerId ? <GameUnavailableScanLogger markerId={markerId} /> : null}
      <section className="game-off-hero" aria-labelledby="game-off-title">
        {headline ? <p className="game-off-headline">{headline}</p> : null}
        <div className="game-off-title-lockup">
          <span className="game-off-mark" aria-hidden="true">
            🐄
          </span>
          <div className="game-off-title-copy">
            <h1 id="game-off-title">Famous Land</h1>
          </div>
        </div>
        <p className="game-off-note">
          Welcome to Famous Land{tagLabel}. Contact us if you have any questions
          about this property
        </p>
        <div className="game-off-actions">
          <a className="button primary game-off-contact-button" href={contactHref}>
            <span className="game-off-contact-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M5 6.5C5 5.12 6.12 4 7.5 4h9C17.88 4 19 5.12 19 6.5v5.25c0 1.38-1.12 2.5-2.5 2.5h-4.7l-3.55 3.1c-.5.44-1.25.08-1.25-.58v-2.52h-.5C6.12 14.25 5 13.13 5 11.75V6.5Z" />
                <path d="M8.4 8.35h7.2M8.4 10.75h4.9" />
              </svg>
            </span>
            <span>Contact</span>
          </a>
          <span>This opens up your messaging app</span>
        </div>
      </section>
    </div>
  );
}
