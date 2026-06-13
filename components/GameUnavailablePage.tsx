import { GameUnavailableScanLogger } from "@/components/GameUnavailableScanLogger";

const contactHref = "sms:+19784310135";

export function GameUnavailablePage({ markerId }: { markerId?: string }) {
  return (
    <div className="game-off-page" aria-label="Famous Land">
      {markerId ? <GameUnavailableScanLogger markerId={markerId} /> : null}
      <section className="game-off-hero" aria-labelledby="game-off-title">
        <div className="game-off-brand">
          <span className="game-off-mark" aria-hidden="true">
            🐄
          </span>
        </div>
        <h1 id="game-off-title">Famous Land</h1>
        <p>Welcome to Famous Land. Contact us if you have any questions about this property</p>
        <div className="game-off-actions">
          <a className="button primary game-off-contact-button" href={contactHref}>
            Contact
          </a>
          <span>This opens up your messaging app</span>
        </div>
      </section>
    </div>
  );
}
