import type { Metadata } from "next";
import { guestAssignments, hostTextTemplates, houseProfiles, transitGuideItems } from "../data";
import styles from "./directions.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Directions Hub | famous.land",
  description: "House directions and weekend movement guide for the famous.land July 4th, 2026 lake weekend.",
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

export default function July2026DirectionsPage() {
  return (
    <main className={`${styles.page} july-2026-app`}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>famous.land resort map</p>
            <h1>July 2026 Directions Hub</h1>
            <p>
              Use this for arrival, house-to-house movement, and the known LH2 and LH3 map links.
              LH1 directions stay pending until the host confirms the exact address.
            </p>
          </div>
          <nav className={styles.quickLinks} aria-label="Directions quick actions">
            <a href="/july2026">Guest Portal</a>
            <a href="/july2026/houses">House Directory</a>
            <a href="/july2026/arrival-card">Arrival Card</a>
            <a href="/july2026/concierge">Guest Concierge</a>
            <a href="/july2026/prep">Packing Prep</a>
            <a href="/july2026/itinerary">Itinerary</a>
            <a href="/july2026/fleet">Fleet Guide</a>
            <a href={lakeAreaUrl} target="_blank" rel="noreferrer">
              Lake Area Map
            </a>
            <a href={`sms:+17819294932?&body=${encodeURIComponent(roomHelpTemplate)}`}>
              Text Host
            </a>
          </nav>
        </header>

        <section className={styles.statusGrid} aria-label="Directions readiness">
          <article>
            <span>Live</span>
            <strong>LH2</strong>
            <p>63 Pine Eden Road, Rindge, New Hampshire</p>
          </article>
          <article>
            <span>Live</span>
            <strong>LH3</strong>
            <p>25 Sunny Cove Road, Winchendon, Massachusetts</p>
          </article>
          <article>
            <span>Pending</span>
            <strong>LH1</strong>
            <p>Text the host or use the Lake Monomonac area map until the final address is confirmed.</p>
          </article>
        </section>

        <section className={styles.houseCards} aria-label="Lake house directions">
          {houseProfiles.map((house) => {
            const assignedGuests = guestAssignments.filter((guest) => guest.house === house.name);
            const mapsUrl = "mapsUrl" in house ? house.mapsUrl : undefined;

            return (
              <article key={house.name}>
                <div className={styles.houseCardHeader}>
                  <div>
                    <span>{mapsUrl ? "Directions ready" : "Address pending"}</span>
                    <h2>{house.name}</h2>
                  </div>
                  <strong>{house.role}</strong>
                </div>
                <p className={styles.address}>{house.note}</p>
                <div className={styles.roomList}>
                  {house.rooms.map((room) => (
                    <span key={room}>{room}</span>
                  ))}
                </div>
                <p className={styles.guestList}>
                  {assignedGuests.length
                    ? `Guests: ${assignedGuests.map((guest) => guest.name).join(", ")}`
                    : "No confirmed guest rooms yet."}
                </p>
                <div className={styles.cardActions}>
                  {mapsUrl ? (
                    <a href={mapsUrl} target="_blank" rel="noreferrer">
                      {house.mapLabel}
                    </a>
                  ) : (
                    <a href={lakeAreaUrl} target="_blank" rel="noreferrer">
                      Open Lake Area Map
                    </a>
                  )}
                  <a href={`sms:+17819294932?&body=${encodeURIComponent(roomHelpTemplate)}`}>
                    Text Host
                  </a>
                </div>
              </article>
            );
          })}
        </section>

        <section className={styles.flowPanel} aria-labelledby="flow-title">
          <div>
            <p className={styles.kicker}>Weekend movement</p>
            <h2 id="flow-title">House-to-house flow</h2>
          </div>
          <ol>
            {transitGuideItems.map((item) => (
              <li key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </li>
            ))}
          </ol>
        </section>

        <footer className={styles.footer}>
          <span>Sponsored by famous.land</span>
          <a href="sms:+17819294932">Contact Host</a>
        </footer>
      </section>
    </main>
  );
}
