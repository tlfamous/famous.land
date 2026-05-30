import type { Metadata } from "next";
import { foodMoments, scheduleItems } from "../data";
import styles from "./itinerary.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Weekend Itinerary | famous.land",
  description: "A guest-friendly weekend itinerary for the famous.land July 4th, 2026 lake weekend.",
  robots: {
    index: false,
    follow: false
  }
};

const itineraryDays = [
  {
    date: "Friday, July 3",
    focus: "Arrive, settle in, and gather at LH1",
    items: scheduleItems.filter((item) => item.time.startsWith("Fri"))
  },
  {
    date: "Saturday, July 4",
    focus: "Lake day, boat ride, dinner, fire pit, and fireworks",
    items: scheduleItems.filter((item) => item.time.startsWith("Sat"))
  },
  {
    date: "Sunday, July 5",
    focus: "Coffee, brunch, lake time, and departures",
    items: scheduleItems.filter((item) => item.time.startsWith("Sun") || item.time === "After brunch")
  }
];

export default function July2026ItineraryPage() {
  return (
    <main className={`${styles.page} july-2026-app`}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>famous.land itinerary</p>
            <h1>Weekend Itinerary</h1>
            <p>
              The full July 3-5 lake-weekend run of show, with the main house movements,
              meals, lake moments, and fireworks timing in one guest-friendly view.
            </p>
          </div>
          <nav className={styles.quickLinks} aria-label="Itinerary quick actions">
            <a href="/july2026">Guest Portal</a>
            <a href="/july2026/calendar.ics">Add Calendar</a>
            <a href="/july2026/arrival-card">Arrival Card</a>
            <a href="/july2026/directions">Directions Hub</a>
            <a href="/july2026/concierge">Guest Concierge</a>
            <a href="/july2026/prep">Packing Prep</a>
            <a href="/july2026/fleet">Fleet Guide</a>
          </nav>
        </header>

        <section className={styles.summaryGrid} aria-label="Weekend summary">
          <article>
            <span>Start</span>
            <strong>Fri 3-6 PM</strong>
            <p>Guest check-in window at assigned houses.</p>
          </article>
          <article>
            <span>Fourth</span>
            <strong>Sat 9 PM</strong>
            <p>Optional fireworks viewing from LH1, LH3, or host-approved cruise.</p>
          </article>
          <article>
            <span>Close</span>
            <strong>Sun 10 AM</strong>
            <p>Pancake brunch at LH3 before lake time and departures.</p>
          </article>
        </section>

        <section className={styles.dayStack} aria-label="Weekend itinerary">
          {itineraryDays.map((day) => (
            <article className={styles.dayPanel} key={day.date}>
              <div className={styles.dayHeader}>
                <div>
                  <p className={styles.kicker}>{day.focus}</p>
                  <h2>{day.date}</h2>
                </div>
              </div>
              <ol className={styles.timeline}>
                {day.items.map((item) => (
                  <li key={`${day.date}-${item.time}-${item.title}`}>
                    <time>{item.time}</time>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </section>

        <section className={styles.panel}>
          <p className={styles.kicker}>Food and coffee</p>
          <h2>Meal Moments</h2>
          <div className={styles.foodGrid}>
            {foodMoments.map((moment) => (
              <article key={`${moment.time}-${moment.title}`}>
                <time>{moment.time}</time>
                <strong>{moment.title}</strong>
                <p>{moment.detail}</p>
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
