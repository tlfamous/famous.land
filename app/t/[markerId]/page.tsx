import { notFound } from "next/navigation";
import { MarkerScanClient } from "@/components/MarkerScanClient";
import { getMarkerByToken, markers } from "@/lib/markers";

export function generateStaticParams() {
  return markers.map((marker) => ({
    markerId: marker.marker_id
  }));
}

export default async function MarkerByIdPage({
  params
}: {
  params: Promise<{ markerId: string }>;
}) {
  const { markerId } = await params;
  const marker = getMarkerByToken(markerId);

  if (!marker) {
    notFound();
  }

  return <MarkerScanClient marker={marker} />;
}
