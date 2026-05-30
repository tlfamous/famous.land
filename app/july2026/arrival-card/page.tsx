import type { Metadata } from "next";
import {
  arrivalChecklistItems,
  hostSmsHref,
  hostTextTemplates,
  houseProfiles,
  scheduleItems,
  transitGuideItems
} from "../data";
import styles from "./arrival-card.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Arrival Card | famous.land",
  description: "A print-friendly arrival card for the famous.land July 4th, 2026 lake weekend.",
  robots: {
    index: false,
    follow: false
  }
};

const keyScheduleItems = scheduleItems.filter((item) =>
  [
    "Guest check-in window",
    "Casual grab-and-go meal",
    "Weekend orientation",
    "Yoga on the beach",
    "Motorized lake vehicle orientation",
    "Boat ride",
    "Dinner",
    "Optional fireworks viewing",
    "Pancake brunch"
  ].includes(item.title)
);

export default function July2026ArrivalCardPage() {
  return (
    <main className={`${styles.page} july-2026-app`}>
      <section className={styles.sheet} aria-labelledby="arrival-card-title">
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>famous.land guest card</p>
            <h1 id="arrival-card-title">July 4th, 2026 Arrival Card</h1>
            <p>
              Keep this handy for check-in, house movement, host help, and the first
              weekend decisions.
            </p>
          </div>
          <figure className={styles.qrBlock}>
            <img src="/july2026/qr.svg" alt="QR code for famous.land/july2026" />
            <figcaption>famous.land/july2026</figcaption>
          </figure>
        </header>

        <section className={styles.commandBar} aria-label="Arrival quick actions">
          <a href="/july2026">Guest Portal</a>
          <a href="/july2026/faq">Guest FAQ</a>
          <a href="/july2026/rain-plan">Rain Plan</a>
          <a href="/july2026/map">Resort Map</a>
          <a href="/july2026/directions">Directions Hub</a>
          <a href="/july2026/guest-list">Guest Registry</a>
          <a href="/july2026/concierge">Guest Concierge</a>
          <a href="/july2026/prep">Packing Prep</a>
          <a href="/july2026/itinerary">Itinerary</a>
          <a href="/july2026/meals">Meals Guide</a>
          <a href="/july2026/fleet">Fleet Guide</a>
          <a href="/july2026/safety">Safety Guide</a>
          <a href="/july2026/calendar.ics">Add Calendar</a>
          <a href="/july2026/host-contact.vcf">Save Host</a>
          <a href="/july2026/weekend-guide.txt">Offline Guide</a>
          <a href={hostSmsHref}>Text 781-929-4932</a>
        </section>

        <section className={styles.essentials} aria-label="Arrival essentials">
          <article>
            <span>Check-in</span>
            <strong>Friday 3-6 PM</strong>
            <p>Arrive at your assigned house, settle into your room, then follow the Friday LH1 welcome flow.</p>
          </article>
          <article>
            <span>Host line</span>
            <strong>781-929-4932</strong>
            <p>Text for room help, arrival directions, dietary notes, link resets, and lake-fleet approvals.</p>
          </article>
          <article>
            <span>Portal</span>
            <strong>famous.land/july2026</strong>
            <p>Use your room-key link for your assignment, directions, calendar, QR, and personal packet.</p>
          </article>
        </section>

        <section className={styles.twoColumn}>
          <article className={styles.panel}>
            <h2>Arrival Checklist</h2>
            <ol className={styles.checklist}>
              {arrivalChecklistItems.map((item) => (
                <li key={item.label}>
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </li>
              ))}
            </ol>
          </article>

          <article className={styles.panel}>
            <h2>House Flow</h2>
            <ol className={styles.flowList}>
              {transitGuideItems.map((item) => (
                <li key={item.label}>
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </li>
              ))}
            </ol>
          </article>
        </section>

        <section className={styles.panel}>
          <h2>House Directory</h2>
          <div className={styles.houseGrid}>
            {houseProfiles.map((house) => (
              <article key={house.name}>
                <strong>{house.name}</strong>
                <p>{house.role}</p>
                <span>{house.note}</span>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <h2>Key Schedule</h2>
          <ol className={styles.schedule}>
            {keyScheduleItems.map((item) => (
              <li key={`${item.time}-${item.title}`}>
                <time>{item.time}</time>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.panel}>
          <h2>Text Prompts</h2>
          <div className={styles.promptGrid}>
            {hostTextTemplates.map((template) => (
              <a key={template.label} href={`sms:+17819294932?&body=${encodeURIComponent(template.body)}`}>
                <strong>{template.label}</strong>
                <span>{template.body}</span>
              </a>
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
