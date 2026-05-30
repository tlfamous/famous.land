import type { Metadata } from "next";
import { hostSmsHref, rainPlanItems, scheduleItems } from "../data";
import styles from "./rain-plan.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Rain Plan | famous.land",
  description: "Weather backup guidance for the famous.land July 4th, 2026 lake weekend.",
  robots: {
    index: false,
    follow: false
  }
};

const anchorMoments = scheduleItems.filter((item) =>
  [
    "Casual grab-and-go meal",
    "Weekend orientation",
    "Motorized lake vehicle orientation",
    "Lunch",
    "Dinner",
    "Optional fireworks viewing",
    "Pancake brunch"
  ].includes(item.title)
);

const safetyHolds = [
  "Thunder or lightning near the lake",
  "Heavy rain that limits visibility or dock footing",
  "Host-directed pause for boats, PWC rides, swimming, or dock movement",
  "Any uncertainty about whether a lake activity should continue"
];

export default function July2026RainPlanPage() {
  return (
    <main className={`${styles.page} july-2026-app`}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>famous.land weather desk</p>
            <h1>Rain Plan</h1>
            <p>
              A practical backup guide for host updates, indoor pivots, lake holds,
              meal continuity, and what to keep ready if the weekend weather shifts.
            </p>
          </div>
          <nav className={styles.quickLinks} aria-label="Rain plan quick actions">
            <a href="/july2026">Guest Portal</a>
            <a href="/july2026/pass">Resort Pass</a>
            <a href="/july2026/faq">Guest FAQ</a>
            <a href="/july2026/itinerary">Itinerary</a>
            <a href="/july2026/safety">Safety Guide</a>
            <a href="/july2026/weekend-guide.txt">Offline Guide</a>
            <a href={hostSmsHref}>Text Host</a>
          </nav>
        </header>

        <section className={styles.summaryGrid} aria-label="Rain plan summary">
          <article>
            <span>Updates</span>
            <strong>Host text line</strong>
            <p>Weather calls and movement updates come through 781-929-4932.</p>
          </article>
          <article>
            <span>Lake</span>
            <strong>Safety first</strong>
            <p>Water, dock, boat, and PWC activity pauses during unsafe conditions.</p>
          </article>
          <article>
            <span>Meals</span>
            <strong>Still planned</strong>
            <p>Food timing stays anchored unless the host sends a revised plan.</p>
          </article>
        </section>

        <section className={styles.planGrid} aria-label="Rain plan guidance">
          {rainPlanItems.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <h2>{item.title}</h2>
              <p>{item.detail}</p>
            </article>
          ))}
        </section>

        <section className={styles.twoColumn}>
          <article className={styles.panel}>
            <p className={styles.kicker}>Safety hold</p>
            <h2>Pause Lake Activity When</h2>
            <ul className={styles.checkList}>
              {safetyHolds.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.panel}>
            <p className={styles.kicker}>Schedule anchors</p>
            <h2>Moments To Recheck</h2>
            <ol className={styles.timeline}>
              {anchorMoments.map((item) => (
                <li key={`${item.time}-${item.title}`}>
                  <time>{item.time}</time>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </article>
        </section>

        <section className={styles.hostPanel} aria-label="Rain plan host help">
          <div>
            <p className={styles.kicker}>Unsure what changed?</p>
            <h2>Text the host</h2>
            <p>
              Ask before heading to the dock, changing house plans, or assuming a lake
              activity is still on. The host will confirm the safest current plan.
            </p>
          </div>
          <a href={hostSmsHref}>Contact Host</a>
        </section>

        <footer className={styles.footer}>
          <span>Sponsored by famous.land</span>
          <a href="/july2026/safety">Safety Guide</a>
          <a href="/july2026/concierge">Concierge</a>
        </footer>
      </section>
    </main>
  );
}
