import type { Metadata } from "next";
import {
  activityItems,
  foodMoments,
  hostTextTemplates,
  houseProfiles,
  scheduleItems,
  transitGuideItems
} from "../data";
import styles from "./resort-map.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Resort Map | famous.land",
  description: "Resort-style house flow, lake route, and gathering map for the famous.land July 4th, 2026 weekend.",
  robots: {
    index: false,
    follow: false
  }
};

const lakeAreaUrl =
  "https://www.google.com/maps/search/?api=1&query=Lake%20Monomonac%20Rindge%20NH%20Winchendon%20MA";
const roomHelpTemplate =
  hostTextTemplates.find((template) => template.label === "Room help")?.body ??
  "Hi, I need help with my July 4th weekend room assignment or arrival directions.";

const mapStops = [
  {
    house: "LH1",
    label: "Friday welcome",
    detail: "Check-in flow, welcome meal, weekend orientation, boat departure, fire pit, and fireworks option.",
    position: "west"
  },
  {
    house: "LH2",
    label: "Quiet stay",
    detail: "Guest rooms, K-cup coffee, and the quieter overnight base between LH1 and LH3 gatherings.",
    position: "north"
  },
  {
    house: "LH3",
    label: "Lake day hub",
    detail: "Yoga, beach, non-motorized boats, spa water, lunch, dinner, brunch, and boat return.",
    position: "east"
  }
] as const;

const routeMoments = [
  scheduleItems.find((item) => item.title === "Weekend orientation"),
  scheduleItems.find((item) => item.title === "Motorized lake vehicle orientation"),
  scheduleItems.find((item) => item.title === "Boat ride"),
  scheduleItems.find((item) => item.title === "Dinner"),
  scheduleItems.find((item) => item.title === "Optional fireworks viewing"),
  scheduleItems.find((item) => item.title === "Pancake brunch")
].filter(Boolean) as typeof scheduleItems;

export default function July2026ResortMapPage() {
  return (
    <main className={`${styles.page} july-2026-app`}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>famous.land resort map</p>
            <h1>Resort Map</h1>
            <p>
              A guest-friendly movement map for LH1, LH2, LH3, lake routes, gathering hubs,
              and the moments when the weekend shifts from one house to another.
            </p>
          </div>
          <nav className={styles.quickLinks} aria-label="Resort map quick actions">
            <a href="/july2026">Guest Portal</a>
            <a href="/july2026/faq">Guest FAQ</a>
            <a href="/july2026/directions">Directions Hub</a>
            <a href="/july2026/houses">House Directory</a>
            <a href="/july2026/itinerary">Itinerary</a>
            <a href="/july2026/meals">Meals Guide</a>
            <a href="/july2026/fleet">Fleet Guide</a>
            <a href={lakeAreaUrl} target="_blank" rel="noreferrer">
              Lake Area Map
            </a>
            <a href={`sms:+17819294932?&body=${encodeURIComponent(roomHelpTemplate)}`}>Text Host</a>
          </nav>
        </header>

        <section className={styles.mapPanel} aria-label="Resort movement map">
          <div className={styles.mapCanvas}>
            <div className={styles.lakeShape} aria-hidden="true" />
            <div className={styles.routeLine} aria-hidden="true" />
            {mapStops.map((stop) => (
              <article className={`${styles.mapStop} ${styles[stop.position]}`} key={stop.house}>
                <span>{stop.house}</span>
                <strong>{stop.label}</strong>
                <p>{stop.detail}</p>
              </article>
            ))}
          </div>
          <aside className={styles.mapLegend}>
            <p className={styles.kicker}>How to read it</p>
            <h2>Weekend centers</h2>
            <p>
              Friday is anchored at LH1, Saturday lake time and meals are anchored at LH3,
              and LH2 stays intentionally quieter for guest rooms and coffee.
            </p>
            <a href="/july2026/directions">Open Directions Hub</a>
          </aside>
        </section>

        <section className={styles.houseGrid} aria-label="House roles and map status">
          {houseProfiles.map((house) => {
            const mapsUrl = "mapsUrl" in house ? house.mapsUrl : undefined;

            return (
              <article key={house.name}>
                <span>{mapsUrl ? "Directions ready" : "Address pending"}</span>
                <h2>{house.name}</h2>
                <strong>{house.role}</strong>
                <p>{house.note}</p>
                <div>
                  {house.rooms.map((room) => (
                    <small key={room}>{room}</small>
                  ))}
                </div>
                {mapsUrl ? (
                  <a href={mapsUrl} target="_blank" rel="noreferrer">
                    {house.mapLabel}
                  </a>
                ) : (
                  <a href={lakeAreaUrl} target="_blank" rel="noreferrer">
                    Open Lake Area Map
                  </a>
                )}
              </article>
            );
          })}
        </section>

        <section className={styles.timelinePanel}>
          <div>
            <p className={styles.kicker}>Movement moments</p>
            <h2>When the map changes</h2>
          </div>
          <ol>
            {routeMoments.map((item) => (
              <li key={`${item.time}-${item.title}`}>
                <time>{item.time}</time>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.twoColumn}>
          <article>
            <p className={styles.kicker}>House flow</p>
            <h2>Getting Around</h2>
            <div className={styles.stack}>
              {transitGuideItems.map((item) => (
                <section key={item.label}>
                  <strong>{item.label}</strong>
                  <p>{item.detail}</p>
                </section>
              ))}
            </div>
          </article>
          <article>
            <p className={styles.kicker}>Activity anchors</p>
            <h2>Where things happen</h2>
            <div className={styles.stack}>
              {activityItems.slice(0, 4).map((item) => (
                <section key={item.title}>
                  <strong>{item.title}</strong>
                  <p>
                    {item.location}. {item.detail}
                  </p>
                </section>
              ))}
            </div>
          </article>
        </section>

        <section className={styles.foodStrip} aria-label="Food locations">
          {foodMoments.map((item) => (
            <article key={`${item.time}-${item.title}`}>
              <time>{item.time}</time>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </section>

        <footer className={styles.footer}>
          <span>Sponsored by famous.land</span>
          <a href={`sms:+17819294932?&body=${encodeURIComponent(roomHelpTemplate)}`}>Contact Host</a>
        </footer>
      </section>
    </main>
  );
}
