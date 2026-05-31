import type { Metadata } from "next";
import { houseProfiles } from "../../data";
import styles from "./house-signs.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 House Signs | famous.land",
  description: "Print-friendly July 2026 house signs for LH1, LH2, and LH3.",
  robots: {
    index: false,
    follow: false
  }
};

const houseSignNotes = {
  LH1: {
    headline: "Welcome, orientation, boat departure, and fire pit.",
    moments: [
      "Fri 6:30 PM welcome meal in the sunroom",
      "Fri 7:00 PM weekend orientation in Great Room 1",
      "Sat 11:00 AM motorized fleet orientation",
      "Sat evening s'mores, sparklers, and fireworks options"
    ]
  },
  LH2: {
    headline: "Quiet guest rooms and K-cup coffee stop.",
    moments: [
      "South bedroom: Cin and Vin",
      "North bedroom: Adam and Gage",
      "Sat and Sun coffee time before lake activities",
      "Use the guest portal for live directions"
    ]
  },
  LH3: {
    headline: "Beach, lake activities, meals, brunch, and boat return.",
    moments: [
      "Sat 8:00 AM yoga on the beach",
      "Sat 9:00 AM non-motorized lake activities",
      "Sat 12:30 PM lunch after the boat ride",
      "Sat dinner and Sunday pancake brunch"
    ]
  }
} as const;

export default function July2026HouseSignsPage() {
  return (
    <main className={styles.sheet}>
      <header className={styles.header}>
        <div>
          <p>famous.land guest operations</p>
          <h1>July 4th, 2026 House Signs</h1>
          <span>Print signs for LH1, LH2, and LH3 so guests can scan the portal and orient quickly.</span>
        </div>
        <nav aria-label="Admin links">
          <a href="/july2026/admin">Admin</a>
          <a href="/july2026/admin/briefing-sheet">Briefing</a>
        </nav>
      </header>

      <section className={styles.signs} aria-label="Printable house signs">
        {houseProfiles.map((house) => {
          const notes = houseSignNotes[house.name as keyof typeof houseSignNotes];

          return (
            <article className={styles.sign} key={house.name}>
              <div className={styles.signHeader}>
                <div>
                  <span>Lake Weekend Resort</span>
                  <h2>{house.name}</h2>
                  <p>{notes.headline}</p>
                </div>
                <img src="/july2026/qr.svg" alt="July 4th, 2026 guest portal QR code" />
              </div>

              <dl className={styles.details}>
                <div>
                  <dt>Host text line</dt>
                  <dd>781-929-4932</dd>
                </div>
                <div>
                  <dt>Guest portal</dt>
                  <dd>famous.land/july2026</dd>
                </div>
                <div>
                  <dt>Address</dt>
                  <dd>{house.note}</dd>
                </div>
              </dl>

              <section className={styles.roomBlock}>
                <strong>Rooms and spaces</strong>
                <ul>
                  {house.rooms.map((room) => (
                    <li key={room}>{room}</li>
                  ))}
                </ul>
              </section>

              <section className={styles.moments}>
                <strong>Key moments here</strong>
                <ul>
                  {notes.moments.map((moment) => (
                    <li key={moment}>{moment}</li>
                  ))}
                </ul>
              </section>

              <footer>
                <span>Scan for schedule, maps, guest links, and host contact.</span>
              </footer>
            </article>
          );
        })}
      </section>
    </main>
  );
}
