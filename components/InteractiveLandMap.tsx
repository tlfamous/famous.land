"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { LandMapZone } from "@/lib/landParcels";
import type { Zone } from "@/lib/types";

type InteractiveLandMapProps = {
  zones: LandMapZone[];
};

type VisualZone = {
  path: string;
  tone: string;
  points?: {
    x: number;
    y: number;
    label: string;
    markerId?: string;
    style?: "number" | "tag";
  }[];
};

type FamousLandMapSvgProps = {
  activeSlug: string;
  ariaLabel: string;
  activeMarkerId?: string;
  className?: string;
  showWalkingTrails?: boolean;
  viewBox?: string;
  zoneSlugs?: string[];
};

type WalkingTrail = {
  name: string;
  path: string;
  offset?: {
    x: number;
    y: number;
  };
  label?: {
    rotate: number;
    x: number;
    y: number;
  };
  markerColor: string;
  markers: { x: number; y: number }[];
  vistaDot?: { x: number; y: number };
};

const walkingTrails: WalkingTrail[] = [
  {
    name: "Kinglets Caper Trail",
    path:
      "M29.0 45.4 L31.4 47.5 L34.4 49.7 L38.2 52.0 L41.0 54.4 L41.4 56.4 C39.7 58.1 37.8 59.1 35.5 59.7 C33.5 61.5 32.2 63.8 31.2 66.4 C30.2 69.6 29.8 72.8 29.6 76.3 C29.2 80.5 28.0 84.5 26.5 88.7 C24.7 93.7 22.4 98.4 20.6 103.8",
    offset: { x: -1.1, y: 7.2 },
    label: { rotate: -84, x: 21.2, y: 96.2 },
    markerColor: "#f0d732",
    vistaDot: { x: 29.0, y: 45.4 },
    markers: [
      { x: 31.5, y: 47.7 },
      { x: 35.8, y: 50.4 },
      { x: 39.5, y: 53.3 },
      { x: 41.2, y: 56.3 },
      { x: 38.0, y: 58.5 },
      { x: 34.0, y: 60.2 },
      { x: 31.8, y: 63.5 },
      { x: 30.4, y: 67.0 },
      { x: 29.7, y: 72.0 },
      { x: 29.2, y: 77.5 },
      { x: 27.7, y: 84.0 },
      { x: 25.5, y: 90.2 },
      { x: 22.7, y: 96.4 },
      { x: 20.8, y: 101.2 }
    ]
  }
];

const hilltopZonePath =
  "M89.1 40.5 C89.7 40.9 90.2 41.4 90.4 42.0 C90.9 42.7 91.1 43.4 90.7 44.0 C90.0 44.4 89.1 44.1 88.5 43.5 C88.3 42.8 88.5 41.9 88.8 41.2 C88.9 40.9 89.0 40.7 89.1 40.5 Z";

const visualZoneOrder = ["treetop-terrace", "on-the-water", "lakeview", "monomonac-hill"];
const fullMapViewBox = "0 0 100 100";
const zoomedMapViewBoxSize = 38;

export const zoneMapSlugs: Record<Zone, string> = {
  Treetop: "treetop-terrace",
  "No Wake": "on-the-water",
  Lakeview: "lakeview",
  Hillside: "monomonac-hill"
};

const visualZones: Record<string, VisualZone> = {
  "monomonac-hill": {
    path:
      "M59.8 7.8 L63.0 12.0 L73.0 12.3 L72.8 28.8 L70.2 34.2 L62.9 34.2 L63.3 46.0 L69.0 46.7 L77.2 54.2 L68.0 55.8 L70.1 57.0 L69.6 66.5 L73.8 67.2 L72.6 70.8 L69.0 73.7 L66.0 78.0 L61.2 80.0 L55.4 80.6 L54.0 75.4 L49.6 64.4 L44.4 56.0 L36.4 52.0 L28.0 44.3 L36.5 31.8 L46.8 21.4 L55.0 10.2 L59.8 7.8 Z",
    points: [
      { x: 35.3, y: 52.6, label: "Warblers Way / U8U35", markerId: "FF-TREE-008", style: "tag" },
      { x: 54.4, y: 26.5, label: "Cattle Crossroads / XJYYQ", markerId: "FF-TREE-009", style: "tag" },
      { x: 72.8, y: 24.1, label: "Hillside Greenway / CN5UP", markerId: "FF-TREE-010", style: "tag" },
      { x: 76.5, y: 54.4, label: "Lakeview Notch / XRZ8J", markerId: "FF-TREE-011", style: "tag" }
    ],
    tone: "#536b35"
  },
  "lakeview": {
    path:
      "M80.0 47.0 L84.0 48.0 L82.6 50.5 L79.6 49.5 Z M75.3 64.5 L77.6 64.0 L77.0 69.0 L74.6 69.3 Z M67.3 85.1 L68.4 83.7 L69.4 77.7 L71.5 75.8 L72.4 77.4 L70.0 86.0 Z M49.6 94.8 L52.0 96.7 L52.6 99.6 L51.9 100.5 L49.6 94.8 Z",
    points: [
      {
        x: 50.4,
        y: 96.0,
        label: "Beyond Shady / EDZ7B",
        markerId: "FF-TREE-004",
        style: "tag"
      },
      {
        x: 69.0,
        y: 82.8,
        label: "No Longer a Lake / YWE8A",
        markerId: "FF-TREE-005",
        style: "tag"
      },
      {
        x: 75.6,
        y: 65.0,
        label: "Mirror Pond View / W33AB",
        markerId: "FF-TREE-006",
        style: "tag"
      },
      {
        x: 80.9,
        y: 47.9,
        label: "Narrow Cove / KFXCK",
        markerId: "FF-TREE-007",
        style: "tag"
      }
    ],
    tone: "#2f6f77"
  },
  "on-the-water": {
    path:
      "M92.1 0 L100 0 L100 19.9 L99.4 19.8 L97.8 17.2 L96.3 11.9 L96.9 9.4 L98.6 7.5 L99.2 6.2 L99.1 5.4 L97.2 4.7 L94.5 6.8 L93.1 10.9 L92.7 11 L92.9 13 L92.2 15.2 L91.8 15.4 L91.8 16.1 L93.1 18 L89.4 19 L88.5 20.7 L91.1 21.8 L91.7 23.7 L91.4 26.2 L92 26.6 L93.9 22.5 L94.8 21.7 L95.7 21.9 L96.4 24 L97.6 25.7 L97.7 27.6 L97 31.2 L94.6 35.6 L93.9 35.2 L94.4 35.8 L93.8 36 L93.2 37.9 L92.6 37.8 L92.6 39 L91.6 40.8 L90.4 40.8 L89.5 36.2 L88.7 36 L87.7 37.3 L85.8 46.1 L88.4 43.2 L89.3 44.1 L89 45.2 L88.3 45.4 L88.6 46.6 L84.7 54.7 L83.1 56.2 L82.5 55.8 L82.3 57.7 L81.3 59.8 L78.8 61.2 L77 61.4 L76.6 60.4 L79.1 54.3 L80.3 52.3 L84.2 48.6 L84.1 48.1 L83.5 48.1 L81.7 49 L81.2 48.8 L82.8 46.4 L84.1 45.4 L84 44.4 L82.4 41.6 L81.4 38.6 L78.8 38.4 L78.3 37.9 L81 33.4 L82.4 23.4 L83 22.9 L86.2 22.2 L85.5 19.7 L86.6 17.2 L89.9 11.9 L89.5 10.4 Z",
    points: [
      { x: 91.7, y: 29.3, label: "Island Landing / 8K4P2", markerId: "FF-TREE-001", style: "tag" },
      { x: 87.9, y: 19.7, label: "Narrow Squeeze / 37TZZ", markerId: "FF-TREE-002", style: "tag" },
      { x: 83.5, y: 48.3, label: "Solo Lounge / F779V", markerId: "FF-TREE-003", style: "tag" }
    ],
    tone: "#0f6d8a"
  },
  "treetop-terrace": {
    path:
      "M96.7 38.6 L97.8 39.2 L97.8 39.1 L97.8 39 L97.9 39 L97.9 38.9 L97.9 38.8 L98 38.8 L98 38.7 L98.1 38.7 L98.1 38.6 L98.2 38.6 L98.2 38.5 L98.3 38.5 L98.4 38.5 L98.4 38.4 L98.5 38.4 L98.6 38.4 L98.7 38.4 L98.8 38.4 L98.9 38.5 L99 38.5 L99.1 38.6 L99.2 38.6 L99.2 38.7 L99.3 38.7 L99.3 38.8 L99.3 38.9 L99.4 38.9 L99.4 39 L99.4 39.1 L99.4 39.2 L99.4 39.3 L99.4 39.4 L99.4 39.5 L99.4 39.6 L99.3 39.7 L99.3 39.8 L99.2 39.8 L99.2 39.9 L100 40.4 L99.9 42.9 L99.9 43.5 L98.7 72.4 L87.2 72 L85.8 72 L82.4 71.9 L82.4 70.6 L82.4 69.3 L84.7 69.4 L84.1 68.1 L83.8 67.5 L83.6 66.9 L83.5 66.8 L83.5 66.7 L83.4 66.6 L83.3 66.5 L83.2 66.5 L83.1 66.4 L83 66.4 L82.9 66.4 L82.8 66.4 L82.7 66.4 L82.6 66.4 L82.5 66.4 L82.5 66.5 L82.5 64.8 L82.6 64.9 L82.6 65 L82.8 65.2 L82.9 65.4 L83.1 65.6 L83.2 65.7 L83.3 65.8 L83.4 65.9 L83.6 66 L83.7 66 L84.7 63.7 L84.8 63.7 L84.8 63.6 L85 63.1 L85 63 L85.5 62 L85.6 61.9 L86 60.8 L86.1 60.7 L86.6 59.6 L86.6 59.5 L87.1 58.5 L87.1 58.3 L87.6 57.3 L87.7 57.1 L88.1 56.1 L88.7 54.9 L88.7 54.8 L89.2 53.7 L89.2 53.6 L89.7 52.5 L89.8 52.4 L90.2 51.4 L90.3 51.2 L90.8 50.2 L90.8 50.1 L91.3 49.1 L91.8 48.1 L91.9 48 L91.9 47.9 L92.5 46.8 L93 45.8 L93.1 45.6 L93.6 44.6 L93.6 44.5 L93.7 44.5 L94.2 43.5 L94.3 43.3 L94.8 42.3 L94.8 42.2 L95 41.9 L95.3 41.2 L95.4 41.1 L95.7 40.5 L95.9 40.1 L96 39.9 L96.5 39 L96.5 38.8 L94.6 37.7 L94.7 37.5 Z M81 71.5 L81.1 71.5 L81.3 71.5 L81.5 71.5 L81.6 71.5 L81.6 71.6 L81.6 71.7 L81.6 71.9 L81.4 74.7 L80 74.7 L79.9 74.7 L80.3 74 L80.3 73.9 L80.4 73.9 L80.4 73.8 L80.4 73.7 L80.5 73.6 L80.5 73.5 L80.5 73.4 L80.5 73.3 L80.5 73.2 L80.5 73.1 L80.5 73 L80.5 72.9 L80.5 72.8 L80.4 72.8 L80.4 72.7 L80.4 72.6 L80.4 72.5 L80.3 72.5 L80.3 72.4 L80 72 L80 71.9 L80 71.8 L79.9 71.8 L79.9 71.7 L79.8 71.6 L79.8 71.5 L79.7 71.5 Z" +
      ` ${hilltopZonePath}`,
    points: [
      { x: 89.2, y: 41.0, label: "Boat Launch / EWNJC", markerId: "FF-TREE-016", style: "tag" },
      { x: 95.3, y: 35.2, label: "Not a Driveway / PUQZA", markerId: "FF-TREE-017", style: "tag" },
      { x: 79.8, y: 70.5, label: "Not much of a Dam View / ETET2", markerId: "FF-TREE-018", style: "tag" },
      { x: 94.9, y: 69.6, label: "Granite Marker / TAKVU", markerId: "FF-TREE-019", style: "tag" }
    ],
    tone: "#3e5d2c"
  }
};

function getPreviewMapViewBox(
  activeSlug: string,
  activeMarkerId: string | undefined,
  zoomed: boolean
) {
  if (!zoomed || !activeMarkerId) {
    return fullMapViewBox;
  }

  const activePoint = visualZones[activeSlug]?.points?.find(
    (point) => point.markerId === activeMarkerId
  );

  if (!activePoint) {
    return fullMapViewBox;
  }

  const maxOrigin = 100 - zoomedMapViewBoxSize;
  const halfViewBox = zoomedMapViewBoxSize / 2;
  const x = Math.round(Math.max(0, Math.min(maxOrigin, activePoint.x - halfViewBox)) * 10) / 10;
  const y = Math.round(Math.max(0, Math.min(maxOrigin, activePoint.y - halfViewBox)) * 10) / 10;

  return `${x} ${y} ${zoomedMapViewBoxSize} ${zoomedMapViewBoxSize}`;
}

function hasPreviewMapMarker(activeSlug: string, activeMarkerId?: string) {
  return Boolean(
    activeMarkerId &&
      visualZones[activeSlug]?.points?.some((point) => point.markerId === activeMarkerId)
  );
}

function SelectedMarkerCallout({ label = "You are here" }: { label?: string }) {
  return (
    <g className="selected-marker-label" aria-hidden="true" transform="translate(0 -6.2)">
      <rect height="3.8" rx="1.9" width="15.6" x="-7.8" y="-3.8" />
      <path d="M-0.9 0 L0 -1 L0.9 0 Z" />
      <text x="0" y="-1.9">
        {label}
      </text>
    </g>
  );
}

function TagMapIcon({ active, selected }: { active: boolean; selected?: boolean }) {
  return (
    <g
      className={[
        "map-tag-icon",
        active ? "active" : "",
        selected ? "selected" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {selected ? (
        <SelectedMarkerRing />
      ) : active ? (
        <ellipse className="map-tag-active-halo" cx="0" cy="0" rx="2.25" ry="2.75" />
      ) : null}
      <image
        className="map-tag-image"
        height="4.4"
        href="/assets/famous-marker-tag.png"
        preserveAspectRatio="xMidYMid meet"
        width="2.2"
        x="-1.1"
        y="-2.2"
      />
    </g>
  );
}

function SelectedMarkerRing() {
  return (
    <g className="selected-marker-ring" aria-hidden="true">
      <ellipse className="selected-marker-pulse" cx="0" cy="0" rx="3.1" ry="3.45" />
      <ellipse className="selected-marker-outline" cx="0" cy="0" rx="2.85" ry="3.2" />
      <ellipse className="selected-marker-core" cx="0" cy="0" rx="2.45" ry="2.85" />
    </g>
  );
}

function renderMapPoint(
  point: NonNullable<VisualZone["points"]>[number],
  pointIndex: number,
  activeMarkerId?: string
) {
  const isActiveMarker = point.markerId === activeMarkerId;
  const isSelectedMarker = isActiveMarker;
  const accessibleLabel = isSelectedMarker
    ? `Selected marker, ${point.label}`
    : point.label;

  if (point.style === "tag") {
    return (
      <g
        aria-label={accessibleLabel}
        className={[
          "map-zone-pin",
          "map-tag-pin",
          isActiveMarker ? "active" : "",
          isSelectedMarker ? "selected" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        key={point.label}
        role="img"
        transform={`translate(${point.x} ${point.y})`}
      >
        <title>{accessibleLabel}</title>
        {isSelectedMarker ? <SelectedMarkerCallout /> : null}
        <TagMapIcon active={isActiveMarker} selected={isSelectedMarker} />
      </g>
    );
  }

  return (
    <g
      aria-label={accessibleLabel}
      className={[
        "map-zone-pin",
        "map-water-pin",
        isActiveMarker ? "active" : "",
        isSelectedMarker ? "selected" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      key={point.label}
      role="img"
      transform={`translate(${point.x} ${point.y})`}
    >
      <title>{accessibleLabel}</title>
      {isSelectedMarker ? <SelectedMarkerCallout /> : null}
      {isSelectedMarker ? <SelectedMarkerRing /> : null}
      <circle cx="0" cy="0" r="2.3" />
      <text x="0" y="0.85">
        {pointIndex + 1}
      </text>
    </g>
  );
}

function FamousLandMapSvg({
  activeSlug,
  activeMarkerId,
  ariaLabel,
  className = "square-map-svg",
  showWalkingTrails = true,
  viewBox = fullMapViewBox,
  zoneSlugs = visualZoneOrder
}: FamousLandMapSvgProps) {
  return (
    <svg aria-label={ariaLabel} className={className} role="img" viewBox={viewBox}>
      <image
        className="map-base-image"
        height="100"
        href="/assets/maps/famous-land-base-map-square-street.png"
        preserveAspectRatio="xMidYMid slice"
        width="100"
        x="0"
        y="0"
      />

      <g className="map-zone-layer">
        {zoneSlugs.map((slug) => {
          const visual = visualZones[slug];
          const isActive = slug === activeSlug;

          if (!visual) {
            return null;
          }

          return (
            <g className={isActive ? "map-section active" : "map-section"} key={slug}>
              <path d={visual.path} style={{ "--section-color": visual.tone } as CSSProperties} />
              {isActive
                ? visual.points
                    ?.filter((point) => point.markerId !== activeMarkerId)
                    .map((point, pointIndex) => renderMapPoint(point, pointIndex, activeMarkerId))
                : null}
              {isActive
                ? visual.points
                    ?.filter((point) => point.markerId === activeMarkerId)
                    .map((point, pointIndex) => renderMapPoint(point, pointIndex, activeMarkerId))
                : null}
            </g>
          );
        })}
      </g>

      {showWalkingTrails ? (
        <g className="walking-trail-layer" aria-label="NCLT walking trail overlay">
          {walkingTrails.map((trail) => (
            <g aria-label={trail.name} className="walking-trail" key={trail.name}>
              <g
                transform={
                  trail.offset ? `translate(${trail.offset.x} ${trail.offset.y})` : undefined
                }
              >
                <path className="walking-trail-halo" d={trail.path} />
                <path className="walking-trail-route" d={trail.path} />
                {trail.vistaDot ? (
                  <circle
                    className="walking-trail-vista-dot"
                    cx={trail.vistaDot.x}
                    cy={trail.vistaDot.y}
                    r="0.56"
                  />
                ) : null}
                {trail.markers.map((marker, markerIndex) => (
                  <rect
                    height="1.1"
                    key={`${trail.name}-${markerIndex}`}
                    rx="0.15"
                    style={{ "--marker-color": trail.markerColor } as CSSProperties}
                    width="1.1"
                    x={marker.x - 0.55}
                    y={marker.y - 0.55}
                  />
                ))}
              </g>
              {trail.label ? (
                <text
                  className="walking-trail-label-halo"
                  transform={`rotate(${trail.label.rotate} ${trail.label.x} ${trail.label.y})`}
                  x={trail.label.x}
                  y={trail.label.y}
                >
                  {trail.name}
                </text>
              ) : null}
              {trail.label ? (
                <text
                  className="walking-trail-label"
                  transform={`rotate(${trail.label.rotate} ${trail.label.x} ${trail.label.y})`}
                  x={trail.label.x}
                  y={trail.label.y}
                >
                  {trail.name}
                </text>
              ) : null}
            </g>
          ))}
        </g>
      ) : null}
    </svg>
  );
}

export function ZonePreviewMap({
  activeSlug,
  activeMarkerId
}: {
  activeSlug: string;
  activeMarkerId?: string;
}) {
  const [zoomed, setZoomed] = useState(false);
  const canZoom = hasPreviewMapMarker(activeSlug, activeMarkerId);
  const viewBox = getPreviewMapViewBox(activeSlug, activeMarkerId, zoomed);

  useEffect(() => {
    setZoomed(false);
  }, [activeMarkerId, activeSlug]);

  return (
    <button
      aria-label={zoomed ? "Show full marker map" : "Zoom marker map to your location"}
      aria-pressed={zoomed}
      className="square-map test-zone-map marker-map-zoom-button"
      disabled={!canZoom}
      onClick={() => setZoomed((currentZoomed) => !currentZoomed)}
      type="button"
    >
      <FamousLandMapSvg
        activeMarkerId={activeMarkerId}
        activeSlug={activeSlug}
        ariaLabel="Selected marker zone highlighted on Famous Land map"
        className="square-map-svg test-zone-map-svg"
        viewBox={viewBox}
      />
    </button>
  );
}

export function InteractiveLandMap({ zones }: InteractiveLandMapProps) {
  const selectableZones = zones.filter((zone) => visualZones[zone.slug]);
  const [activeSlug, setActiveSlug] = useState(selectableZones[0]?.slug ?? "");
  const activeZone = selectableZones.find((zone) => zone.slug === activeSlug) ?? selectableZones[0];
  const zoneSlugs = selectableZones.map((zone) => zone.slug);

  return (
    <div className="interactive-map" data-testid="interactive-map">
      <div className="map-selector" aria-label="Map section selector">
        {selectableZones.map((zone, index) => (
          <button
            aria-pressed={zone.slug === activeZone.slug}
            className={`map-selector-button ${zone.slug === activeZone.slug ? "active" : ""}`}
            data-testid={`map-selector-${zone.slug}`}
            key={zone.slug}
            onClick={() => setActiveSlug(zone.slug)}
            type="button"
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{zone.name}</strong>
          </button>
        ))}
      </div>

      <div className="square-map" aria-label={`${activeZone.name} highlighted map`}>
        <FamousLandMapSvg
          activeSlug={activeZone.slug}
          ariaLabel={`${activeZone.name} highlighted on Famous Land map`}
          zoneSlugs={zoneSlugs}
        />
      </div>
    </div>
  );
}
