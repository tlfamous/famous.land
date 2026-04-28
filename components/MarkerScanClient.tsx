"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BadgeList } from "@/components/BadgeList";
import { ProgressBar } from "@/components/ProgressBar";
import { getQuestStatuses, getZoneProgress, TOTAL_MARKERS } from "@/lib/game";
import {
  addLocalScannedMarker,
  getOrCreatePlayerId,
  hasSavedProgress,
  shouldPromptSaveProgress
} from "@/lib/localPlayer";
import type { Marker } from "@/lib/types";

type ScanState = "recording" | "new" | "duplicate" | "saved-locally";

export function MarkerScanClient({ marker }: { marker: Marker }) {
  const [scanState, setScanState] = useState<ScanState>("recording");
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [serverMessage, setServerMessage] = useState("");

  useEffect(() => {
    const playerId = getOrCreatePlayerId();
    const localResult = addLocalScannedMarker(marker.marker_id);
    setFoundIds(localResult.markerIds);
    setScanState(localResult.alreadyFound ? "duplicate" : "new");

    fetch("/api/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player_id: playerId,
        marker_id: marker.marker_id
      })
    })
      .then((response) => response.json())
      .then((data: { ok?: boolean; is_new?: boolean; error?: string }) => {
        if (!data.ok) {
          setServerMessage(data.error ?? "This find is saved on this phone.");
          setScanState("saved-locally");
        }
      })
      .catch(() => {
        setServerMessage("This find is saved on this phone. Server sync can catch up later.");
        setScanState("saved-locally");
      });
  }, [marker.marker_id]);

  const quests = useMemo(() => getQuestStatuses(foundIds), [foundIds]);
  const zoneProgress = useMemo(() => getZoneProgress(foundIds), [foundIds]);
  const activeZone = zoneProgress.find((zone) => zone.zone === marker.zone);
  const savePrompt = foundIds.length >= 5 && shouldPromptSaveProgress();
  const saved = hasSavedProgress();

  return (
    <div className="stack marker-page">
      <section className="marker-hero">
        <p className="eyebrow">Marker {String(marker.marker_number).padStart(2, "0")}</p>
        <h1>{marker.marker_name}</h1>
        <p className="found-message">
          {scanState === "duplicate"
            ? "You already found this marker. It still counts toward your progress."
            : "You found one of the Famous Land markers."}
        </p>
        {serverMessage ? <p className="notice">{serverMessage}</p> : null}
        <div className="marker-meta">
          <span>Zone: {marker.zone}</span>
          <span>Difficulty: {marker.difficulty}</span>
        </div>
      </section>

      <section className="card progress-card">
        <div className="split">
          <div>
            <p className="eyebrow">Progress</p>
            <h2>
              You have found {foundIds.length} of {TOTAL_MARKERS} markers.
            </h2>
          </div>
          <strong>{Math.round((foundIds.length / TOTAL_MARKERS) * 100)}%</strong>
        </div>
        <ProgressBar current={foundIds.length} total={TOTAL_MARKERS} />
      </section>

      {savePrompt ? (
        <section className="save-callout">
          <p className="eyebrow">Five Marker Find</p>
          <h2>You found your 5th marker. Want to save your progress for the summer?</h2>
          <p>
            Enter your email and we will let you recover your Famous Land Quest if you
            switch phones, clear your browser, or come back later.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/save-progress">
              Save my progress
            </Link>
            <Link className="button secondary" href="/progress">
              Maybe later
            </Link>
          </div>
        </section>
      ) : saved && foundIds.length >= 5 ? (
        <p className="notice">Your progress is marked as saved on this phone.</p>
      ) : null}

      <section className="card">
        <h2>Field note</h2>
        <p>{marker.field_note}</p>
      </section>

      <section className="card">
        <h2>Outdoor challenge</h2>
        <p>{marker.challenge}</p>
      </section>

      <section className="card">
        <h2>Clue</h2>
        <p>{marker.clue}</p>
      </section>

      <section className="card">
        <h2>Relevant quest progress</h2>
        <div className="mini-quests">
          {quests
            .filter((quest) =>
              ["quick-quest", "five-marker-find", "summer-quest", "perfect-quest"].includes(
                quest.id
              )
            )
            .map((quest) => (
              <div key={quest.id}>
                <div className="split">
                  <strong>{quest.title}</strong>
                  <span>
                    {quest.current}/{quest.total}
                  </span>
                </div>
                <ProgressBar current={quest.current} total={quest.total} />
              </div>
            ))}
          {activeZone ? (
            <div>
              <div className="split">
                <strong>{marker.zone}</strong>
                <span>
                  {activeZone.current}/{activeZone.total}
                </span>
              </div>
              <ProgressBar current={activeZone.current} total={activeZone.total} />
            </div>
          ) : null}
        </div>
      </section>

      <BadgeList foundIds={foundIds} />

      <div className="button-row sticky-actions">
        <Link className="button primary" href="/progress">
          View my progress
        </Link>
        <Link className="button secondary" href="/quests">
          See quests
        </Link>
      </div>
    </div>
  );
}
