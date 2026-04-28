"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BadgeList } from "@/components/BadgeList";
import { ProgressBar } from "@/components/ProgressBar";
import { markers } from "@/lib/markers";
import { getQuestStatuses, getZoneProgress, TOTAL_MARKERS } from "@/lib/game";
import {
  getLocalScanLog,
  getLocalScannedMarkers,
  getOrCreatePlayerId,
  hasSavedProgress,
  mergeLocalScannedMarkers,
  shouldPromptSaveProgress
} from "@/lib/localPlayer";

export function ProgressDashboard() {
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [recent, setRecent] = useState(getLocalScanLog());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const playerId = getOrCreatePlayerId();
    setFoundIds(getLocalScannedMarkers());
    setRecent(getLocalScanLog());
    setSaved(hasSavedProgress());

    fetch(`/api/progress?player_id=${encodeURIComponent(playerId)}`)
      .then((response) => response.json())
      .then((data: { ok?: boolean; marker_ids?: string[] }) => {
        if (data.ok && data.marker_ids?.length) {
          setFoundIds(mergeLocalScannedMarkers(data.marker_ids));
          setRecent(getLocalScanLog());
        }
      })
      .catch(() => {
        // Local progress still works if the server is offline.
      });
  }, []);

  const zoneProgress = useMemo(() => getZoneProgress(foundIds), [foundIds]);
  const quests = useMemo(() => getQuestStatuses(foundIds), [foundIds]);
  const foundMarkers = markers.filter((marker) => foundIds.includes(marker.marker_id));
  const promptSave = shouldPromptSaveProgress() && !saved;

  return (
    <div className="stack">
      <section className="hero-card">
        <p className="eyebrow">My progress</p>
        <h1>
          {foundIds.length === TOTAL_MARKERS
            ? "You finished Famous Land."
            : `${foundIds.length} of ${TOTAL_MARKERS} markers found`}
        </h1>
        <p>
          {foundIds.length === 0
            ? "Scan a tree marker to begin. No login needed."
            : "Keep finding markers, filling zones, and unlocking summer badges."}
        </p>
        <ProgressBar current={foundIds.length} total={TOTAL_MARKERS} />
      </section>

      {promptSave ? (
        <section className="save-callout">
          <p className="eyebrow">Save your progress</p>
          <h2>You found at least 5 markers. Want to save your progress for the summer?</h2>
          <p>
            Save by email so you can recover your quest if you switch phones, clear your
            browser, or come back later.
          </p>
          <Link className="button primary" href="/save-progress">
            Save my progress
          </Link>
        </section>
      ) : null}

      <section className="card">
        <div className="split">
          <h2>Zone progress</h2>
          <Link href="/quests">See quests</Link>
        </div>
        <div className="zone-list">
          {zoneProgress.map((zone) => (
            <div key={zone.zone}>
              <div className="split">
                <strong>{zone.zone}</strong>
                <span>
                  {zone.current}/{zone.total}
                </span>
              </div>
              <ProgressBar current={zone.current} total={zone.total} />
            </div>
          ))}
        </div>
      </section>

      <BadgeList foundIds={foundIds} />

      <section className="card">
        <h2>Recent finds</h2>
        {recent.length === 0 ? (
          <p className="muted">No scans on this device yet.</p>
        ) : (
          <ol className="recent-list">
            {recent.slice(0, 8).map((entry) => {
              const marker = markers.find((item) => item.marker_id === entry.marker_id);
              return (
                <li key={`${entry.marker_id}-${entry.scanned_at}`}>
                  <strong>{marker?.marker_name ?? entry.marker_id}</strong>
                  <span>
                    {marker ? `Marker ${String(marker.marker_number).padStart(2, "0")}` : ""}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className="card">
        <h2>Found marker list</h2>
        {foundMarkers.length === 0 ? (
          <p className="muted">Markers will appear here as you scan them.</p>
        ) : (
          <div className="marker-list">
            {foundMarkers.map((marker) => (
              <Link href={`/${marker.short_code}`} key={marker.marker_id}>
                <span>{String(marker.marker_number).padStart(2, "0")}</span>
                <strong>{marker.marker_name}</strong>
                <small>{marker.zone}</small>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>New phone?</h2>
        <p>
          If you saved your progress before, you can recover it here. Email is optional and
          only used for progress recovery.
        </p>
        <div className="button-row">
          <Link className="button secondary" href="/recover">
            Recover progress
          </Link>
          <Link className="button primary" href="/quests">
            See all quests
          </Link>
        </div>
      </section>
    </div>
  );
}
