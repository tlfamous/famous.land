import type { Metadata } from "next";
import Link from "next/link";
import { PromoZoneCompositeMap } from "@/components/InteractiveLandMap";

export const metadata: Metadata = {
  title: "How to Play Famous Land",
  description: "Learn how the Famous Land QR-code quest works before you begin."
};

const questSteps = [
  {
    number: "1",
    title: "Find tree tags",
    body: "Look for small Famous Land tags on trees along trails and around the property. Each tag marks a stop in the quest."
  },
  {
    number: "2",
    title: "Scan QR codes",
    body: "Use your phone camera to scan a code. Each scan opens a clue, challenge, or place-based story about that spot."
  },
  {
    number: "3",
    title: "Save progress",
    body: "Keep your progress connected to your phone number so you can pause, wander, and pick up where you left off."
  }
];

const safetyNotes = [
  "Stay on trails",
  "Bring water",
  "Check weather",
  "Charge your phone",
  "Supervise kids",
  "Respect the land"
];

export default function HowToPlayPage() {
  return (
    <div className="quest-promo-page">
      <section className="quest-promo-hero" aria-labelledby="quest-promo-title">
        <div className="quest-promo-hero-copy">
          <h1 id="quest-promo-title">Famous Land</h1>
          <p>
            An outdoor QR-code discovery quest across the woods, trails, and
            lakefront around the southern part of Lake Monomonac in Winchendon,
            MA.
          </p>
          <div className="quest-promo-actions">
            <Link className="button primary quest-promo-primary" href="/quest">
              Start the quest
              <span aria-hidden="true">-&gt;</span>
            </Link>
            <Link className="quest-promo-text-link" href="/safety">
              Safety and common sense
              <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="quest-promo-section" aria-labelledby="quest-steps-title">
        <div className="quest-promo-section-heading">
          <h2 id="quest-steps-title">How the quest works</h2>
          <p>
            Famous Land is built for phones, fresh air, and curious people moving
            at their own pace around southern Lake Monomonac.
          </p>
        </div>
        <div className="quest-step-grid">
          {questSteps.map((step) => (
            <article className="quest-step" key={step.number}>
              <span className="quest-step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="quest-zone-band" aria-labelledby="quest-zones-title">
        <div className="quest-zone-copy">
          <h2 id="quest-zones-title">Explore zones. Discover more trails.</h2>
          <p>
            The quest breaks the land into places to notice: trees, paths,
            shoreline, fields, and tucked-away corners near the southern shore of
            Lake Monomonac in Winchendon, MA. Move between zones, scan what you
            find, and let the map pull you farther into the property.
          </p>
        </div>
        <div className="quest-zone-map">
          <PromoZoneCompositeMap />
        </div>
      </section>

      <section className="quest-promo-section" aria-labelledby="quest-safety-title">
        <div className="quest-promo-section-heading">
          <h2 id="quest-safety-title">Safety and common sense</h2>
          <p>
            The game should make the land more fun, not riskier. Stop playing if
            anything feels unsafe.
          </p>
        </div>
        <ul className="quest-safety-list">
          {safetyNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section className="quest-final-cta" aria-labelledby="quest-final-title">
        <h2 id="quest-final-title">Ready to explore?</h2>
        <p>Grab your phone, gather your people, and head outside.</p>
        <Link className="button primary quest-promo-primary" href="/quest">
          Start the quest
          <span aria-hidden="true">-&gt;</span>
        </Link>
      </section>
    </div>
  );
}
