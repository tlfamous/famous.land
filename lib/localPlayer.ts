"use client";

import { markers } from "@/lib/markers";

const PLAYER_ID_KEY = "famous-land-player-id-v1";
const FOUND_MARKERS_KEY = "famous-land-found-markers-v1";
const SCAN_LOG_KEY = "famous-land-scan-log-v1";
const SAVED_PROGRESS_KEY = "famous-land-progress-saved-v1";

export type LocalScanLogEntry = {
  marker_id: string;
  scanned_at: string;
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
  return readJson<string[]>(FOUND_MARKERS_KEY, []).filter((markerId) => markerIds.has(markerId));
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
    window.localStorage.setItem(`${SAVED_PROGRESS_KEY}:email`, email);
  }
}

export function shouldPromptSaveProgress(): boolean {
  return getLocalScannedMarkers().length >= 5 && !hasSavedProgress();
}
