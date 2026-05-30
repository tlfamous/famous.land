import type { Metadata } from "next";
import { hostHelpItems, hostTextTemplates, lakeUseRules, resortDeskItems } from "../data";
import styles from "./concierge.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Guest Concierge | famous.land",
  description: "Guest help, host text prompts, approvals, and lake rules for the famous.land July 4th, 2026 weekend.",
  robots: {
    index: false,
    follow: false
  }
};

const helpPriorities = [
  {
    label: "Text first",
    detail: "For anything uncertain, text 781-929-4932. Room, food, fleet, cruise, and link-reset questions all go there."
  },
  {
    label: "Approvals",
    detail: "Motorized lake fleet, quad/four-wheeler time, and optional cruise plans need host approval."
  },
  {
    label: "Room keys",
    detail: "If your guest link looks stale, bound, or confusing, text the host for a fresh room-key link."
  }
];

export default function July2026ConciergePage() {
  return (
    <main className={`${styles.page} july-2026-app`}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>famous.land concierge</p>
            <h1>Guest Help Desk</h1>
            <p>
              Quick answers for food notes, room-key help, activity approvals, lake rules,
              and what to text the host during the weekend.
            </p>
          </div>
          <nav className={styles.quickLinks} aria-label="Concierge quick actions">
            <a href="/july2026">Guest Portal</a>
            <a href="/july2026/arrival-card">Arrival Card</a>
            <a href="/july2026/map">Resort Map</a>
            <a href="/july2026/directions">Directions Hub</a>
            <a href="/july2026/prep">Packing Prep</a>
            <a href="/july2026/itinerary">Itinerary</a>
            <a href="/july2026/meals">Meals Guide</a>
            <a href="/july2026/fleet">Fleet Guide</a>
            <a href="/july2026/safety">Safety Guide</a>
            <a href="sms:+17819294932">Text Host</a>
          </nav>
        </header>

        <section className={styles.priorityGrid} aria-label="Concierge priorities">
          {helpPriorities.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <p>{item.detail}</p>
            </article>
          ))}
        </section>

        <section className={styles.twoColumn}>
          <article className={styles.panel}>
            <p className={styles.kicker}>Tap to send</p>
            <h2>Host Text Prompts</h2>
            <div className={styles.promptGrid}>
              {hostTextTemplates.map((template) => (
                <a key={template.label} href={`sms:+17819294932?&body=${encodeURIComponent(template.body)}`}>
                  <strong>{template.label}</strong>
                  <span>{template.body}</span>
                </a>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <p className={styles.kicker}>Fast answers</p>
            <h2>What To Ask About</h2>
            <div className={styles.helpList}>
              {hostHelpItems.map((item) => (
                <section key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </section>
              ))}
            </div>
          </article>
        </section>

        <section className={styles.panel}>
          <p className={styles.kicker}>Lake and activity rules</p>
          <h2>Approvals Before Action</h2>
          <div className={styles.ruleGrid}>
            {lakeUseRules.map((rule) => (
              <article key={rule.label}>
                <strong>{rule.label}</strong>
                <p>{rule.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <p className={styles.kicker}>Resort desk</p>
          <h2>Weekend Self-Service</h2>
          <div className={styles.serviceGrid}>
            {resortDeskItems.map((item) => (
              <article key={item.label}>
                <span>{item.label}</span>
                <strong>{item.action}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <span>Sponsored by famous.land</span>
          <a href="sms:+17819294932">Contact Host</a>
        </footer>
      </section>
    </main>
  );
}
