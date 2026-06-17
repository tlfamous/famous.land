"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FinalPrizeWinNotice } from "@/components/FinalPrizeWinNotice";
import { ZoneDashboardMap } from "@/components/InteractiveLandMap";
import { ProgressBar } from "@/components/ProgressBar";
import { markers } from "@/lib/markers";
import { getZoneQuestStatuses, TOTAL_MARKERS, uniqueFoundIds } from "@/lib/game";
import {
  getLocalScannedMarkers,
  getOrCreatePlayerId,
  hasSavedProgress,
  mergeLocalScannedMarkers
} from "@/lib/localPlayer";
import { TESTER_SCAN_SOURCE } from "@/lib/testerMode";

function testerHref(path: string) {
  return `${path}?scan_source=${TESTER_SCAN_SOURCE}`;
}

export function FamousLandQuestDashboard() {
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [isTestMode, setIsTestMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  useEffect(() => {
    const playerId = getOrCreatePlayerId();
    const isTesterMode =
      new URLSearchParams(window.location.search).get("scan_source") === TESTER_SCAN_SOURCE;
    const progressUrl = new URL("/api/progress", window.location.origin);
    progressUrl.searchParams.set("player_id", playerId);

    if (isTesterMode) {
      progressUrl.searchParams.set("scan_source", TESTER_SCAN_SOURCE);
    }

    setIsTestMode(isTesterMode);
    setFoundIds(getLocalScannedMarkers());
    setSaved(hasSavedProgress());

    fetch(progressUrl.toString())
      .then((response) => response.json())
      .then((data: { ok?: boolean; marker_ids?: string[] }) => {
        if (data.ok && data.marker_ids?.length) {
          setFoundIds(mergeLocalScannedMarkers(data.marker_ids));
        }
      })
      .catch(() => {
        // Local progress still works if the server is offline.
      });
  }, []);

  const zoneQuests = useMemo(() => getZoneQuestStatuses(foundIds), [foundIds]);
  const foundCount = uniqueFoundIds(foundIds).length;
  const finalPrizeUnlocked = foundCount >= TOTAL_MARKERS;
  const foundMarkers = markers
    .filter((marker) => foundIds.includes(marker.marker_id))
    .sort((a, b) => a.order - b.order);
  const promptSave = foundCount >= 5 && !saved;
  const saveProgressHref = isTestMode ? testerHref("/save-progress") : "/save-progress";
  const selectedZoneQuest = zoneQuests.find((quest) => quest.id === selectedZoneId);

  if (selectedZoneQuest) {
    return (
      <div className="zone-map-screen">
        <div className="zone-map-screen-toolbar">
          <button
            className="button secondary"
            onClick={() => setSelectedZoneId(null)}
            type="button"
          >
            Back
          </button>
          <div>
            <h1>{selectedZoneQuest.zoneLabel}</h1>
            <p>
              {selectedZoneQuest.current} of {selectedZoneQuest.total} markers found
            </p>
          </div>
        </div>
        <div className="zone-map-screen-canvas" aria-label={`${selectedZoneQuest.zoneLabel} map`}>
          <ZoneDashboardMap zone={selectedZoneQuest.zone} />
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <section className="hero-card">
        <p className="eyebrow">Famous Land Quest</p>
        <h1>
          {finalPrizeUnlocked
            ? "You finished the Famous Land Quest."
            : `${foundCount} of ${TOTAL_MARKERS} markers found`}
        </h1>
        <p>
          {foundCount === 0
            ? "Scan a tree marker to begin. No login needed."
            : finalPrizeUnlocked
              ? "All markers are found. Something special is ready."
              : "Keep finding markers and finishing all four zones."}
        </p>
        <ProgressBar current={foundCount} total={TOTAL_MARKERS} />
      </section>

      {finalPrizeUnlocked ? <FinalPrizeWinNotice /> : null}

      {promptSave ? (
        <section className="save-callout">
          <p className="eyebrow">Save your progress</p>
          <h2>You found at least 5 markers. Want to save your Famous Land Quest progress?</h2>
          <p>
            Save by email so you can recover your quest if you switch phones, clear your
            browser, or come back later.
          </p>
          <Link className="button primary" href={saveProgressHref}>
            Save my progress
          </Link>
        </section>
      ) : null}

      <section className="card">
        <h2>Zones</h2>
        <div className="quest-progress-list">
          {zoneQuests.map((quest) => (
            <div
              className="quest-progress-row"
              key={quest.id}
            >
              <div className="split">
                <div>
                  <strong>{quest.title}</strong>
                  <small>{quest.total} markers</small>
                </div>
                <div className="zone-progress-actions">
                  <span>
                    {quest.current}/{quest.total}
                  </span>
                  <button
                    className="button secondary compact-button zone-map-button"
                    onClick={() => setSelectedZoneId(quest.id)}
                    type="button"
                  >
                    Map
                  </button>
                </div>
              </div>
              <ProgressBar current={quest.current} total={quest.total} />
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Found marker list</h2>
        {foundMarkers.length === 0 ? (
          <p className="muted">Markers will appear here as you scan them.</p>
        ) : (
          <div className="marker-list">
            {foundMarkers.map((marker) => (
              <Link
                href={isTestMode ? testerHref(`/${marker.short_code}`) : `/${marker.short_code}`}
                key={marker.marker_id}
              >
                <span>{String(marker.marker_number).padStart(2, "0")}</span>
                <strong>{marker.marker_name}</strong>
                <small>{marker.zone}</small>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
