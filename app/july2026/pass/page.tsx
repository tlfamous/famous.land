import type { Metadata } from "next";
import {
  defaultHostTextMessage,
  hostPhoneDisplay,
  hostSmsHref,
  scheduleItems,
  statusItems
} from "../data";
import styles from "./pass.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Resort Pass | famous.land",
  description: "A mobile resort pass for the famous.land July 4th, 2026 lake weekend.",
  robots: {
    index: false,
    follow: false
  }
};

const passMoments = scheduleItems.filter((item) =>
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

const passActions = [
  {
    href: "/july2026",
    label: "Guest Portal",
    note: "Open the full resort experience"
  },
  {
    href: "/july2026/arrival-card",
    label: "Arrival Card",
    note: "Check-in, QR, house flow, and key schedule"
  },
  {
    href: "/july2026/directions",
    label: "Directions Hub",
    note: "Known LH2/LH3 maps and LH1 pending fallback"
  },
  {
    href: "/july2026/weekend-guide.txt",
    label: "Offline Guide",
    note: "Plain-text backup for low-signal moments"
  }
];

export default function July2026ResortPassPage() {
  return (
    <main className={`${styles.page} july-2026-app`}>
      <section className={styles.pass} aria-labelledby="resort-pass-title">
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>famous.land resort pass</p>
            <h1 id="resort-pass-title">July 4th, 2026</h1>
            <p>
              A pocket-sized guest pass for arrival, host help, calendar setup, and the core
              weekend flow.
            </p>
          </div>
          <figure className={styles.qrCard}>
            <img src="/july2026/qr.svg" alt="QR code for famous.land/july2026" />
            <figcaption>famous.land/july2026</figcaption>
          </figure>
        </header>

        <section className={styles.statusStrip} aria-label="Weekend status">
          {statusItems.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </section>

        <section className={styles.hostPanel} aria-label="Host contact">
          <div>
            <span>Host line</span>
            <strong>{hostPhoneDisplay}</strong>
            <p>{defaultHostTextMessage}</p>
          </div>
          <a href={hostSmsHref}>Text Host</a>
        </section>

        <section className={styles.actionGrid} aria-label="Resort pass actions">
          {passActions.map((action) => (
            <a href={action.href} key={action.label}>
              <strong>{action.label}</strong>
              <span>{action.note}</span>
            </a>
          ))}
          <a href="/july2026/calendar.ics">
            <strong>Add Calendar</strong>
            <span>Save check-in, meals, lake time, fireworks, brunch, and departure flow</span>
          </a>
          <a href="/july2026/host-contact.vcf">
            <strong>Save Host</strong>
            <span>Add the famous.land host card to your phone</span>
          </a>
        </section>

        <section className={styles.timelinePanel} aria-label="Key weekend moments">
          <div>
            <p className={styles.kicker}>Pocket itinerary</p>
            <h2>Key Weekend Moments</h2>
          </div>
          <ol>
            {passMoments.map((item) => (
              <li key={`${item.time}-${item.title}`}>
                <time>{item.time}</time>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
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
