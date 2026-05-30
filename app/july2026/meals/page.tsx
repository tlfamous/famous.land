import type { Metadata } from "next";
import { foodMoments, hostSmsHref, scheduleItems } from "../data";
import styles from "./meals.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Meals and Coffee | famous.land",
  description: "Guest meal, coffee, spa water, dinner, and brunch guide for the famous.land July 4th, 2026 lake weekend.",
  robots: {
    index: false,
    follow: false
  }
};

const coffeeMoments = scheduleItems.filter((item) => item.title === "Coffee time at all houses");
const saturdayDinner = foodMoments.find((moment) => moment.title === "Dinner");
const sundayBrunch = foodMoments.find((moment) => moment.title === "Pancake brunch");

const houseCoffee = [
  {
    house: "LH1",
    note: "Kona coffee",
    detail: "Friday welcome flow starts at LH1, and Saturday motorized orientation also gathers there."
  },
  {
    house: "LH2",
    note: "K-cup coffee",
    detail: "Quiet guest-room house and coffee stop for LH2 guests."
  },
  {
    house: "LH3",
    note: "Drip coffee",
    detail: "Saturday yoga, beach time, meals, and Sunday brunch center here."
  }
];

export default function July2026MealsPage() {
  return (
    <main className={`${styles.page} july-2026-app`}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>Meals</p>
            <h1>Meals and Coffee</h1>
            <p>
              The guest dining guide for welcome food, house coffee, spa water, lunch,
              lakeside patio dinner, and pancake brunch.
            </p>
          </div>
          <nav className={styles.quickLinks} aria-label="Meals quick actions">
            <a href="/july2026">Guest Portal</a>
            <a href="/july2026/faq">Guest FAQ</a>
            <a href="/july2026/map">Resort Map</a>
            <a href="/july2026/itinerary">Weekend Itinerary</a>
            <a href="/july2026/concierge">Guest Concierge</a>
            <a href={hostSmsHref}>Contact Host</a>
          </nav>
        </header>

        <section className={styles.summaryGrid} aria-label="Meals summary">
          <article>
            <span>Welcome</span>
            <strong>Fri 6:30 PM</strong>
            <p>Grab-and-go meal in the LH1 sunroom after check-in.</p>
          </article>
          <article>
            <span>Dinner</span>
            <strong>{saturdayDinner?.time ?? "Sat 6 PM"}</strong>
            <p>{saturdayDinner?.detail ?? "LH3 with lakeside patio seating."}</p>
          </article>
          <article>
            <span>Brunch</span>
            <strong>{sundayBrunch?.time ?? "Sun 10 AM"}</strong>
            <p>{sundayBrunch?.detail ?? "LH3 before Sunday free time and departures."}</p>
          </article>
        </section>

        <section className={styles.panel}>
          <p className={styles.kicker}>Food schedule</p>
          <h2>Meal Moments</h2>
          <ol className={styles.mealTimeline}>
            {foodMoments.map((moment) => (
              <li key={`${moment.time}-${moment.title}`}>
                <time>{moment.time}</time>
                <div>
                  <strong>{moment.title}</strong>
                  <p>{moment.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.twoColumn}>
          <article className={styles.panel}>
            <p className={styles.kicker}>Coffee map</p>
            <h2>Morning Coffee</h2>
            <div className={styles.coffeeGrid}>
              {houseCoffee.map((item) => (
                <section key={item.house}>
                  <span>{item.house}</span>
                  <strong>{item.note}</strong>
                  <p>{item.detail}</p>
                </section>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <p className={styles.kicker}>Timing</p>
            <h2>Coffee Windows</h2>
            <div className={styles.coffeeGrid}>
              {coffeeMoments.map((moment) => (
                <section key={`${moment.time}-${moment.detail}`}>
                  <span>{moment.time}</span>
                  <strong>{moment.title}</strong>
                  <p>{moment.detail}</p>
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
