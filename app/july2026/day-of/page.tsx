import type { Metadata } from "next";
import {
  dayOfDeskItems,
  dayOfFlowItems,
  dayOfPriorityItems,
  hostSmsHref,
  lakeUseRules
} from "../data";
import styles from "./day-of.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Day-Of Desk",
  description: "A mobile day-of operations hub for July 4th, 2026 guests.",
  robots: {
    index: false,
    follow: false
  }
};

export default function July2026DayOfPage() {
  return (
    <main className={`${styles.page} july-2026-app`}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>Resort operations</p>
            <h1>Day-Of Desk</h1>
            <p>
              A fast guest hub for arrival, guest links, weather pivots, lake approvals,
              meals, maps, and host contact during July 4th weekend.
            </p>
          </div>
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
          <h2>Weekend Links</h2>
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

        <footer className={styles.footer}>
          <span>Sponsored by famous.land</span>
          <a href={hostSmsHref}>Contact Host</a>
        </footer>
      </section>
    </main>
  );
}
