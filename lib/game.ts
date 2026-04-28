import { markers, zones } from "@/lib/markers";
import type { Badge, Marker, QuestStatus, Zone } from "@/lib/types";

export const TOTAL_MARKERS = markers.length;

const badgeDefinitions: Badge[] = [
  {
    id: "first-find",
    name: "First Find",
    description: "Found your first Famous Land marker."
  },
  {
    id: "calf-scout",
    name: "Calf Scout",
    description: "Found any 3 markers."
  },
  {
    id: "five-marker-find",
    name: "Five Marker Find",
    description: "Found any 5 markers and can save progress for the summer."
  },
  {
    id: "road-walker",
    name: "Road Walker",
    description: "Completed all Road Walker markers."
  },
  {
    id: "hill-top-explorer",
    name: "Hill Top Explorer",
    description: "Completed all Hill Top markers."
  },
  {
    id: "tree-top-tracker",
    name: "Tree Top Tracker",
    description: "Completed all Tree Top markers."
  },
  {
    id: "water-scout",
    name: "Water Scout",
    description: "Completed all On the Water markers."
  },
  {
    id: "summer-explorer",
    name: "Summer Explorer",
    description: "Found 20 of 30 markers."
  },
  {
    id: "famous-land-finisher",
    name: "Famous Land Finisher",
    description: "Found all 30 markers."
  },
  {
    id: "island-cow",
    name: "Island Cow",
    description: "Found the special island marker."
  }
];

export function uniqueFoundIds(foundIds: string[]): string[] {
  return Array.from(new Set(foundIds.filter(Boolean)));
}

export function getFoundMarkers(foundIds: string[]): Marker[] {
  const found = new Set(uniqueFoundIds(foundIds));
  return markers.filter((marker) => found.has(marker.marker_id));
}

export function getZoneMarkers(zone: Zone): Marker[] {
  return markers.filter((marker) => marker.zone === zone);
}

export function getZoneProgress(foundIds: string[]) {
  const found = new Set(uniqueFoundIds(foundIds));
  return zones.map((zone) => {
    const zoneMarkers = getZoneMarkers(zone);
    const current = zoneMarkers.filter((marker) => found.has(marker.marker_id)).length;
    return {
      zone,
      current,
      total: zoneMarkers.length,
      complete: current === zoneMarkers.length
    };
  });
}

export function getQuestStatuses(foundIds: string[]): QuestStatus[] {
  const found = new Set(uniqueFoundIds(foundIds));
  const count = found.size;
  const zoneProgress = getZoneProgress(foundIds);
  const islandMarker = markers.find((marker) => marker.is_island);

  return [
    {
      id: "quick-quest",
      title: "Quick Quest",
      badge: "Calf Scout",
      description: "Find any 3 markers. Built for day visitors and quick walks.",
      current: Math.min(count, 3),
      total: 3,
      complete: count >= 3
    },
    {
      id: "five-marker-find",
      title: "Five Marker Find",
      badge: "Five Marker Find",
      description: "Find any 5 markers, then save your progress for the summer.",
      current: Math.min(count, 5),
      total: 5,
      complete: count >= 5
    },
    ...zoneProgress.map((progress) => ({
      id: progress.zone.toLowerCase().replaceAll(" ", "-"),
      title: progress.zone,
      badge: zoneBadge(progress.zone),
      description: zoneDescription(progress.zone),
      current: progress.current,
      total: progress.total,
      complete: progress.complete
    })),
    {
      id: "island-bonus",
      title: "Island Bonus",
      badge: "Island Cow",
      description: "Find the island marker only with permission, supervision, and safe conditions.",
      current: islandMarker && found.has(islandMarker.marker_id) ? 1 : 0,
      total: 1,
      complete: Boolean(islandMarker && found.has(islandMarker.marker_id))
    },
    {
      id: "summer-quest",
      title: "Summer Quest",
      badge: "Summer Explorer",
      description: "Find 20 of the 30 markers across Famous Land.",
      current: Math.min(count, 20),
      total: 20,
      complete: count >= 20
    },
    {
      id: "perfect-quest",
      title: "Perfect Quest",
      badge: "Famous Land Finisher",
      description: "Find every marker, including the special island bonus marker.",
      current: count,
      total: TOTAL_MARKERS,
      complete: count >= TOTAL_MARKERS
    }
  ];
}

export function getEarnedBadges(foundIds: string[]): Badge[] {
  const found = new Set(uniqueFoundIds(foundIds));
  const count = found.size;
  const earned = new Set<string>();

  if (count >= 1) earned.add("first-find");
  if (count >= 3) earned.add("calf-scout");
  if (count >= 5) earned.add("five-marker-find");
  if (count >= 20) earned.add("summer-explorer");
  if (count >= TOTAL_MARKERS) earned.add("famous-land-finisher");

  for (const progress of getZoneProgress(foundIds)) {
    if (progress.complete) {
      if (progress.zone === "Road Walker") earned.add("road-walker");
      if (progress.zone === "Hill Top") earned.add("hill-top-explorer");
      if (progress.zone === "Tree Top") earned.add("tree-top-tracker");
      if (progress.zone === "On the Water") earned.add("water-scout");
    }
  }

  const islandMarker = markers.find((marker) => marker.is_island);
  if (islandMarker && found.has(islandMarker.marker_id)) earned.add("island-cow");

  return badgeDefinitions.filter((badge) => earned.has(badge.id));
}

export function getLockedBadges(foundIds: string[]): Badge[] {
  const earned = new Set(getEarnedBadges(foundIds).map((badge) => badge.id));
  return badgeDefinitions.filter((badge) => !earned.has(badge.id));
}

export function zoneBadge(zone: Zone): string {
  if (zone === "Road Walker") return "Road Walker";
  if (zone === "Hill Top") return "Hill Top Explorer";
  if (zone === "Tree Top") return "Tree Top Tracker";
  return "Water Scout";
}

function zoneDescription(zone: Zone): string {
  if (zone === "Road Walker") {
    return "Easy-access markers near roads, paths, driveway edges, or obvious walking routes.";
  }
  if (zone === "Hill Top") {
    return "Higher-elevation markers that ask for a little more effort and careful footing.";
  }
  if (zone === "Tree Top") {
    return "Forest and interior markers where the woods are the main event.";
  }
  return "Lake-edge, shoreline, dock, cove, and island-adjacent markers.";
}
