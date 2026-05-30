import type { Metadata } from "next";
import { guestAssignments, hostSmsHref, houseProfiles } from "../data";
import styles from "./guest-list.module.css";

export const metadata: Metadata = {
  title: "July 4th, 2026 Guest Registry | famous.land",
  description: "Guest registry, house roster, room assignments, and room-key links for the famous.land July 4th, 2026 weekend.",
  robots: {
    index: false,
    follow: false
  }
};

const houseOrder = ["LH1", "LH2", "LH3", "Pending"] as const;

export default function July2026GuestRegistryPage() {
  const assignedGuests = guestAssignments.filter((guest) => guest.house !== "Pending");
  const pendingGuests = guestAssignments.filter((guest) => guest.house === "Pending");

  return (
    <main className={`${styles.page} july-2026-app`}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>famous.land guest registry</p>
            <h1>Guest Registry</h1>
            <p>
              A clean house-by-house roster for room assignments, companions, pending
              placements, and each guest&apos;s room-key link.
            </p>
          </div>
          <nav className={styles.quickLinks} aria-label="Guest registry quick actions">
            <a href="/july2026">Guest Portal</a>
            <a href="/july2026/day-of">Day-Of Desk</a>
            <a href="/july2026/houses">House Directory</a>
            <a href="/july2026/directions">Directions Hub</a>
            <a href="/july2026/arrival-card">Arrival Card</a>
            <a href={hostSmsHref}>Text Host</a>
          </nav>
        </header>

        <section className={styles.summaryGrid} aria-label="Guest registry summary">
          <article>
            <span>Total guests</span>
            <strong>{guestAssignments.length}</strong>
            <p>Room-key pages are ready for every guest.</p>
          </article>
          <article>
            <span>Assigned</span>
            <strong>{assignedGuests.length}</strong>
            <p>Guests currently have house and room assignments.</p>
          </article>
          <article>
            <span>Pending</span>
            <strong>{pendingGuests.length}</strong>
            <p>Zach and Bee still need host-confirmed lodging details.</p>
          </article>
        </section>

        <section className={styles.registryStack} aria-label="House guest registry">
          {houseOrder.map((houseName) => {
            const guests = guestAssignments.filter((guest) => guest.house === houseName);
            const profile = houseProfiles.find((house) => house.name === houseName);
            const roomNames = Array.from(new Set(guests.map((guest) => guest.room)));

            return (
              <article className={houseName === "Pending" ? styles.pendingPanel : styles.housePanel} key={houseName}>
                <header className={styles.panelHeader}>
                  <div>
                    <span>{houseName === "Pending" ? "Host confirmation needed" : "House roster"}</span>
                    <h2>{houseName === "Pending" ? "Pending Assignments" : houseName}</h2>
                  </div>
                  <p>{profile?.role ?? "Guests awaiting final placement."}</p>
                </header>

                {profile ? (
                  <div className={styles.houseMeta}>
                    <span>{profile.note}</span>
                    <span>{profile.rooms.join(" / ")}</span>
                  </div>
                ) : (
                  <div className={styles.houseMeta}>
                    <span>Text the host before arrival for the latest lodging details.</span>
                    <span>These guests still show assignment-pending room keys.</span>
                  </div>
                )}

                <div className={styles.roomStack}>
                  {roomNames.map((roomName) => {
                    const roomGuests = guests.filter((guest) => guest.room === roomName);

                    return (
                      <section className={styles.roomCard} key={`${houseName}-${roomName}`}>
                        <div>
                          <span>{houseName === "Pending" ? "Pending" : "Room"}</span>
                          <strong>{roomName}</strong>
                        </div>
                        <div className={styles.guestRows}>
                          {roomGuests.map((guest) => (
                            <a href={`/july2026/guest/${guest.slug}`} key={guest.slug}>
                              <span>{guest.name}</span>
                              <small>
                                {guest.companions.length
                                  ? `With ${guest.companions.join(", ")}`
                                  : "Solo room assignment"}
                              </small>
                            </a>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </section>

        <section className={styles.hostPanel} aria-label="Registry host help">
          <div>
            <p className={styles.kicker}>Room help</p>
            <h2>Need a room update?</h2>
            <p>
              If a guest assignment looks wrong, pending, or stale, use the host text line
              and the admin page can regenerate a fresh room-key link.
            </p>
          </div>
          <div className={styles.hostActions}>
            <a href={hostSmsHref}>Text Host</a>
            <a href="/july2026/admin">Admin Reference</a>
            <a href="/july2026/admin/room-keys">Printable Room Keys</a>
          </div>
        </section>

        <footer className={styles.footer}>
          <span>Sponsored by famous.land</span>
          <a href="/july2026/weekend-guide.txt">Offline Guide</a>
        </footer>
      </section>
    </main>
  );
}
