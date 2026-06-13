import type { Marker, Zone } from "@/lib/types";

export const markers: Marker[] = [
  {
    marker_id: "FF-TREE-001",
    short_code: "8K4P2",
    url: "https://famous.land/8K4P2",
    marker_number: 1,
    marker_name: "Island Landing",
    zone: "No Wake",
    field_note: "This small island marker is a special water-access find for safe, supervised conditions only.",
    challenge: "Before celebrating, point out the safest way back to shore.",
    clue: "Famous came this way. Another water marker waits near the west tip.",
    is_island: true,
    order: 1
  },
  {
    marker_id: "FF-TREE-002",
    short_code: "37TZZ",
    url: "https://famous.land/37TZZ",
    marker_number: 2,
    marker_name: "Narrow Squeeze",
    zone: "No Wake",
    field_note: "This water-side tip sits out where the shoreline narrows and the lake opens around it.",
    challenge: "Pause for 20 seconds and notice the wind, waterline, and nearest safe landing point.",
    clue: "Look toward Solo Lounge for another water-access marker.",
    is_island: false,
    order: 2
  },
  {
    marker_id: "FF-TREE-003",
    short_code: "F779V",
    url: "https://famous.land/F779V",
    marker_number: 3,
    marker_name: "Solo Lounge",
    zone: "No Wake",
    field_note: "This point looks back across the lake edge from the north/east side of the water route.",
    challenge: "Find one reflection on the water and one place where the shoreline changes shape.",
    clue: "The island marker is special. Only go there with permission and safe conditions.",
    is_island: false,
    order: 3
  },
  {
    marker_id: "FF-TREE-004",
    short_code: "EDZ7B",
    url: "https://famous.land/EDZ7B",
    marker_number: 4,
    marker_name: "Beyond Shady",
    zone: "Lakeview",
    field_note: "This south Lakeview tag sits just past the shaded edge, where the woods begin to open back up.",
    challenge: "Look for the line where deep shade gives way to brighter ground.",
    clue: "Continue north toward the next Lakeview marker near the place that no longer feels like lake.",
    is_island: false,
    order: 4
  },
  {
    marker_id: "FF-TREE-005",
    short_code: "YWE8A",
    url: "https://famous.land/YWE8A",
    marker_number: 5,
    marker_name: "No Longer a Lake",
    zone: "Lakeview",
    field_note: "The old wet edge has changed shape here, leaving a place that remembers water without quite being lake.",
    challenge: "Find one clue that water used to sit or move differently nearby.",
    clue: "Keep working north toward a view that catches reflections.",
    is_island: false,
    order: 5
  },
  {
    marker_id: "FF-TREE-006",
    short_code: "W33AB",
    url: "https://famous.land/W33AB",
    marker_number: 6,
    marker_name: "Mirror Pond View",
    zone: "Lakeview",
    field_note: "This spot faces a quieter pocket of water where the pond can hold a clean reflection.",
    challenge: "Find something reflected in the water and then find the real thing.",
    clue: "The last Lakeview marker is farther north near the tight cove.",
    is_island: false,
    order: 6
  },
  {
    marker_id: "FF-TREE-007",
    short_code: "KFXCK",
    url: "https://famous.land/KFXCK",
    marker_number: 7,
    marker_name: "Narrow Cove",
    zone: "Lakeview",
    field_note: "The north Lakeview tag sits by a thin cove where land pinches the water into a smaller shape.",
    challenge: "Trace the cove edge with your eyes and notice where it narrows.",
    clue: "This completes the Lakeview run. Famous came this way.",
    is_island: false,
    order: 7
  },
  {
    marker_id: "FF-TREE-008",
    short_code: "U8U35",
    url: "https://famous.land/U8U35",
    marker_number: 8,
    marker_name: "Warblers Way",
    zone: "Hillside",
    field_note: "A quiet turn is a good reminder that exploring does not need to be loud.",
    challenge: "Listen for the farthest sound you can hear.",
    clue: "If you are ready for more effort, start looking uphill.",
    is_island: false,
    order: 8
  },
  {
    marker_id: "FF-TREE-009",
    short_code: "XJYYQ",
    url: "https://famous.land/XJYYQ",
    marker_number: 9,
    marker_name: "Cattle Crossroads",
    zone: "Hillside",
    field_note: "The higher ground changes the air and opens small windows through the trees.",
    challenge: "Pause and notice whether the wind feels different up here.",
    clue: "Another hill marker sits near a rock or root that makes you slow down.",
    is_island: false,
    order: 9
  },
  {
    marker_id: "FF-TREE-010",
    short_code: "CN5UP",
    url: "https://famous.land/CN5UP",
    marker_number: 10,
    marker_name: "Hillside Greenway",
    zone: "Hillside",
    field_note: "Higher places make even familiar land feel a little new.",
    challenge: "Name one thing you can see from here that you could not see below.",
    clue: "Follow the ridge feeling, not the steepest shortcut.",
    is_island: false,
    order: 10
  },
  {
    marker_id: "FF-TREE-011",
    short_code: "XRZ8J",
    url: "https://famous.land/XRZ8J",
    marker_number: 11,
    marker_name: "Lakeview Notch",
    zone: "Hillside",
    field_note: "Ridges collect breezes and make leaves speak a little louder.",
    challenge: "Watch the canopy for 15 seconds and find where the wind is strongest.",
    clue: "Keep to safe footing and look for the next marker along upper ground.",
    is_island: false,
    order: 11
  },
  {
    marker_id: "FF-TREE-016",
    short_code: "EWNJC",
    url: "https://famous.land/EWNJC",
    marker_number: 12,
    marker_name: "Boat Launch",
    zone: "Treetop",
    field_note: "This Treetop marker starts near the upper-left edge of the zone, close to the boat-launch side of the story.",
    challenge: "Look for the easiest safe line between land, road, and water.",
    clue: "Next, look for the place that looks like a driveway but is not one.",
    is_island: false,
    order: 12
  },
  {
    marker_id: "FF-TREE-017",
    short_code: "PUQZA",
    url: "https://famous.land/PUQZA",
    marker_number: 13,
    marker_name: "Not a Driveway",
    zone: "Treetop",
    field_note: "This spot has the shape of access, but the land is asking for a slower look.",
    challenge: "Find one sign that tells you whether a route is meant for walking, driving, or neither.",
    clue: "Continue toward the stone clue.",
    is_island: false,
    order: 13
  },
  {
    marker_id: "FF-TREE-018",
    short_code: "ETET2",
    url: "https://famous.land/ETET2",
    marker_number: 15,
    marker_name: "Not much of a Dam View",
    zone: "Treetop",
    field_note: "This view hints at the dam more than it shows it, which counts if you are feeling generous.",
    challenge: "Find the view, then name what blocks it.",
    clue: "Next, continue toward the stone clue.",
    is_island: false,
    order: 15
  },
  {
    marker_id: "FF-TREE-019",
    short_code: "TAKVU",
    url: "https://famous.land/TAKVU",
    marker_number: 14,
    marker_name: "Granite Marker",
    zone: "Treetop",
    field_note: "Granite has a way of making boundaries feel older than the map.",
    challenge: "Notice one natural edge and one human-made edge nearby.",
    clue: "This completes the Treetop run. Famous came this way.",
    is_island: false,
    order: 14
  },
  {
    marker_id: "FF-TREE-026",
    short_code: "SH7GP",
    url: "https://famous.land/SH7GP",
    marker_number: 16,
    marker_name: "Lake View",
    zone: "No Wake",
    field_note: "The lake changes the whole pace of the land.",
    challenge: "Watch the water surface for 20 seconds and name the pattern you see.",
    clue: "Another water marker waits where the shore grows quieter.",
    is_island: false,
    order: 16
  },
  {
    marker_id: "FF-TREE-027",
    short_code: "D7BZG",
    url: "https://famous.land/D7BZG",
    marker_number: 17,
    marker_name: "Quiet Cove",
    zone: "No Wake",
    field_note: "Coves collect stillness, shade, and small sounds.",
    challenge: "Find one reflection and one shadow.",
    clue: "Look for a shoreline tree that seems to lean toward the lake.",
    is_island: false,
    order: 17
  },
  {
    marker_id: "FF-TREE-028",
    short_code: "VHF99",
    url: "https://famous.land/VHF99",
    marker_number: 18,
    marker_name: "Shoreline Pine",
    zone: "No Wake",
    field_note: "Shoreline trees live with wet feet nearby and wind in their branches.",
    challenge: "Listen for water, wind, birds, or insects before you leave.",
    clue: "A marker waits closer to a turn by the water.",
    is_island: false,
    order: 18
  },
  {
    marker_id: "FF-TREE-029",
    short_code: "Z6QRQ",
    url: "https://famous.land/Z6QRQ",
    marker_number: 19,
    marker_name: "Dockside Turn",
    zone: "No Wake",
    field_note: "Edges near docks and shore paths ask for slower steps and better attention.",
    challenge: "Point out the safest path back from the water before you move on.",
    clue: "The island marker is special. Only go there with permission and safe conditions.",
    is_island: false,
    order: 19
  },
  {
    marker_id: "FF-TREE-030",
    short_code: "A66DJ",
    url: "https://famous.land/A66DJ",
    marker_number: 20,
    marker_name: "Island Landing",
    zone: "No Wake",
    field_note: "The island marker is a bonus find for supervised, safe conditions only.",
    challenge: "Before celebrating, name the safest way back to shore.",
    clue: "Island landing found. Famous definitely came this way.",
    is_island: false,
    order: 20
  }
];

export const zones: Zone[] = ["Lakeview", "No Wake", "Treetop", "Hillside"];

export function getMarkerByToken(token: string): Marker | undefined {
  const normalized = decodeURIComponent(token).trim().toUpperCase();
  return markers.find(
    (marker) =>
      marker.short_code.toUpperCase() === normalized ||
      marker.marker_id.toUpperCase() === normalized
  );
}

export function getMarkerById(markerId: string): Marker | undefined {
  return markers.find((marker) => marker.marker_id === markerId);
}

export function getMarkerByShortCode(shortCode: string): Marker | undefined {
  return markers.find((marker) => marker.short_code === shortCode);
}

export function markerRoute(marker: Marker): string {
  return `/${marker.short_code}`;
}
