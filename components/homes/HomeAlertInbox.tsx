"use client";

import Link from "next/link";
import { useState } from "react";
import type { PortfolioHomeAlert } from "@/lib/property-ops";
import styles from "./homes.module.css";

type ApiResult = {
  ok?: boolean;
  error?: { message?: string };
};

export function HomeAlertInbox({ initialAlerts }: { initialAlerts: PortfolioHomeAlert[] }) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function acknowledge(alertId: string) {
    setPending(alertId);
    setError("");
    try {
      const response = await fetch(`/api/homes/alerts/${encodeURIComponent(alertId)}/acknowledge`, {
        method: "POST",
        credentials: "same-origin"
      });
      const result = (await response.json().catch(() => null)) as ApiResult | null;
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error?.message || "The alert could not be acknowledged.");
      }
      setAlerts((current) =>
        current.map((alert) =>
          alert.id === alertId
            ? {
                ...alert,
                status: "acknowledged",
                acknowledgedAt: new Date().toISOString()
              }
            : alert
        )
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The alert could not be acknowledged.");
    } finally {
      setPending(null);
    }
  }

  return (
    <section className={styles.alertInbox} aria-labelledby="home-alert-inbox-title">
      <header className={styles.alertInboxHeader}>
        <div>
          <p className={styles.operatorEyebrow}>Home alerts</p>
          <h2 id="home-alert-inbox-title">
            {alerts.length ? `${alerts.length} ${alerts.length === 1 ? "issue" : "issues"} need attention` : "All homes are clear"}
          </h2>
          <p>
            {alerts.length
              ? "Current equipment and connection issues across the property portfolio."
              : "No unresolved equipment alerts have been reported."}
          </p>
        </div>
        <span className={`${styles.alertCountBadge} ${alerts.length ? styles.alertCountActive : ""}`}>
          {alerts.length}
        </span>
      </header>

      {error ? <p className={styles.errorNotice} role="alert">{error}</p> : null}

      {alerts.length ? (
        <div className={styles.alertInboxList}>
          {alerts.map((alert) => (
            <article className={styles.alertInboxRow} key={alert.id}>
              <span
                className={`${styles.alertSeverity} ${
                  alert.severity === "critical" ? styles.alertCritical : styles.alertWarning
                }`}
              >
                {alert.severity === "critical" ? "Urgent" : "Check"}
              </span>
              <div className={styles.alertInboxCopy}>
                <div className={styles.alertInboxHome}>
                  <strong>{alert.homeName}</strong>
                  <span>{alert.homeCode} · {providerLabel(alert.provider)} · {alert.deviceName}</span>
                </div>
                <h3>{alert.title}</h3>
                <p>{alert.description}</p>
                <span>
                  First seen {formatDateTime(alert.openedAt)} · Last checked {formatDateTime(alert.lastObservedAt)}
                </span>
              </div>
              <div className={styles.alertInboxActions}>
                {alert.status === "acknowledged" ? (
                  <span className={styles.acknowledgedLabel}>Acknowledged</span>
                ) : (
                  <button
                    className={styles.secondaryLink}
                    disabled={pending !== null}
                    onClick={() => acknowledge(alert.id)}
                    type="button"
                  >
                    {pending === alert.id ? "Saving…" : "Acknowledge"}
                  </button>
                )}
                <Link
                  className={styles.primaryLink}
                  href={`/homes/manage/${encodeURIComponent(alert.homeId)}#activity`}
                >
                  View home
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.alertInboxClear}>
          <strong>No action needed</strong>
          <span>New equipment alerts will appear here automatically.</span>
        </div>
      )}
    </section>
  );
}

function providerLabel(provider: PortfolioHomeAlert["provider"]) {
  return provider === "mopeka" ? "Mopeka" : "EcoNet";
}

function formatDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York"
  }).format(parsed);
}
