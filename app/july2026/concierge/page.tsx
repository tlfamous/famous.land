import type { Metadata } from "next";
import { hostHelpItems, hostSmsHref, lakeUseRules, resortDeskItems } from "../data";
import styles from "./concierge.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Guest Concierge",
  description: "Guest help, approvals, and lake rules for the July 4th, 2026 weekend.",
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
    label: "Guest links",
    detail: "If your guest link looks stale, bound, or confusing, text the host for a fresh guest link."
  }
];

export default function July2026ConciergePage() {
  return (
    <main className={`${styles.page} july-2026-app`}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>Guest concierge</p>
            <h1>Guest Help Desk</h1>
            <p>
              Quick answers for food notes, guest-link help, activity approvals, lake rules,
              and when to contact the host during the weekend.
            </p>
          </div>
        </header>

        <section className={styles.priorityGrid} aria-label="Concierge priorities">
          {helpPriorities.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <p>{item.detail}</p>
            </article>
          ))}
        </section>

        <section className={styles.panel}>
          <p className={styles.kicker}>Common questions</p>
          <h2>Open the Resort FAQ</h2>
          <p>
            Arrival timing, directions status, what is provided, lake approvals,
            and phone setup are collected in one quick-answer page.
          </p>
          <a className={styles.sectionLink} href="/july2026/faq">Open Guest FAQ</a>
        </section>

        <section className={styles.twoColumn}>
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

          <article className={styles.panel}>
            <p className={styles.kicker}>Host contact</p>
            <h2>One Line For Help</h2>
            <p>
              Room questions, dietary notes, lake approvals, cruise plans, and link resets
              all go through the Contact Host button.
            </p>
            <a className={styles.sectionLink} href={hostSmsHref}>Contact Host</a>
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
          <a href={hostSmsHref}>Contact Host</a>
        </footer>
      </section>
    </main>
  );
}
