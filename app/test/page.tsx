import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { TestPhone } from "@/components/TestPhone";
import { getMarkersWithFieldNotes } from "@/lib/db";
import { markerRoute, markers } from "@/lib/markers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Famous Land Test Phone",
  description: "A test phone for walking through all Famous Land QR marker routes."
};

export default async function TestPage() {
  const testMarkers = (await getMarkersWithFieldNotes(markers))
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((marker) => ({
      marker_id: marker.marker_id,
      marker_number: marker.marker_number,
      marker_name: marker.marker_name,
      order: marker.order,
      field_note: marker.field_note,
      url: marker.url,
      zone: marker.zone,
      path: markerRoute(marker)
    }));

  return (
    <AdminShell>
      <div className="test-page">
        <TestPhone markers={testMarkers} />
      </div>
    </AdminShell>
  );
}
