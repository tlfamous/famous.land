"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CompletedZoneQuests } from "@/components/CompletedZoneQuests";
import { FinalPrizeWinNotice } from "@/components/FinalPrizeWinNotice";
import { ProgressBar } from "@/components/ProgressBar";
import { markers } from "@/lib/markers";
import { getZoneQuestStatuses, TOTAL_MARKERS, uniqueFoundIds } from "@/lib/game";
import {
  getLocalScannedMarkers,
  getOrCreatePlayerId,
  hasSavedProgress,
  mergeLocalScannedMarkers
} from "@/lib/localPlayer";

export function FamousLandQuestDashboard() {
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const playerId = getOrCreatePlayerId();
    setFoundIds(getLocalScannedMarkers());
    setSaved(hasSavedProgress());

    fetch(`/api/progress?player_id=${encodeURIComponent(playerId)}`)
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
              : "Keep finding markers and finishing the four zone quests."}
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
          <Link className="button primary" href="/save-progress">
            Save my progress
          </Link>
        </section>
      ) : null}

      <section className="card">
        <h2>Zone quests</h2>
        <div className="quest-progress-list">
          {zoneQuests.map((quest) => (
            <div className="quest-progress-row" key={quest.id}>
              <div className="split">
                <div>
                  <strong>{quest.title}</strong>
                  <small>{quest.zoneLabel}</small>
                </div>
                <span>
                  {quest.current}/{quest.total}
                </span>
              </div>
              <ProgressBar current={quest.current} total={quest.total} />
            </div>
          ))}
        </div>
      </section>

      <CompletedZoneQuests foundIds={foundIds} />

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
        <h2>Save and recover</h2>
        <p>
          Optionally save progress by email so you can recover your quest if you
          switch phones or clear your browser.
        </p>
        <div className="button-row">
          <Link className="button primary" href="/save-progress">
            Save progress
          </Link>
          <Link className="button secondary" href="/contact">
            Recovery help
          </Link>
        </div>
      </section>
    </div>
  );
}
