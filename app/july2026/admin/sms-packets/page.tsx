import type { Metadata } from "next";
import { getGuestQrPath, getGuestSmsPacket, guestAssignments } from "../../data";
import styles from "./sms-packets.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Guest SMS Packets | famous.land",
  description: "Print-friendly review sheet for July 2026 guest room-key SMS packets.",
  robots: {
    index: false,
    follow: false
  }
};

export default function July2026SmsPacketsPage() {
  const baseUrl = "https://famous.land";

  return (
    <main className={`${styles.sheet} july-2026-app`}>
      <header className={styles.header}>
        <div>
          <p>famous.land guest outreach</p>
          <h1>Guest SMS Packets</h1>
          <span>Review-ready messages for sending each guest their July 4th, 2026 room key and weekend links.</span>
        </div>
        <nav aria-label="Admin links">
          <a href="/july2026/admin">Admin</a>
          <a href="/july2026/admin/room-keys">Room keys</a>
          <a href="/july2026/admin/host-texts">Host texts</a>
          <a href="/july2026/admin/briefing-sheet">Briefing</a>
        </nav>
      </header>

      <section className={styles.summary} aria-label="SMS packet notes">
        <article>
          <strong>Guest count</strong>
          <span>{guestAssignments.length} messages</span>
        </article>
        <article>
          <strong>Host line</strong>
          <span>781-929-4932</span>
        </article>
        <article>
          <strong>Token note</strong>
          <span>Use admin for fresh tokenized links; this sheet uses stable guest URLs for review.</span>
        </article>
      </section>

      <section className={styles.grid} aria-label="Guest SMS packet review">
        {guestAssignments.map((guest) => {
          const path = `/july2026/guest/${guest.slug}`;
          const qrPath = getGuestQrPath(guest, path);
          const message = getGuestSmsPacket(guest, path, baseUrl);
          const assignment =
            guest.house === "Pending" ? "Assignment pending" : `${guest.house} / ${guest.room}`;

          return (
            <article className={guest.house === "Pending" ? styles.pendingCard : styles.card} key={guest.slug}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>{guest.name}</h2>
                  <p>{assignment}</p>
                </div>
                <img src={qrPath} alt={`${guest.name} room-key QR code`} />
              </div>
              <a className={styles.smsLink} href={`sms:+17819294932?&body=${encodeURIComponent(message)}`}>
                Open SMS Draft
              </a>
              <pre>{message}</pre>
            </article>
          );
        })}
      </section>
    </main>
  );
}
