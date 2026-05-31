import type { Metadata } from "next";
import { faqItems, hostSmsHref } from "../data";
import styles from "./faq.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Resort FAQ",
  description: "Fast guest answers for arrival, directions, food, lake approvals, phone setup, and host help.",
  robots: {
    index: false,
    follow: false
  }
};

const categories = Array.from(new Set(faqItems.map((item) => item.category)));

export default function July2026FaqPage() {
  return (
    <main className={`${styles.page} july-2026-app`}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>Resort answers</p>
            <h1>Guest FAQ</h1>
            <p>
              Fast answers for arrival, directions, meals, lake approvals, phone setup,
              and the host line before the July 4th weekend.
            </p>
          </div>
        </header>

        <section className={styles.summaryGrid} aria-label="FAQ summary">
          <article>
            <span>Best first step</span>
            <strong>Open your guest link</strong>
            <p>Your personal link has house, room, companion, directions, and host-help context.</p>
          </article>
          <article>
            <span>Host line</span>
            <strong>781-929-4932</strong>
            <p>Text for room help, directions, food notes, fleet approval, cruise questions, or link resets.</p>
          </article>
          <article>
            <span>Phone setup</span>
            <strong>Save the essentials</strong>
            <p>Add the calendar and save the host contact before leaving.</p>
          </article>
        </section>

        <section className={styles.categoryNav} aria-label="FAQ categories">
          {categories.map((category) => (
            <a href={`#${category.toLowerCase().replaceAll(" ", "-")}`} key={category}>
              {category}
            </a>
          ))}
        </section>

        <section className={styles.faqStack} aria-label="Frequently asked questions">
          {categories.map((category) => (
            <article className={styles.categoryPanel} id={category.toLowerCase().replaceAll(" ", "-")} key={category}>
              <p className={styles.kicker}>{category}</p>
              <div className={styles.answerGrid}>
                {faqItems
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <section key={item.question}>
                      <h2>{item.question}</h2>
                      <p>{item.answer}</p>
                    </section>
                  ))}
              </div>
            </article>
          ))}
        </section>

        <section className={styles.hostPanel} aria-label="Still need help">
          <div>
            <p className={styles.kicker}>Still unsure?</p>
            <h2>Text the host</h2>
            <p>
              The host line is the right place for anything not covered here, especially
              room details, live directions, food notes, and lake approvals.
            </p>
          </div>
          <a href={hostSmsHref}>Contact Host</a>
        </section>

        <footer className={styles.footer}>
          <span>Sponsored by famous.land</span>
          <a href="/july2026/concierge">Concierge</a>
        </footer>
      </section>
    </main>
  );
}
