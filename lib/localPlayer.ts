"use client";

import { markers } from "@/lib/markers";

const PLAYER_ID_KEY = "famous-land-player-id-v1";
const FOUND_MARKERS_KEY = "famous-land-found-markers-v1";
const SCAN_LOG_KEY = "famous-land-scan-log-v1";
const MARKER_VISITS_KEY = "famous-land-marker-visits-v1";
const SAVED_PROGRESS_KEY = "famous-land-progress-saved-v1";
const SAVED_PROGRESS_EMAIL_KEY = `${SAVED_PROGRESS_KEY}:email`;

export type LocalScanLogEntry = {
  marker_id: string;
  scanned_at: string;
};

export type LocalPlayerSnapshot = {
  playerId: string;
  foundIds: string[];
  scanLog: LocalScanLogEntry[];
  saved: boolean;
  savedEmail: string;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getOrCreatePlayerId(): string {
  if (!canUseStorage()) return "";

  const existing = window.localStorage.getItem(PLAYER_ID_KEY);
  if (existing) return existing;

  const playerId = crypto.randomUUID();
  window.localStorage.setItem(PLAYER_ID_KEY, playerId);
  return playerId;
}

export function setLocalPlayerId(playerId: string) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(PLAYER_ID_KEY, playerId);
}

export function getLocalScannedMarkers(): string[] {
  const markerIds = new Set(markers.map((marker) => marker.marker_id));
  return Array.from(
    new Set(readJson<string[]>(FOUND_MARKERS_KEY, []).filter((markerId) => markerIds.has(markerId)))
  );
}

export function addLocalScannedMarker(markerId: string): {
  alreadyFound: boolean;
  markerIds: string[];
} {
  const current = getLocalScannedMarkers();
  const alreadyFound = current.includes(markerId);
  const markerIds = alreadyFound ? current : [...current, markerId];

  writeJson(FOUND_MARKERS_KEY, markerIds);

  if (!alreadyFound) {
    const log = getLocalScanLog();
    writeJson(SCAN_LOG_KEY, [
      {
        marker_id: markerId,
        scanned_at: new Date().toISOString()
      },
      ...log.filter((entry) => entry.marker_id !== markerId)
    ]);
  }

  return { alreadyFound, markerIds };
}

export function incrementLocalMarkerVisit(markerId: string): number {
  const visits = readJson<Record<string, number>>(MARKER_VISITS_KEY, {});
  const nextVisitCount = Math.max(0, visits[markerId] ?? 0) + 1;
  writeJson(MARKER_VISITS_KEY, {
    ...visits,
    [markerId]: nextVisitCount
  });

  return nextVisitCount;
}

export function mergeLocalScannedMarkers(markerIds: string[]) {
  const merged = Array.from(new Set([...getLocalScannedMarkers(), ...markerIds]));
  writeJson(FOUND_MARKERS_KEY, merged);
  return merged;
}

export function getLocalScanLog(): LocalScanLogEntry[] {
  const markerIds = new Set(getLocalScannedMarkers());
  return readJson<LocalScanLogEntry[]>(SCAN_LOG_KEY, []).filter((entry) =>
    markerIds.has(entry.marker_id)
  );
}

export function applyRecoveredProgress(playerId: string, markerIds: string[]) {
  setLocalPlayerId(playerId);
  const merged = mergeLocalScannedMarkers(markerIds);
  const existingLog = getLocalScanLog();
  const existing = new Set(existingLog.map((entry) => entry.marker_id));
  const recoveredLog = markerIds
    .filter((markerId) => !existing.has(markerId))
    .map((markerId) => ({
      marker_id: markerId,
      scanned_at: new Date().toISOString()
    }));

  writeJson(SCAN_LOG_KEY, [...recoveredLog, ...existingLog]);
  return merged;
}

export function hasSavedProgress(): boolean {
  if (!canUseStorage()) return false;
  return window.localStorage.getItem(SAVED_PROGRESS_KEY) === "true";
}

export function markProgressSaved(email?: string) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SAVED_PROGRESS_KEY, "true");
  if (email) {
    window.localStorage.setItem(SAVED_PROGRESS_EMAIL_KEY, email);
  }
}

export function shouldPromptSaveProgress(): boolean {
  return getLocalScannedMarkers().length >= 5 && !hasSavedProgress();
}

export function getLocalPlayerSnapshot(): LocalPlayerSnapshot {
  if (!canUseStorage()) {
    return {
      playerId: "",
      foundIds: [],
      scanLog: [],
      saved: false,
      savedEmail: ""
    };
  }

  return {
    playerId: window.localStorage.getItem(PLAYER_ID_KEY) ?? "",
    foundIds: getLocalScannedMarkers(),
    scanLog: getLocalScanLog(),
    saved: hasSavedProgress(),
    savedEmail: window.localStorage.getItem(SAVED_PROGRESS_EMAIL_KEY) ?? ""
  };
}

export function resetLocalPlayerData() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(PLAYER_ID_KEY);
  window.localStorage.removeItem(FOUND_MARKERS_KEY);
  window.localStorage.removeItem(SCAN_LOG_KEY);
  window.localStorage.removeItem(MARKER_VISITS_KEY);
  window.localStorage.removeItem(SAVED_PROGRESS_KEY);
  window.localStorage.removeItem(SAVED_PROGRESS_EMAIL_KEY);
}
