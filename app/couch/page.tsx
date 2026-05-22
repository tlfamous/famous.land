import type { Metadata } from "next";
import { TestPhone } from "@/components/TestPhone";
import { markerRoute, markers } from "@/lib/markers";

export const metadata: Metadata = {
  title: "Play from your Couch",
  description: "A couch-friendly Famous Land QR quest tester."
};

const couchMarkers = markers
  .slice()
  .sort((a, b) => a.order - b.order)
  .map((marker) => ({
    marker_id: marker.marker_id,
    marker_number: marker.marker_number,
    marker_name: marker.marker_name,
    order: marker.order,
    short_code: marker.short_code,
    url: marker.url,
    zone: marker.zone,
    path: markerRoute(marker)
  }));

export default function CouchPage() {
  return (
    <div className="couch-page">
      <TestPhone markers={couchMarkers} />
    </div>
  );
}
