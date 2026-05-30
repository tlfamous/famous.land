import type { Metadata } from "next";
import {
  dayOfDeskItems,
  dayOfFlowItems,
  dayOfPriorityItems,
  hostSmsHref,
  hostTextTemplates,
  lakeUseRules
} from "../data";
import styles from "./day-of.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Day-Of Desk | famous.land",
  description: "A mobile day-of operations hub for famous.land July 4th, 2026 guests.",
  robots: {
    index: false,
    follow: false
  }
};

const roomHelpTemplate =
  hostTextTemplates.find((template) => template.label === "Room help")?.body ??
  "Hi, I need help with my July 4th weekend room assignment or arrival directions.";
const fleetTemplate =
  hostTextTemplates.find((template) => template.label === "Fleet approval")?.body ??
  "Hi, I would like host approval or timing guidance for motorized lake fleet use.";

export default function July2026DayOfPage() {
  return (
    <main className={`${styles.page} july-2026-app`}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>famous.land resort operations</p>
            <h1>Day-Of Desk</h1>
            <p>
              A fast guest hub for arrival, room keys, weather pivots, lake approvals,
              meals, maps, and host texts during July 4th weekend.
            </p>
          </div>
          <nav className={styles.quickLinks} aria-label="Day-of quick actions">
            <a href="/july2026">Guest Portal</a>
            <a href="/july2026/map">Resort Map</a>
            <a href={hostSmsHref}>Text Host</a>
          </nav>
        </header>

        <section className={styles.priorityGrid} aria-label="Day-of priorities">
          {dayOfPriorityItems.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </section>

        <section className={styles.panel}>
          <p className={styles.kicker}>Tap what you need</p>
          <h2>Guest Links</h2>
          <div className={styles.linkGrid}>
            {dayOfDeskItems.map((item) => (
              <a href={item.href} key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.note}</span>
              </a>
            ))}
          </div>
        </section>

        <section className={styles.twoColumn}>
          <article className={styles.panel}>
            <p className={styles.kicker}>What now?</p>
            <h2>Weekend Flow</h2>
            <ol className={styles.flowList}>
              {dayOfFlowItems.map((item) => (
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

          <article className={styles.panel}>
            <p className={styles.kicker}>Approval checks</p>
            <h2>Before Action</h2>
            <div className={styles.ruleGrid}>
              {lakeUseRules.map((rule) => (
                <section key={rule.label}>
                  <strong>{rule.label}</strong>
                  <p>{rule.detail}</p>
                </section>
              ))}
            </div>
          </article>
        </section>

        <section className={styles.hostPanel} aria-label="Contact host">
          <div>
            <p className={styles.kicker}>Host line</p>
            <h2>Need a human?</h2>
            <p>
              Text for room help, weather movement, food notes, directions, fleet approval,
              cruise questions, or a room-key reset.
            </p>
          </div>
          <div className={styles.hostActions}>
            <a href={hostSmsHref}>Text Host</a>
            <a href={`sms:+17819294932?&body=${encodeURIComponent(roomHelpTemplate)}`}>Room Help</a>
            <a href={`sms:+17819294932?&body=${encodeURIComponent(fleetTemplate)}`}>Fleet Approval</a>
          </div>
        </section>

        <footer className={styles.footer}>
          <span>Sponsored by famous.land</span>
        </footer>
      </section>
    </main>
  );
}
