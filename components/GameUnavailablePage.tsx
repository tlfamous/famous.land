const contactHref = "sms:+19784310135";

export function GameUnavailablePage() {
  return (
    <div className="game-off-page" aria-label="Famous Land">
      <section className="game-off-hero" aria-labelledby="game-off-title">
        <div className="game-off-brand">
          <span className="game-off-mark" aria-hidden="true">
            F
          </span>
          <span>FAMOUS LAND</span>
        </div>
        <h1 id="game-off-title">Famous Land</h1>
        <p>The game is not open right now. Contact us if you need help.</p>
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
