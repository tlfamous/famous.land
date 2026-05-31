import type { Metadata } from "next";
import { hostSmsHref, houseProfiles, scheduleItems } from "../data";
import styles from "./resort-map.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Resort Map",
  description: "Resort-style house flow, lake route, and gathering map for the July 4th, 2026 weekend.",
  robots: {
    index: false,
    follow: false
  }
};

const lakeAreaUrl =
  "https://www.google.com/maps/search/?api=1&query=Lake%20Monomonac%20Rindge%20NH%20Winchendon%20MA";

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
            <p className={styles.kicker}>Resort map</p>
            <h1>Resort Map</h1>
            <p>
              A guest-friendly movement map for LH1, LH2, LH3, lake routes, gathering hubs,
              and the moments when the weekend shifts from one house to another.
            </p>
          </div>
        </header>

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

        <footer className={styles.footer}>
          <span>Sponsored by famous.land</span>
          <a href={hostSmsHref}>Contact Host</a>
        </footer>
      </section>
    </main>
  );
}
