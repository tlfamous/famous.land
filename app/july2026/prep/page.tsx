import type { Metadata } from "next";
import { arrivalChecklistItems, bringItems, hostTextTemplates } from "../data";
import styles from "./prep.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Packing and Prep | famous.land",
  description: "What to bring, what is provided, and pre-arrival prep for the famous.land July 4th, 2026 lake weekend.",
  robots: {
    index: false,
    follow: false
  }
};

const coveredItems = [
  "Drinks are provided",
  "Chairs and lakeside seating are provided",
  "Main meals and scheduled food moments are planned",
  "Guest portal, calendar, host contact, and offline guide are available on your phone"
];

const niceToHaveItems = [
  "Comfortable shoes for walking between lake areas",
  "A phone charger or battery pack",
  "Any personal medications or allergy supplies",
  "A dry bag or zip pouch for lake time",
  "Sleepwear and casual layers for cool evenings"
];

export default function July2026PrepPage() {
  return (
    <main className={`${styles.page} july-2026-app`}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>famous.land packing list</p>
            <h1>Packing and Prep</h1>
            <p>
              A simple pre-arrival checklist for lake time, meals, phone setup, and
              what guests do not need to bring.
            </p>
          </div>
          <nav className={styles.quickLinks} aria-label="Prep quick actions">
            <a href="/july2026">Guest Portal</a>
            <a href="/july2026/arrival-card">Arrival Card</a>
            <a href="/july2026/itinerary">Itinerary</a>
            <a href="/july2026/concierge">Guest Concierge</a>
            <a href="sms:+17819294932">Text Host</a>
          </nav>
        </header>

        <section className={styles.summaryGrid} aria-label="Prep summary">
          <article>
            <span>Bring</span>
            <strong>Lake basics</strong>
            <p>Sunscreen, swim gear, water bottle, bug spray, and a light layer.</p>
          </article>
          <article>
            <span>Covered</span>
            <strong>Drinks and seating</strong>
            <p>No need to bring drinks, lawn chairs, or blankets for the hosted lake setup.</p>
          </article>
          <article>
            <span>Before leaving</span>
            <strong>Phone setup</strong>
            <p>Open your room key, save the host contact, add the calendar, and download the guide.</p>
          </article>
        </section>

        <section className={styles.twoColumn}>
          <article className={styles.panel}>
            <p className={styles.kicker}>Pack these</p>
            <h2>What To Bring</h2>
            <ul className={styles.checkList}>
              {bringItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.panel}>
            <p className={styles.kicker}>Already handled</p>
            <h2>Provided</h2>
            <ul className={styles.checkList}>
              {coveredItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className={styles.panel}>
          <p className={styles.kicker}>Before you leave</p>
          <h2>Arrival Prep</h2>
          <div className={styles.prepGrid}>
            {arrivalChecklistItems.map((item) => (
              <article key={item.label}>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.twoColumn}>
          <article className={styles.panel}>
            <p className={styles.kicker}>Optional</p>
            <h2>Nice To Have</h2>
            <ul className={styles.checkList}>
              {niceToHaveItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.panel}>
            <p className={styles.kicker}>Questions</p>
            <h2>Text The Host</h2>
            <div className={styles.promptGrid}>
              {hostTextTemplates.map((template) => (
                <a key={template.label} href={`sms:+17819294932?&body=${encodeURIComponent(template.body)}`}>
                  <strong>{template.label}</strong>
                  <span>{template.body}</span>
                </a>
              ))}
            </div>
          </article>
        </section>

        <footer className={styles.footer}>
          <span>Sponsored by famous.land</span>
          <a href="sms:+17819294932">Contact Host</a>
        </footer>
      </section>
    </main>
  );
}
