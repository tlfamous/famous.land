import type { Metadata } from "next";
import { TestPhone } from "@/components/TestPhone";
import { getMarkersWithFieldNotes } from "@/lib/db";
import { markerRoute, markers } from "@/lib/markers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Coming July 2026",
  description: "A couch-friendly Famous Land QR quest tester."
};

export default async function CouchPage() {
  const couchMarkers = (await getMarkersWithFieldNotes(markers))
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((marker) => ({
      marker_id: marker.marker_id,
      marker_number: marker.marker_number,
      marker_name: marker.marker_name,
      order: marker.order,
      short_code: marker.short_code,
      field_note: marker.field_note,
      url: marker.url,
      zone: marker.zone,
      path: markerRoute(marker)
    }));

  return (
    <div className="couch-page">
      <TestPhone markers={couchMarkers} />
    </div>
  );
}
