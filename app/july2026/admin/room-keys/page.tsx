import type { Metadata } from "next";
import { guestAssignments } from "../../data";
import styles from "./room-keys.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Room Key Sheet | famous.land",
  description: "Print-friendly July 2026 room-key links and QR codes.",
  robots: {
    index: false,
    follow: false
  }
};

export default function July2026RoomKeysPage() {
  const baseUrl = "https://famous.land";

  return (
    <main className={styles.sheet}>
      <header className={styles.header}>
        <div>
          <p>famous.land guest operations</p>
          <h1>July 4th, 2026 Room Keys</h1>
          <span>Print sheet for host check-in, room help, and QR-based guest sharing.</span>
        </div>
        <nav aria-label="Admin links">
          <a href="/july2026/admin">Admin</a>
          <a href="/july2026/admin/sms-packets">SMS packets</a>
        </nav>
      </header>

      <section className={styles.summary} aria-label="Host instructions">
        <div>
          <strong>Host text line</strong>
          <span>781-929-4932</span>
        </div>
        <div>
          <strong>Guest portal</strong>
          <span>{baseUrl}/july2026</span>
        </div>
        <div>
          <strong>Print note</strong>
          <span>Tokenized SMS links remain in admin; this sheet uses stable guest URLs.</span>
        </div>
      </section>

      <section className={styles.grid} aria-label="Printable guest room keys">
        {guestAssignments.map((guest) => {
          const assignment =
            guest.house === "Pending" ? "Assignment pending" : `${guest.house} / ${guest.room}`;
          const guestUrl = `${baseUrl}/july2026/guest/${guest.slug}`;
          const qrUrl = `/july2026/guest/${guest.slug}/qr.svg`;

          return (
            <article className={guest.house === "Pending" ? styles.pendingCard : styles.card} key={guest.slug}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>{guest.name}</h2>
                  <p>{assignment}</p>
                </div>
                <img src={qrUrl} alt={`${guest.name} room-key QR code`} />
              </div>
              <dl>
                <div>
                  <dt>Arrival</dt>
                  <dd>{guest.arrival}</dd>
                </div>
                <div>
                  <dt>Departure</dt>
                  <dd>{guest.departure}</dd>
                </div>
                <div>
                  <dt>Companions</dt>
                  <dd>{guest.companions.length ? guest.companions.join(", ") : "Solo room assignment"}</dd>
                </div>
                <div>
                  <dt>Room key</dt>
                  <dd>{guestUrl}</dd>
                </div>
              </dl>
              <p>{guest.note}</p>
            </article>
          );
        })}
      </section>
    </main>
  );
}
