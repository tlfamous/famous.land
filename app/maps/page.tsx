import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { InteractiveLandMap } from "@/components/InteractiveLandMap";
import {
  landMapZones,
  landParcels,
  type LandMapZone,
  mapReferenceImages,
  totalLandAcreageLabel
} from "@/lib/landParcels";

export const metadata: Metadata = {
  title: "Famous Land Maps",
  description: "Land map workspace for Famous Land parcel highlights and game maps."
};

const acreageDisplay = (acres: number | null, fallback?: string) =>
  fallback ?? (acres === null ? "TBD" : `${acres.toFixed(3)} acres`);

const itemLabel = (zone: LandMapZone) =>
  zone.parcels.length === 1
    ? (zone.unitSingular ?? "parcel")
    : (zone.unitPlural ?? "parcels");

const inventoryDisplay = (zone: LandMapZone) => {
  const parcelLabel = `${zone.parcels.length} ${itemLabel(zone)}`;
  return zone.tagCount ? `${zone.tagCount} tags / ${parcelLabel}` : parcelLabel;
};

export default function MapsPage() {
  return (
    <AdminShell>
      <div className="stack maps-page">
      <section className="hero-card maps-hero">
        <p className="eyebrow">Maps</p>
        <h1>Land Map Workspace</h1>
        <p>
          This is now survey-corrected for game-map planning. AxisGIS is still useful as
          a rough reference, but the survey and ANR split drive the land layer.
        </p>
        <div className="button-row">
          <Link className="button primary" href="/admin">
            Back to admin
          </Link>
          <Link className="button secondary" href="/test">
            Open game test
          </Link>
        </div>
      </section>

      <section className="map-workspace">
        <article className="card map-canvas-card">
          <div className="split">
            <div>
              <p className="eyebrow">Parcel layer</p>
              <h2>Famous Land zones</h2>
            </div>
            <strong>{totalLandAcreageLabel}</strong>
          </div>

          <InteractiveLandMap zones={landMapZones} />
        </article>
      </section>

      <section className="grid two">
        {landMapZones.map((zone) => (
          <article className="card map-zone-card" key={zone.slug}>
            <div>
              <p className="eyebrow">Map zone</p>
              <h2>{zone.name}</h2>
            </div>
            <p className="muted">
              {inventoryDisplay(zone)} / {acreageDisplay(zone.acres, zone.acreageLabel)}
            </p>
            {zone.note ? <p>{zone.note}</p> : null}
            <div className="parcel-chip-list" aria-label={`${zone.name} ${itemLabel(zone)}`}>
              {zone.parcels.map((parcelId) => (
                <span key={parcelId}>{parcelId}</span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="card">
        <p className="eyebrow">Survey references</p>
        <div className="survey-reference-grid">
          {mapReferenceImages.map((image) => (
            <figure className="survey-reference" key={image.src}>
              <Link href={`/maps/documents/${image.slug}`}>
                <img alt={image.label} src={image.src} />
                <figcaption>
                  <strong>{image.label}</strong>
                  <span>{image.detail}</span>
                  <em>Open full screen</em>
                </figcaption>
              </Link>
            </figure>
          ))}
        </div>
      </section>

      <section className="card">
        <p className="eyebrow">Parcel table</p>
        <div className="parcel-table-wrap">
          <table className="parcel-table">
            <thead>
              <tr>
                <th>Parcel</th>
                <th>Location</th>
                <th>Use</th>
                <th>Acres</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {landParcels.map((parcel) => (
                <tr key={parcel.parcelId}>
                  <td>{parcel.parcelId}</td>
                  <td>{parcel.location}</td>
                  <td>{parcel.useCode}</td>
                  <td>{acreageDisplay(parcel.acres, parcel.acreageLabel)}</td>
                  <td>{parcel.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      </div>
    </AdminShell>
  );
}
