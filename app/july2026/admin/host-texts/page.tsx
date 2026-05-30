import type { Metadata } from "next";
import { hostBroadcastMessages } from "../../data";
import styles from "./host-texts.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Host Text Templates | famous.land",
  description: "Print-friendly July 2026 host broadcast text templates for guest operations.",
  robots: {
    index: false,
    follow: false
  }
};

export default function July2026HostTextsPage() {
  return (
    <main className={`${styles.sheet} july-2026-app`}>
      <header className={styles.header}>
        <div>
          <p>famous.land host operations</p>
          <h1>Host Text Templates</h1>
          <span>
            Copy-ready day-of messages for arrival, house movement, lake approvals, meals,
            fireworks, and guest help.
          </span>
        </div>
        <nav aria-label="Admin links">
          <a href="/july2026/admin">Admin</a>
          <a href="/july2026/admin/sms-packets">SMS packets</a>
          <a href="/july2026/admin/briefing-sheet">Briefing</a>
          <a href="/july2026/admin/room-keys">Room keys</a>
        </nav>
      </header>

      <section className={styles.summary} aria-label="Host text notes">
        <article>
          <strong>Message count</strong>
          <span>{hostBroadcastMessages.length} templates</span>
        </article>
        <article>
          <strong>Host line</strong>
          <span>781-929-4932</span>
        </article>
        <article>
          <strong>Use</strong>
          <span>Copy, paste, and adjust timing or guest names before sending.</span>
        </article>
      </section>

      <section className={styles.grid} aria-label="Host broadcast text templates">
        {hostBroadcastMessages.map((message) => (
          <article className={styles.card} key={message.label}>
            <div className={styles.cardHeader}>
              <div>
                <span>{message.timing}</span>
                <h2>{message.label}</h2>
              </div>
              <strong>{message.audience}</strong>
            </div>
            <pre>{message.body}</pre>
          </article>
        ))}
      </section>
    </main>
  );
}
