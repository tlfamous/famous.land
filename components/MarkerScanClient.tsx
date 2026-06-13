"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FinalPrizeWinNotice } from "@/components/FinalPrizeWinNotice";
import { ZonePreviewMap, zoneMapSlugs } from "@/components/InteractiveLandMap";
import { ProgressBar } from "@/components/ProgressBar";
import { getZoneQuestStatuses, TOTAL_MARKERS, uniqueFoundIds } from "@/lib/game";
import {
  addLocalScannedMarker,
  getOrCreatePlayerId,
  hasSavedProgress,
  incrementLocalMarkerVisit
} from "@/lib/localPlayer";
import type { Marker } from "@/lib/types";

type ScanMoment = "loading" | "first" | "new" | "repeat";

export function MarkerScanClient({ marker }: { marker: Marker }) {
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [visitCount, setVisitCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [scanMoment, setScanMoment] = useState<ScanMoment>("loading");

  useEffect(() => {
    let cancelled = false;
    const playerId = getOrCreatePlayerId();
    const isTestScan =
      new URLSearchParams(window.location.search).get("scan_source") === "tester";

    fetch("/api/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player_id: playerId,
        marker_id: marker.marker_id,
        is_test: isTestScan
      })
    })
      .then((response) => response.json())
      .then((data: { ok?: boolean; is_new?: boolean; error?: string }) => {
        if (cancelled) return;

        if (!data.ok) {
          setServerMessage(data.error ?? "This scan was not added to your quest yet.");
          return;
        }

        const markerVisitCount = incrementLocalMarkerVisit(marker.marker_id);
        const localResult = addLocalScannedMarker(marker.marker_id);
        const nextScanMoment: ScanMoment = localResult.alreadyFound
          ? "repeat"
          : localResult.markerIds.length === 1
            ? "first"
            : "new";

        setScanMoment(nextScanMoment);
        setVisitCount(markerVisitCount);
        setFoundIds(localResult.markerIds);
        setSaved(hasSavedProgress());
      })
      .catch(() => {
        if (cancelled) return;
        setServerMessage("This scan was not added to your quest yet. Try again in a moment.");
      });

    return () => {
      cancelled = true;
    };
  }, [marker.marker_id]);

  const foundCount = uniqueFoundIds(foundIds).length;
  const finalPrizeUnlocked = foundCount >= TOTAL_MARKERS;
  const zoneQuests = useMemo(
    () => getZoneQuestStatuses(foundIds).filter((quest) => quest.zone === marker.zone),
    [foundIds, marker.zone]
  );
  const savePrompt = foundCount >= 5 && !saved;
  const visitedLabel = visitCount === 1 ? "1 time" : `${visitCount} times`;
  const activeZoneSlug = zoneMapSlugs[marker.zone];
  const foundMarkerLabel = foundCount === 1 ? "1 marker" : `${foundCount} markers`;
  const isFirstScan = scanMoment === "first";
  const foundMessage =
    isFirstScan
      ? "First scan saved. This phone is tracking your quest."
      : scanMoment === "repeat" || visitCount > 1
        ? `Welcome back to ${marker.marker_name}! You have been here ${visitedLabel}.`
        : `Welcome to ${marker.marker_name}! You have found one of the Famous Land markers.`;

  return (
    <div
      className={
        isFirstScan ? "marker-app-screen marker-page marker-page-first" : "marker-app-screen marker-page"
      }
    >
      {finalPrizeUnlocked ? <FinalPrizeWinNotice /> : null}

      {isFirstScan ? (
        <section
          className="marker-first-scan marker-first-scan-primary marker-app-panel"
          aria-label="First scan introduction"
        >
          <div className="marker-first-scan-head">
            <div>
              <p className="eyebrow">First scan saved</p>
              <h1>{marker.marker_name}</h1>
              <p className="found-message">{foundMessage}</p>
            </div>
            <strong>
              {foundCount}/{TOTAL_MARKERS}
            </strong>
          </div>
          <ProgressBar current={foundCount} total={TOTAL_MARKERS} />
          <div className="first-scan-steps">
            <div>
              <span>Game</span>
              <p>Find QR markers around Famous Land to finish the four zone quests.</p>
            </div>
            <div>
              <span>Safety</span>
              <p>Stay with your group, use safe footing, and skip any marker that feels risky.</p>
            </div>
            <div>
              <span>Progress</span>
              <p>
                This phone now holds your progress. Email recovery is optional later if
                you become an active player.
              </p>
            </div>
          </div>
          <div className="button-row">
            <Link className="button primary" href="/quest">
              View Famous Land Quest
            </Link>
            <Link className="button secondary" href="/safety">
              Safety note
            </Link>
          </div>
          {serverMessage ? <p className="notice">{serverMessage}</p> : null}
        </section>
      ) : (
        <div className="marker-hero marker-app-panel">
          <p className="eyebrow">Marker {String(marker.marker_number).padStart(2, "0")}</p>
          <h1>{marker.marker_name}</h1>
          <p className="found-message">{foundMessage}</p>
          <div className="marker-meta">
            <span>{foundMarkerLabel} found</span>
            <span>{marker.zone} Zone</span>
          </div>
          {serverMessage ? <p className="notice">{serverMessage}</p> : null}
        </div>
      )}

      {savePrompt ? (
        <div className="save-callout marker-app-panel">
          <p className="eyebrow">Save your progress</p>
          <h2>Want to save your Famous Land Quest progress?</h2>
          <p>
            Enter your email and we will let you recover your Famous Land Quest if you
            switch phones, clear your browser, or come back later.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/save-progress">
              Save my progress
            </Link>
            <Link className="button secondary" href="/quest">
              Maybe later
            </Link>
          </div>
        </div>
      ) : null}

      {activeZoneSlug ? (
        <div className="card marker-zone-card marker-app-panel">
          <div className="marker-zone-head">
            <h2>Marker Map</h2>
          </div>
          <ZonePreviewMap activeMarkerId={marker.marker_id} activeSlug={activeZoneSlug} />
          <p className="marker-zone-caption">{marker.zone} Zone</p>
        </div>
      ) : null}

      <div className="card marker-progress-card marker-app-panel">
        <h2>Zone quest</h2>
        <div className="quest-progress-list">
          {zoneQuests.map((quest) => (
            <div className="quest-progress-row" key={quest.id}>
              <div className="split">
                <strong>{quest.title}</strong>
                <span>
                  {quest.current}/{quest.total}
                </span>
              </div>
              <ProgressBar current={quest.current} total={quest.total} />
            </div>
          ))}
        </div>
      </div>

      <div className="card marker-details-card marker-app-panel">
        <div>
          <span>Field note</span>
          <p>{marker.field_note}</p>
        </div>
        <div>
          <span>Outdoor challenge</span>
          <p>{marker.challenge}</p>
        </div>
        <div>
          <span>Clue</span>
          <p>{marker.clue}</p>
        </div>
      </div>
    </div>
  );
}
