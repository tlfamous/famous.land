"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  AirbnbListingCaptureInput,
  GuideSectionInput,
  GuidePreview,
  HomeActivityEvent,
  HomeManagementView,
  PrintValidation
} from "@/lib/property-ops";
import { EquipmentMonitoring } from "./EquipmentMonitoring";
import { GuideRenderer, type RenderedGuide } from "./GuideRenderer";
import styles from "./homes.module.css";

type ApiResult<T = unknown> = {
  ok?: boolean;
  data?: T;
  error?: { code?: string; message?: string };
};

const requiredGuideTypes: GuideSectionInput["sectionType"][] = [
  "boundaries", "policies", "help", "wifi", "waste", "food", "lake_safety", "checkout"
];
export function HomesManager({
  initialView,
  initialGuidePreview
}: {
  initialView: HomeManagementView;
  initialGuidePreview: GuidePreview;
}) {
  const router = useRouter();
  const [sections] = useState<GuideSectionInput[]>(() =>
    initialView.guideSections.map(toSectionInput)
  );
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [eeroLogin, setEeroLogin] = useState("");
  const [eeroCode, setEeroCode] = useState("");
  const [eeroNetworks, setEeroNetworks] = useState<{ id: string; name: string }[]>([]);
  const [printValidation] = useState<PrintValidation | null>({
    pageCount: 2,
    minimumFontPt: 9,
    hasOverflow: false,
    checkedAt: new Date().toISOString()
  });
  const lockTimeline = useMemo(
    () => buildLockTimeline(initialView.activityEvents, initialView.home.timezone),
    [initialView.home.timezone, initialView.activityEvents]
  );

  const previewGuide = useMemo<RenderedGuide>(
    () => ({
      publicName: initialView.home.publicName,
      slug: initialView.home.slug || "draft-guide",
      publishedAt: initialView.publishedGuide?.publishedAt,
      media: initialGuidePreview.media.map((media) => ({
        id: media.id,
        title: media.title,
        altText: media.altText,
        src: `/api/homes/media/${encodeURIComponent(media.id)}/file`
      })),
      sections: sections.map((section) => ({
        id: section.id,
        type: section.sectionType,
        title: section.title,
        body: section.body,
        position: section.displayOrder,
        wifi: initialGuidePreview.sections.find(
          (previewSection) => previewSection.id === section.id
        )?.wifi
      }))
    }),
    [initialGuidePreview.media, initialGuidePreview.sections, initialView.home.publicName, initialView.home.slug, initialView.publishedGuide, sections]
  );

  const canonicalUrl = initialView.home.slug
    ? `https://famous.land/homes/${initialView.home.slug}`
    : "https://famous.land/homes/your-home";
  const publishBlockReason =
    initialView.home.rentalState !== "active"
      ? "Mark this home as an active rental before publishing."
      : !initialView.home.slug
        ? "Save a permanent public slug before publishing."
        : !initialView.wifiConfigured
          ? "Configure encrypted Wi-Fi credentials before publishing."
          : !isCompleteGuide(sections)
              ? "Complete the standard guide sections, including two checkout sections."
              : printValidation === null
                ? "Wait for the Letter print check to finish."
                : printValidation.hasOverflow || printValidation.pageCount !== 2
                  ? "Shorten the guide until it fits on two Letter sides."
                  : printValidation.minimumFontPt < 9
                    ? "Increase the guide text to at least 9 points."
                  : undefined;

  async function mutate<T>(key: string, url: string, init: RequestInit, success: string) {
    setPending(key);
    setNotice("");
    setError("");

    try {
      const response = await fetch(url, {
        ...init,
        credentials: "same-origin",
        headers: { "content-type": "application/json", ...init.headers }
      });
      const result = (await response.json().catch(() => null)) as ApiResult<T> | null;
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error?.message || "The change could not be saved.");
      }
      setNotice(success);
      router.refresh();
      return result.data;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The change could not be saved.");
      return undefined;
    } finally {
      setPending(null);
    }
  }

  async function publishGuide() {
    if (
      !printValidation ||
      printValidation.hasOverflow ||
      printValidation.pageCount !== 2 ||
      printValidation.minimumFontPt < 9
    ) return;
    await mutate(
      "publish",
      `/api/homes/${initialView.home.id}/publish`,
      {
        method: "POST",
        body: JSON.stringify({
          printValidation
        })
      },
      "The latest draft is now live."
    );
  }

  return (
    <div className={styles.manager}>
      <header className={styles.managerHeader}>
        <div>
          <Link className={styles.backLink} href="/homes">
            ← All homes
          </Link>
          <p className={styles.operatorEyebrow}>{initialView.home.lhCode} · Owner workspace</p>
          <h1>{initialView.home.publicName}</h1>
          <p>{initialView.home.address || "No address saved"}</p>
        </div>
        <div className={styles.managerHeaderActions}>
          <span className={initialView.home.isPublic ? styles.liveBadge : styles.draftBadge}>
            {initialView.home.isPublic ? "Guide live" : "Not public"}
          </span>
          <Link className={styles.secondaryLink} href={`/homes/manage/${initialView.home.id}/preview`}>
            Full preview
          </Link>
          {initialView.home.isPublic && initialView.home.slug ? (
            <Link className={styles.primaryLink} href={`/homes/${initialView.home.slug}`} target="_blank">
              Open public guide
            </Link>
          ) : null}
        </div>
      </header>

      {notice ? <p className={styles.successNotice} role="status">{notice}</p> : null}
      {error ? <p className={styles.errorNotice} role="alert">{error}</p> : null}

      <nav className={styles.sectionNav} aria-label="Home management sections">
        <a href="#instructions">Instructions</a>
        <a href="#activity">Activity</a>
        <a href="#airbnb">Airbnb</a>
      </nav>

      <section className={styles.managerSection} id="instructions">
        <SectionHeading
          eyebrow="Two-sided printable manual"
          title="House manual"
          copy="Front: instructions. Back: frequently asked questions. Use Print instructions to print both Letter sides or save a two-page PDF."
        />
        <GuideRenderer canonicalUrl={canonicalUrl} guide={previewGuide} />

        <div className={styles.publishBar}>
          <div>
            <strong>Manual actions</strong>
            <span>{publishBlockReason ?? "Ready to publish the latest two-sided manual."}</span>
          </div>
          <div>
            {initialView.proofDocumentUrl ? (
              <a
                className={styles.secondaryLink}
                href={initialView.proofDocumentUrl}
                rel="noreferrer"
                target="_blank"
              >
                Edit in Proof
              </a>
            ) : (
              <button
                className={styles.secondaryLink}
                disabled={pending !== null}
                onClick={() =>
                  mutate<string>(
                    "proof-document",
                    `/api/homes/${initialView.home.id}/proof-document`,
                    { method: "POST", body: "{}" },
                    "Proof editing document created."
                  ).then((url) => {
                    if (url) window.open(url, "_blank", "noopener,noreferrer");
                  })
                }
                type="button"
              >
                {pending === "proof-document" ? "Creating Proof…" : "Create Proof editor"}
              </button>
            )}
            {initialView.home.isPublic ? (
              <button
                className={styles.dangerButton}
                disabled={pending !== null}
                onClick={() =>
                  mutate(
                    "unpublish",
                    `/api/homes/${initialView.home.id}/unpublish`,
                    { method: "POST", body: "{}" },
                    "The public guide has been unpublished."
                  )
                }
                type="button"
              >
                {pending === "unpublish" ? "Unpublishing…" : "Unpublish"}
              </button>
            ) : null}
            <button
              className={styles.publishButton}
              disabled={pending !== null || Boolean(publishBlockReason)}
              onClick={publishGuide}
              title={publishBlockReason}
              type="button"
            >
              {pending === "publish" ? "Publishing…" : initialView.home.isPublic ? "Publish update" : "Publish guide"}
            </button>
          </div>
        </div>
      </section>

      <section className={styles.managerSection} id="activity">
        <div className={styles.lockSectionHeader}>
          <SectionHeading
            eyebrow="Live systems"
            title="House activity"
            copy="Read-only equipment, lock, and guest-network status in one home timeline."
          />
          <button
            className={styles.refreshLocksButton}
            disabled={pending !== null}
            onClick={() =>
              mutate(
                "sync-locks",
                "/api/homes/locks/sync",
                { method: "POST", body: "{}" },
                "Lock status and activity refreshed from Seam."
              )
            }
            type="button"
          >
            {pending === "sync-locks" ? "Refreshing…" : "Refresh from Seam"}
          </button>
        </div>

        <EquipmentMonitoring
          alerts={initialView.alerts}
          homeId={initialView.home.id}
          integrations={initialView.integrations}
          readings={initialView.equipmentReadings}
          timezone={initialView.home.timezone}
        />

        {initialView.locks.length ? (
          <div className={styles.lockGrid}>
            {initialView.locks.map((lock) => (
              <article className={styles.lockCard} key={lock.id}>
                <div className={styles.lockCardTopline}>
                  <div>
                    <span className={styles.lockProvider}>{lock.provider}</span>
                    <h3>{lock.displayName}</h3>
                    <p>{lock.model || "Smart lock"}</p>
                  </div>
                  <span
                    className={`${styles.lockState} ${
                      !lock.online
                        ? styles.lockOffline
                        : lock.lockState === "locked"
                          ? styles.lockLocked
                          : lock.lockState === "unlocked"
                            ? styles.lockUnlocked
                            : styles.lockUnknown
                    }`}
                  >
                    {!lock.online ? "Offline" : lock.lockState === "unknown" ? "Unknown" : lock.lockState}
                  </span>
                </div>
                <dl className={styles.lockFacts}>
                  <div><dt>Connection</dt><dd>{lock.online ? "Online" : "Offline"}</dd></div>
                  <div><dt>Battery</dt><dd>{lock.batteryLevel === undefined ? "Unknown" : `${Math.round(lock.batteryLevel)}%`}</dd></div>
                  <div><dt>Entry events</dt><dd>{lock.hasNativeEntryEvents ? "Supported" : "Unavailable"}</dd></div>
                  <div><dt>Last sync</dt><dd>{formatDateTime(lock.lastSyncedAt)}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No lock connected" copy="Connect and map the lock in Seam, then refresh this page." />
        )}

        {initialView.home.id === "home_lh3" ? (
          <div className={styles.eeroCard}>
            <div>
              <p className={styles.operatorEyebrow}>Eero network monitoring</p>
              <h3>{initialView.networkIntegration?.status === "connected" ? `Connected${initialView.networkIntegration.networkName ? ` · ${initialView.networkIntegration.networkName}` : ""}` : "Not connected"}</h3>
              <p>{initialView.networkIntegration?.lastSyncedAt ? `Guest network last checked ${formatDateTime(initialView.networkIntegration.lastSyncedAt)}.` : "Connect Eero to add observed guest-device joins and departures."}</p>
              {initialView.networkIntegration?.status === "needs_reauthorization" ? <p className={styles.errorNotice}>Eero needs to be connected again.</p> : null}
            </div>
            {initialView.networkIntegration?.status === "connected" ? (
              <button className={styles.refreshLocksButton} disabled={pending !== null} onClick={() => mutate("sync-eero", `/api/homes/${initialView.home.id}/eero/sync`, { method: "POST", body: "{}" }, "Eero activity refreshed.")} type="button">{pending === "sync-eero" ? "Refreshing…" : "Refresh Eero"}</button>
            ) : eeroNetworks.length ? (
              <div className={styles.eeroControls}>{eeroNetworks.map((network) => <button className={styles.secondaryLink} disabled={pending !== null} key={network.id} onClick={() => mutate("select-eero", `/api/homes/${initialView.home.id}/eero/select-network`, { method: "POST", body: JSON.stringify({ networkId: network.id }) }, "Eero connected. The first refresh establishes a quiet baseline.")} type="button">Use {network.name}</button>)}</div>
            ) : initialView.networkIntegration?.status === "verification_pending" ? (
              <div className={styles.eeroControls}><input aria-label="Eero verification code" onChange={(event) => setEeroCode(event.target.value)} placeholder="Verification code, if needed" value={eeroCode} /><button className={styles.refreshLocksButton} disabled={pending !== null} onClick={async () => { const data = await mutate<{ networks: { id: string; name: string }[] }>("verify-eero", `/api/homes/${initialView.home.id}/eero/verify`, { method: "POST", body: JSON.stringify({ code: eeroCode }) }, "Choose the Eero network to monitor."); if (data?.networks) setEeroNetworks(data.networks); }} type="button">Continue setup</button></div>
            ) : (
              <div className={styles.eeroControls}><input aria-label="Eero account email or phone" onChange={(event) => setEeroLogin(event.target.value)} placeholder="Eero email or phone" value={eeroLogin} /><button className={styles.refreshLocksButton} disabled={pending !== null || !eeroLogin.trim()} onClick={() => mutate("connect-eero", `/api/homes/${initialView.home.id}/eero/connect`, { method: "POST", body: JSON.stringify({ login: eeroLogin }) }, "Eero sent a verification code.")} type="button">Connect Eero</button></div>
            )}
          </div>
        ) : null}

        <div className={styles.lockActivity}>
          <div className={styles.lockActivityHeader}>
            <div>
              <p className={styles.operatorEyebrow}>Recent activity</p>
              <h3>14-day house timeline</h3>
            </div>
            <span>{lockTimeline.eventCount} events</span>
          </div>
          {lockTimeline.eventCount ? (
            <div className={styles.lockTimeline} role="group" aria-label="House activity for the past 14 days">
              {lockTimeline.days.map((day) => (
                <section className={`${styles.lockTimelineDay} ${day.isToday ? styles.lockTimelineToday : ""}`} key={day.key}>
                  <header>
                    <span>{day.weekday}</span>
                    <strong>{day.day}</strong>
                  </header>
                  <div className={styles.lockTimelineRail} aria-hidden="true" />
                  <ol>
                    {day.events.map((event) => (
                      <li key={event.id}>
                        <span
                          className={`${styles.lockEventIcon} ${
                            event.source === "eero"
                              ? styles.lockEvent_network
                              : event.source === "mopeka" || event.source === "econet"
                                ? styles.lockEvent_equipment
                                : styles[`lockEvent_${event.eventType.replaceAll(".", "_")}`] ?? ""
                          }`}
                          aria-hidden="true"
                        />
                        <span className={styles.lockTimelineTime}>{formatEventTime(event.occurredAt, initialView.home.timezone)}</span>
                        <span className={styles.lockTimelineEvent} title={event.description || lockEventLabel(event.eventType)}>
                          {event.deviceName ? `${lockEventLabel(event.eventType)} · ${event.deviceName}` : lockEventLabel(event.eventType)}
                        </span>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          ) : (
            <p className={styles.lockEmptyActivity}>
              No important home activity arrived in the past 14 days. New equipment alerts, recoveries, lock events, and observed Eero state changes will appear here automatically.
            </p>
          )}
        </div>
      </section>

      <section className={styles.managerSection} id="airbnb">
        <SectionHeading
          eyebrow="Read-only owner reference"
          title="Airbnb Listing details"
          copy="A compact snapshot of the listing details saved for this home."
        />
        <AirbnbCaptureForm initialView={initialView} mutate={mutate} pending={pending} />
      </section>
    </div>
  );

}

function AirbnbCaptureForm({ initialView, mutate, pending }: {
  initialView: HomeManagementView;
  pending: string | null;
  mutate: <T>(key: string, url: string, init: RequestInit, success: string) => Promise<T | undefined>;
}) {
  const capture = initialView.airbnbCapture;
  const refreshedAt = capture?.capturedAt;
  return (
    <>
      <div className={styles.publishBar}>
        <div>
          <strong>Listing refresh</strong>
          <span>{refreshedAt ? `Last refreshed ${formatDateTime(refreshedAt)}` : "No listing details have been refreshed yet."}</span>
        </div>
        <button
          className={styles.publishButton}
          disabled={pending !== null || !capture}
          onClick={() => {
            if (!capture) return;
            mutate(
              "airbnb-capture",
              `/api/homes/${initialView.home.id}/airbnb-capture`,
              { method: "POST", body: JSON.stringify(toAirbnbCaptureInput(capture)) },
              "Airbnb listing details refreshed."
            );
          }}
          title={capture ? "Reconfirms the saved listing snapshot. It does not sign in to or change Airbnb." : "Capture listing details before refreshing."}
          type="button"
        >
          {pending === "airbnb-capture" ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      {capture ? (
        <div className={styles.metadataGrid}>
          <article>
            <h3>{capture.listingTitle}</h3>
            <p>{capture.location || "Location not captured"}</p>
            <a href={capture.sourceUrl} rel="noreferrer" target="_blank">Open Airbnb listing editor</a>
          </article>
          <article>
            <h3>Last captured</h3>
            <p>{formatDateTime(capture.capturedAt)}</p>
            <p>{capture.propertySummary || "No property summary captured"}</p>
          </article>
          <article>
            <h3>Guest-facing settings</h3>
            <p>{[capture.availabilitySummary, capture.bookingSettings, capture.cancellationPolicy].filter(Boolean).join(" · ") || "Not captured"}</p>
          </article>
        </div>
      ) : (
        <EmptyState title="No Airbnb details yet" copy="Listing details will appear here after the first refresh." />
      )}
    </>
  );
}

function toAirbnbCaptureInput(capture: NonNullable<HomeManagementView["airbnbCapture"]>) {
  const { id: _id, homeId: _homeId, capturedAt: _capturedAt, capturedBySessionId: _capturedBySessionId, ...input } = capture;
  return input as AirbnbListingCaptureInput;
}

type MetadataAction = {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function MetadataGrid({
  items,
  empty
}: {
  items: Array<{
    id: string;
    title: string;
    detail: string;
    href?: string;
    actions?: MetadataAction[];
  }>;
  empty: string;
}) {
  if (items.length === 0) return <EmptyState title={empty} copy="Uploaded files will appear here after secure processing." />;
  return (
    <div className={styles.metadataGrid}>
      {items.map((item) => (
        <article key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.detail}</p>
          <div className={styles.metadataActions}>
            {item.href ? <a href={item.href} rel="noreferrer" target="_blank">Open reference</a> : null}
            {item.actions?.map((action) => (
              <button
                className={action.danger ? styles.textDanger : undefined}
                disabled={action.disabled}
                key={action.label}
                onClick={action.onClick}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function EmptyState({ title, copy }: { title: string; copy: string }) {
  return <div className={styles.emptyState}><strong>{title}</strong><span>{copy}</span></div>;
}

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <header className={styles.sectionHeading}><p>{eyebrow}</p><h2>{title}</h2><span>{copy}</span></header>;
}

function toSectionInput(section: HomeManagementView["guideSections"][number]): GuideSectionInput {
  return { id: section.id, sectionType: section.sectionType, title: section.title, body: section.body, displayOrder: section.displayOrder, secretRef: section.secretRef };
}

function lockEventLabel(eventType: string) {
  const labels: Record<string, string> = {
    "lock.locked": "Door locked",
    "lock.unlocked": "Door unlocked",
    "lock.access_denied": "Access denied",
    "device.connected": "Lock came online",
    "device.disconnected": "Lock went offline",
    "device.low_battery": "Low battery",
    "device.battery_status_changed": "Battery status changed",
    "device.added": "Lock connected to Seam"
    ,"network.device.connected": "Network device connected"
    ,"network.device.disconnected": "Network device disconnected"
    ,"integration.connected": "Equipment monitoring connected"
    ,"alert.opened": "Equipment alert opened"
    ,"alert.resolved": "Equipment alert cleared"
  };
  return labels[eventType] ?? eventType.replaceAll("_", " ").replaceAll(".", " · ");
}

type LockTimelineDay = {
  key: string;
  weekday: string;
  day: string;
  isToday: boolean;
  events: HomeActivityEvent[];
};

function dateKey(value: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function buildLockTimeline(
  events: HomeActivityEvent[],
  timezone: string
): { days: LockTimelineDay[]; eventCount: number } {
  const now = new Date();
  const todayKey = dateKey(now, timezone);
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(now.valueOf() - (13 - index) * 86_400_000);
    return {
      key: dateKey(date, timezone),
      weekday: new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short" }).format(date),
      day: new Intl.DateTimeFormat("en-US", { timeZone: timezone, day: "numeric" }).format(date),
      isToday: dateKey(date, timezone) === todayKey,
      events: [] as HomeActivityEvent[]
    };
  });
  const byDay = new Map(days.map((day) => [day.key, day]));
  for (const event of events) {
    const occurredAt = new Date(event.occurredAt);
    if (Number.isNaN(occurredAt.valueOf())) continue;
    byDay.get(dateKey(occurredAt, timezone))?.events.push(event);
  }
  for (const day of days) day.events.sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  return { days, eventCount: days.reduce((count, day) => count + day.events.length, 0) };
}

function formatEventTime(value: string, timezone: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return value;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit"
  }).format(parsed);
}

function formatDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }).format(parsed);
}

function isCompleteGuide(sections: GuideSectionInput[]) {
  if (sections.some((section) => !section.title.trim() || !section.body.trim())) return false;
  const present = new Set(sections.map((section) => section.sectionType));
  if (requiredGuideTypes.some((type) => !present.has(type))) return false;
  if (sections.filter((section) => section.sectionType === "checkout").length < 2) return false;
  const wifiSections = sections.filter((section) => section.sectionType === "wifi");
  return wifiSections.length === 1 && wifiSections[0].secretRef === "wifi_credentials";
}
