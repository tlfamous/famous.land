import Link from "next/link";
import type { HomeSummary, PortfolioHomeAlert } from "@/lib/property-ops";
import { HomeAlertInbox } from "./HomeAlertInbox";
import styles from "./homes.module.css";

export function HomesDashboard({
  homes,
  alerts
}: {
  homes: HomeSummary[];
  alerts: PortfolioHomeAlert[];
}) {
  return (
    <div className={styles.dashboard}>
      <header className={styles.dashboardHeader}>
        <div>
          <p className={styles.operatorEyebrow}>Owner workspace</p>
          <h1>Your lake houses</h1>
          <p>Printable house manuals and live door-lock status for all three homes.</p>
        </div>
        <div className={styles.dashboardHeaderActions}>
          <Link className={styles.secondaryLink} href="/homes/purchases">Purchases</Link>
          <div className={styles.portfolioStat}>
            <strong>{homes.filter((home) => home.isPublic).length}</strong>
            <span>guides live</span>
          </div>
        </div>
      </header>

      <HomeAlertInbox initialAlerts={alerts} />

      <div className={styles.homeGrid}>
        {homes.map((home) => (
          <article className={styles.homeCard} key={home.id}>
            <div className={styles.homeCardTopline}>
              <span className={styles.lhBadge}>{home.lhCode}</span>
              <span className={`${styles.statusPill} ${statusClass(home)}`}>
                {home.isPublic ? "Guide live" : rentalLabel(home.rentalState)}
              </span>
            </div>
            <div>
              <h2>{home.publicName}</h2>
              <p>{home.description || "Add a private description for this home."}</p>
            </div>
            <dl className={styles.homeFacts}>
              <div>
                <dt>Instructions updated</dt>
                <dd>{home.lastGuideUpdatedAt ? formatDate(home.lastGuideUpdatedAt) : "No draft"}</dd>
              </div>
              <div>
                <dt>Door lock</dt>
                <dd>{formatLockSummary(home)}</dd>
              </div>
            </dl>
            <div className={styles.homeCardActions}>
              <Link className={styles.primaryLink} href={`/homes/manage/${home.id}`}>
                Manage home
              </Link>
              {home.isPublic && home.slug ? (
                <Link className={styles.secondaryLink} href={`/homes/${home.slug}`} target="_blank">
                  View guide
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function rentalLabel(state: HomeSummary["rentalState"]) {
  if (state === "active") return "Rental · draft";
  if (state === "paused") return "Rental paused";
  if (state === "private") return "Private home";
  return "Setup needed";
}

function statusClass(home: HomeSummary) {
  if (home.isPublic) return styles.statusLive;
  return styles.statusMuted;
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York"
  }).format(parsed);
}

function formatLockSummary(home: HomeSummary) {
  if (!home.locks.length) return "Not connected";
  const lock = home.locks[0];
  const state = lock.online
    ? lock.lockState === "locked"
      ? "Locked"
      : lock.lockState === "unlocked"
        ? "Unlocked"
        : "State unknown"
    : "Offline";
  return `${state}${lock.batteryLevel === undefined ? "" : ` · ${Math.round(lock.batteryLevel)}%`}`;
}
