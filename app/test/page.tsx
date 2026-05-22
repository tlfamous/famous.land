import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { TestPhone } from "@/components/TestPhone";
import { markerRoute, markers } from "@/lib/markers";

export const metadata: Metadata = {
  title: "Famous Land Test Phone",
  description: "A test phone for walking through all Famous Land QR marker routes."
};

const testMarkers = markers
  .slice()
  .sort((a, b) => a.order - b.order)
  .map((marker) => ({
    marker_id: marker.marker_id,
    marker_number: marker.marker_number,
    marker_name: marker.marker_name,
    order: marker.order,
    url: marker.url,
    zone: marker.zone,
    path: markerRoute(marker)
  }));

export default function TestPage() {
  return (
    <AdminShell>
      <div className="test-page">
        <TestPhone markers={testMarkers} />
      </div>
    </AdminShell>
  );
}
