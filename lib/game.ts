import { markers, zones } from "@/lib/markers";
import type { Marker, Zone, ZoneQuest, ZoneQuestStatus } from "@/lib/types";

export const TOTAL_MARKERS = markers.length;

export const ZONE_QUEST_ORDER: Zone[] = ["Lakeview", "No Wake", "Treetop", "Hillside"];

const activeMarkerIds = new Set(markers.map((marker) => marker.marker_id));

const zoneQuestDefinitions: Record<Zone, ZoneQuest> = {
  Lakeview: {
    id: "lakeview-quest",
    zone: "Lakeview",
    title: "Lakeview Quest",
    zoneLabel: "Lakeview Zone",
    description: "Complete every Lakeview Zone marker."
  },
  "No Wake": {
    id: "no-wake-quest",
    zone: "No Wake",
    title: "No Wake Quest",
    zoneLabel: "No Wake Zone",
    description: "Complete every No Wake Zone marker."
  },
  Treetop: {
    id: "treetop-quest",
    zone: "Treetop",
    title: "Treetop Quest",
    zoneLabel: "Treetop Zone",
    description: "Complete every Treetop Zone marker."
  },
  Hillside: {
    id: "hillside-quest",
    zone: "Hillside",
    title: "Hillside Quest",
    zoneLabel: "Hillside Zone",
    description: "Complete every Hillside Zone marker."
  }
};

export function uniqueFoundIds(foundIds: string[]): string[] {
  return Array.from(new Set(foundIds.filter((markerId) => activeMarkerIds.has(markerId))));
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

export function getZoneQuestStatuses(foundIds: string[]): ZoneQuestStatus[] {
  const zoneProgressByZone = new Map(
    getZoneProgress(foundIds).map((progress) => [progress.zone, progress])
  );

  return ZONE_QUEST_ORDER.map((zone) => {
    const progress = zoneProgressByZone.get(zone);
    const quest = zoneQuestDefinitions[zone];

    return {
      id: quest.id,
      zone: quest.zone,
      title: quest.title,
      zoneLabel: quest.zoneLabel,
      description: quest.description,
      current: progress?.current ?? 0,
      total: progress?.total ?? 0,
      complete: progress?.complete ?? false
    };
  });
}

export function getCompletedZoneQuests(foundIds: string[]): ZoneQuest[] {
  return getZoneQuestStatuses(foundIds)
    .filter((quest) => quest.complete)
    .map(({ current: _current, total: _total, complete: _complete, ...quest }) => quest);
}
